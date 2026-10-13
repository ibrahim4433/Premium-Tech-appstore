import os
import json
import re
import asyncio
from telethon import TelegramClient, utils
from telethon.tl.types import MessageMediaPhoto, MessageMediaDocument, PeerChannel, ChannelParticipantsAdmins

API_ID = 6372419
API_HASH = 'f0d104a2db47caa06a9d569431345b59'

# Target group details
GROUP_CHAT_ID = -1002471318704
GROUP_LINK = 'https://t.me/+xl6Nl7FDCrQyOGU0'
APPS_FILE = 'apps.json'

def extract_text_info(text):
    app_data = {'name': '', 'description': '', 'version': '', 'category': 'Apps', 'tags': []}
    lines = text.split('\n')
    for line in lines:
        line_stripped = line.strip()
        if '🧩 تطبيق' in line_stripped:
            app_data['name'] = line_stripped.split('🧩 تطبيق')[-1].strip()
            app_data['category'] = 'Apps'
        elif '🎮 لعبة' in line_stripped:
            app_data['name'] = line_stripped.split('🎮 لعبة')[-1].strip()
            app_data['category'] = 'Games'
    return app_data

async def main():
    print(f"=== Telegram Group Screenshots Scraper ===")
    print(f"Loading {APPS_FILE}...")
    
    if not os.path.exists(APPS_FILE):
        print(f"Error: {APPS_FILE} does not exist.")
        return

    with open(APPS_FILE, 'r', encoding='utf-8') as f:
        apps = json.load(f)

    print(f"Loaded {len(apps)} apps from {APPS_FILE}.")

    # Build fast lookup indexes
    apps_by_id = {}
    apps_by_filename = {}
    apps_by_name = {}

    for app in apps:
        if 'id' in app and app['id']:
            apps_by_id[str(app['id'])] = app
        if 'file_name' in app and app['file_name']:
            apps_by_filename[app['file_name'].strip().lower()] = app
        if 'name' in app and app['name']:
            apps_by_name[app['name'].strip().lower()] = app

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

    group_msg_to_app = {}
    album_to_app = {}
    total_screenshots_found = 0
    apps_updated = set()
    message_count = 0

    print("Scanning group message history from oldest to newest (reverse=True)...")

    try:
        async for msg in client.iter_messages(group_entity, reverse=True):
            message_count += 1
            if message_count % 200 == 0:
                print(f"Processed {message_count} messages... (Found {total_screenshots_found} screenshots across {len(apps_updated)} apps so far)")

            # 1. Check if msg is a forwarded post from the channel
            matched_app = None

            # 1a. Match by forward origin message ID
            if getattr(msg, 'fwd_from', None) and msg.fwd_from.channel_post:
                orig_post_id = str(msg.fwd_from.channel_post)
                if orig_post_id in apps_by_id:
                    matched_app = apps_by_id[orig_post_id]
                else:
                    try:
                        int_id = int(orig_post_id)
                        if str(int_id + 1) in apps_by_id:
                            matched_app = apps_by_id[str(int_id + 1)]
                        elif str(int_id - 1) in apps_by_id:
                            matched_app = apps_by_id[str(int_id - 1)]
                    except Exception:
                        pass

            # 1b. Match by document file name
            if not matched_app and getattr(msg, 'file', None) and getattr(msg.file, 'name', None):
                fn = msg.file.name.strip().lower()
                if fn in apps_by_filename:
                    matched_app = apps_by_filename[fn]

            # 1c. Match by caption text (🧩 تطبيق / 🎮 لعبة)
            if not matched_app and msg.text and ('🧩 تطبيق' in msg.text or '🎮 لعبة' in msg.text):
                info = extract_text_info(msg.text)
                name_key = info.get('name', '').strip().lower()
                if name_key in apps_by_name:
                    matched_app = apps_by_name[name_key]

            # Cache mapping for forwarded message
            if matched_app:
                group_msg_to_app[msg.id] = matched_app

            # 2. Check if msg is a photo posted as a reply
            if isinstance(msg.media, MessageMediaPhoto):
                # Verify sender is admin or anonymous admin
                is_admin = False
                if getattr(msg, 'sender_id', None) == GROUP_CHAT_ID:
                    is_admin = True
                elif getattr(msg, 'from_id', None) is None:
                    is_admin = True
                elif isinstance(getattr(msg, 'from_id', None), PeerChannel):
                    is_admin = True
                elif getattr(msg, 'sender_id', None) in admin_ids:
                    is_admin = True
                elif not admin_ids: # fallback if admins list could not be fetched
                    is_admin = True

                if not is_admin:
                    continue

                reply_id = getattr(msg, 'reply_to_msg_id', None) or (msg.reply_to.reply_to_msg_id if getattr(msg, 'reply_to', None) else None)
                target_app = None

                if reply_id and reply_id in group_msg_to_app:
                    target_app = group_msg_to_app[reply_id]
                elif msg.grouped_id and msg.grouped_id in album_to_app:
                    target_app = album_to_app[msg.grouped_id]
                elif reply_id:
                    # Dynamically fetch the replied message if not yet mapped
                    try:
                        replied_msg = await msg.get_reply_message()
                        if replied_msg:
                            # Try matching replied message
                            if getattr(replied_msg, 'fwd_from', None) and replied_msg.fwd_from.channel_post:
                                pid = str(replied_msg.fwd_from.channel_post)
                                target_app = apps_by_id.get(pid)
                            if not target_app and getattr(replied_msg, 'file', None) and getattr(replied_msg.file, 'name', None):
                                target_app = apps_by_filename.get(replied_msg.file.name.strip().lower())
                            if not target_app and replied_msg.text and ('🧩 تطبيق' in replied_msg.text or '🎮 لعبة' in replied_msg.text):
                                r_info = extract_text_info(replied_msg.text)
                                target_app = apps_by_name.get(r_info.get('name', '').strip().lower())
                            
                            if target_app:
                                group_msg_to_app[reply_id] = target_app
                    except Exception as e:
                        pass

                if target_app:
                    photo_id = utils.pack_bot_file_id(msg.media)
                    if 'screenshots' not in target_app:
                        target_app['screenshots'] = []
                    if photo_id not in target_app['screenshots']:
                        target_app['screenshots'].append(photo_id)
                        total_screenshots_found += 1
                        apps_updated.add(target_app.get('name', 'Unknown'))
                        print(f"[{len(apps_updated)}] Added screenshot for '{target_app.get('name')}': {photo_id[:20]}...")

                    if msg.grouped_id:
                        album_to_app[msg.grouped_id] = target_app
                    group_msg_to_app[msg.id] = target_app

    except Exception as e:
        print(f"Error during iteration: {e}")
    finally:
        await client.disconnect()

    print("\n" + "=" * 50)
    print(f"Scraping complete! Processed {message_count} total messages.")
    print(f"Total screenshots collected: {total_screenshots_found}")
    print(f"Apps updated with screenshots: {len(apps_updated)}")
    print("=" * 50)

    if total_screenshots_found > 0:
        print(f"Saving updated data to {APPS_FILE}...")
        with open(APPS_FILE, 'w', encoding='utf-8') as f:
            json.dump(apps, f, ensure_ascii=False, separators=(',', ':'))
        print("Successfully saved apps.json with all screenshots!")
    else:
        print("No new screenshots were found to save.")

if __name__ == '__main__':
    asyncio.run(main())
