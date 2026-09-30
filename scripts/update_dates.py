import json
import asyncio
from telethon import TelegramClient

API_ID = 6372419
API_HASH = 'f0d104a2db47caa06a9d569431345b59'
CHANNEL_INVITE = 'https://t.me/+ij7-LS669ahhMDFk'
APPS_FILE = 'apps.json'

async def main():
    print("Loading apps.json...")
    try:
        with open(APPS_FILE, 'r', encoding='utf-8') as f:
            apps = json.load(f)
    except Exception as e:
        print(f"Error loading apps.json: {e}")
        return

    # Lookup dict by app name (in case IDs change or to match securely)
    apps_by_name = {app['name'].strip().lower(): app for app in apps if 'name' in app}
    print(f"Loaded {len(apps_by_name)} apps to update.")

    print("Logging into Telegram via MTProto as a User...")
    client = TelegramClient('user_session', API_ID, API_HASH)
    await client.start()
    
    print(f"Resolving channel: {CHANNEL_INVITE} ...")
    try:
        channel = await client.get_entity(CHANNEL_INVITE)
    except Exception as e:
        print(f"Error resolving channel: {e}")
        return
    
    updated_count = 0
    
    print(f"Iterating through channel history to fetch dates...")
    try:
        async for message in client.iter_messages(channel):
            text = getattr(message, 'text', '') or getattr(message, 'message', '')
            if not text:
                continue
                
            # Quick check if it's an app post
            if '🧩 تطبيق' in text or '🎮 لعبة' in text:
                # Find the name in the text
                lines = text.strip().split('\n')
                name = ""
                for line in lines:
                    line_stripped = line.strip()
                    if line_stripped.startswith('🧩 تطبيق') or line_stripped.startswith('🎮 لعبة'):
                        name = line_stripped.replace('🧩 تطبيق', '').replace('🎮 لعبة', '').replace(':', '').replace('؛', '').strip()
                        break
                
                if name:
                    lookup_name = name.lower()
                    if lookup_name in apps_by_name:
                        app = apps_by_name[lookup_name]
                        # Set precise date
                        if getattr(message, 'fwd_from', None) and getattr(message.fwd_from, 'date', None):
                            app['date'] = int(message.fwd_from.date.timestamp())
                        elif getattr(message, 'date', None):
                            app['date'] = int(message.date.timestamp())
                            
                        # Also update chat_id to the new private channel ID just in case
                        app['chat_id'] = str(message.chat_id)
                        app['id'] = str(message.id)
                        
                        updated_count += 1
                        if updated_count % 100 == 0:
                            print(f"Updated {updated_count} apps so far...")
    except Exception as e:
        print(f"Error during extraction: {e}")
    finally:
        await client.disconnect()

    print(f"Finished! Successfully updated dates for {updated_count} apps from the private channel.")
    
    # Save back to apps.json
    with open(APPS_FILE, 'w', encoding='utf-8') as f:
        json.dump(apps, f, ensure_ascii=False, separators=(',', ':'))
        
    print("Saved perfect dates to apps.json!")

if __name__ == '__main__':
    asyncio.run(main())
