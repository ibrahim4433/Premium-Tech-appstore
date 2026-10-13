import os
import json
import re
import asyncio
from telethon import TelegramClient
from telethon.tl.types import MessageMediaPhoto, PeerChannel, ChannelParticipantsAdmins

try:
    from PIL import Image
    HAS_PIL = True
except ImportError:
    HAS_PIL = False

API_ID = 6372419
API_HASH = 'f0d104a2db47caa06a9d569431345b59'

# Target group details
GROUP_CHAT_ID = -1002471318704
GROUP_LINK = 'https://t.me/+xl6Nl7FDCrQyOGU0'
APPS_FILE = 'apps.json'
SCREENSHOTS_DIR = os.path.join('assets', 'screenshots')

def clean_str(s):
    if not s:
        return ''
    return re.sub(r'[*`_~]', '', s)

def extract_text_name(text):
    if not text:
        return ''
    for line in text.split('\n'):
        if '🧩 تطبيق' in line:
            return re.sub(r'\s+', ' ', line.split('🧩 تطبيق')[-1]).strip().lower()
        if '🎮 لعبة' in line:
            return re.sub(r'\s+', ' ', line.split('🎮 لعبة')[-1]).strip().lower()
    return ''

def find_app_from_msg(m, apps_by_id, apps_by_filename, apps_by_name):
    if not m:
        return None

    # 1. Forward origin ID (channel_post)
    if getattr(m, 'fwd_from', None) and m.fwd_from.channel_post:
        pid = str(m.fwd_from.channel_post)
        matched = apps_by_id.get(pid) or apps_by_id.get(str(int(pid) + 1)) or apps_by_id.get(str(int(pid) - 1))
        if matched:
            return matched

    # 2. Document file name
    if getattr(m, 'file', None) and getattr(m.file, 'name', None):
        fn = re.sub(r'\s+', ' ', m.file.name).strip().lower()
        if fn in apps_by_filename:
            return apps_by_filename[fn]

    # 3. Filename mentioned in message text
    if m.text:
        cleaned_text = clean_str(m.text)

        # Match .apk / .zip filenames in text
        found_files = re.findall(r'([a-zA-Z0-9_\-\.\s]+@premium_techs\.(?:apk|zip))', cleaned_text, re.IGNORECASE)
        for ff in found_files:
            clean_ff = re.sub(r'\s+', ' ', ff).strip().lower()
            if clean_ff in apps_by_filename:
                return apps_by_filename[clean_ff]

        # Check first line
        first_line = re.sub(r'\s+', ' ', cleaned_text.split('\n')[0]).strip().lower()
        if first_line in apps_by_filename:
            return apps_by_filename[first_line]

        # Extract app name before @premium_techs
        m_app = re.search(r'([a-zA-Z0-9\s\.\-_]+)@premium_techs', cleaned_text, re.IGNORECASE)
        if m_app:
            cand_name = re.sub(r'\s+', ' ', m_app.group(1)).strip().lower()
            if cand_name in apps_by_name:
                return apps_by_name[cand_name]

    # 4. App / Game name in description
    if m.text:
        nm = extract_text_name(m.text)
        if nm and nm in apps_by_name:
            return apps_by_name[nm]

    return None

async def main():
    print("=== Telegram Group Screenshots Scraper ===")
    print(f"Loading {APPS_FILE}...")

    if not os.path.exists(APPS_FILE):
        print(f"Error: {APPS_FILE} does not exist.")
        return

    with open(APPS_FILE, 'r', encoding='utf-8') as f:
        apps = json.load(f)

    print(f"Loaded {len(apps)} apps from {APPS_FILE}.")

    os.makedirs(SCREENSHOTS_DIR, exist_ok=True)

    # Build fast lookup indexes
    apps_by_id = {str(a['id']): a for a in apps if 'id' in a and a['id']}
    apps_by_filename = {re.sub(r'\s+', ' ', a['file_name']).strip().lower(): a for a in apps if 'file_name' in a and a['file_name']}
    apps_by_name = {re.sub(r'\s+', ' ', a['name']).strip().lower(): a for a in apps if 'name' in a and a['name']}

    string_session = os.environ.get('TELEGRAM_STRING_SESSION')
    if string_session:
        from telethon.sessions import StringSession
        print("Logging into Telegram via StringSession...")
        client = TelegramClient(StringSession(string_session), API_ID, API_HASH)
        await client.start()
    else:
        print("Logging into Telegram via local user_session...")
        client = TelegramClient('user_session', API_ID, API_HASH)
        await client.start()

    print(f"Resolving group entity (ID: {GROUP_CHAT_ID})...")
    try:
        group_entity = await client.get_entity(GROUP_CHAT_ID)
    except Exception as e:
        print(f"Failed by ID ({e}), resolving via invite link {GROUP_LINK}...")
        try:
            group_entity = await client.get_entity(GROUP_LINK)
        except Exception as e2:
            print(f"Error joining/resolving group: {e2}")
            await client.disconnect()
            return

    # Cache admin IDs for verifying admin replies
    admin_ids = set()
    try:
        admins = await client.get_participants(group_entity, filter=ChannelParticipantsAdmins)
        for admin in admins:
            admin_ids.add(admin.id)
        print(f"Found {len(admin_ids)} group administrators.")
    except Exception as e:
        print(f"Note: Could not fetch admin participant list ({e}), will rely on sender_chat and anonymous tags.")

    print("Fetching group message history...")
    messages = await client.get_messages(group_entity, limit=500)
    msg_map = {m.id: m for m in messages}
    print(f"Successfully fetched {len(messages)} messages from group.")

    # 1. Map forwarded / app messages
    group_msg_to_app = {}
    for m in messages:
        matched = find_app_from_msg(m, apps_by_id, apps_by_filename, apps_by_name)
        if matched:
            group_msg_to_app[m.id] = matched

    print(f"Mapped {len(group_msg_to_app)} group messages directly to apps in store.")

    # 2. Process screenshot photos
    album_to_app = {}
    total_screenshots_saved = 0
    apps_updated = set()

    # Sort oldest to newest so album replies establish parent mapping first
    for msg in sorted(messages, key=lambda x: x.id):
        if not isinstance(msg.media, MessageMediaPhoto):
            continue

        # Check sender: admin, anonymous admin, or linked channel
        is_admin = False
        if getattr(msg, 'sender_id', None) == GROUP_CHAT_ID:
            is_admin = True
        elif getattr(msg, 'from_id', None) is None:
            is_admin = True
        elif isinstance(getattr(msg, 'from_id', None), PeerChannel):
            is_admin = True
        elif getattr(msg, 'sender_id', None) in admin_ids:
            is_admin = True
        elif not admin_ids:
            is_admin = True

        if not is_admin:
            continue

        reply_id = getattr(msg, 'reply_to_msg_id', None) or (msg.reply_to.reply_to_msg_id if getattr(msg, 'reply_to', None) else None)
        target_app = None

        if reply_id and reply_id in group_msg_to_app:
            target_app = group_msg_to_app[reply_id]
        elif msg.grouped_id and msg.grouped_id in album_to_app:
            target_app = album_to_app[msg.grouped_id]
        elif reply_id and reply_id in msg_map:
            target_app = find_app_from_msg(msg_map[reply_id], apps_by_id, apps_by_filename, apps_by_name)
            if target_app:
                group_msg_to_app[reply_id] = target_app

        if not target_app:
            continue

        # Build clean filename
        app_id_clean = str(target_app.get('id', 'app')).replace('/', '_')
        dest_filename = f"{app_id_clean}_{msg.id}.webp" if HAS_PIL else f"{app_id_clean}_{msg.id}.jpg"
        dest_filepath = os.path.join(SCREENSHOTS_DIR, dest_filename)
        rel_path = f"assets/screenshots/{dest_filename}"

        # Download media if not already downloaded
        if not os.path.exists(dest_filepath):
            temp_filepath = os.path.join(SCREENSHOTS_DIR, f"temp_{msg.id}.jpg")
            try:
                await client.download_media(msg.photo, file=temp_filepath)
                if HAS_PIL and os.path.exists(temp_filepath):
                    with Image.open(temp_filepath) as pil_img:
                        pil_img.save(dest_filepath, "WEBP", quality=82)
                    if os.path.exists(temp_filepath):
                        os.remove(temp_filepath)
                elif os.path.exists(temp_filepath):
                    os.rename(temp_filepath, dest_filepath)
            except Exception as dl_err:
                print(f"Error downloading photo {msg.id} for '{target_app.get('name')}': {dl_err}")
                if os.path.exists(temp_filepath):
                    try:
                        os.remove(temp_filepath)
                    except Exception:
                        pass
                continue

        # Add to app screenshots list
        if 'screenshots' not in target_app:
            target_app['screenshots'] = []

        if rel_path not in target_app['screenshots']:
            target_app['screenshots'].append(rel_path)
            total_screenshots_saved += 1
            apps_updated.add(target_app.get('name', 'Unknown'))
            print(f"[{len(apps_updated)}] Added screenshot for '{target_app.get('name')}': {dest_filename}")

        if msg.grouped_id:
            album_to_app[msg.grouped_id] = target_app
        group_msg_to_app[msg.id] = target_app

    await client.disconnect()

    print("\n" + "=" * 50)
    print(f"Scraping complete! Processed {len(messages)} total messages.")
    print(f"Total screenshots saved: {total_screenshots_saved}")
    print(f"Apps updated with screenshots: {len(apps_updated)}")
    print("=" * 50)

    if total_screenshots_saved > 0:
        print(f"Saving updated data to {APPS_FILE}...")
        with open(APPS_FILE, 'w', encoding='utf-8') as f:
            json.dump(apps, f, ensure_ascii=False, separators=(',', ':'))
        print("Successfully saved apps.json with all screenshots!")
    else:
        print("No new screenshots to save.")

if __name__ == '__main__':
    asyncio.run(main())
