import json
import asyncio
from telethon import TelegramClient

API_ID = 6372419
API_HASH = 'f0d104a2db47caa06a9d569431345b59'
CHANNEL_USERNAME = -1001423595432
APPS_FILE = 'apps.json'

async def main():
    print("Loading apps.json...")
    try:
        with open(APPS_FILE, 'r', encoding='utf-8') as f:
            apps = json.load(f)
    except Exception as e:
        print(f"Error loading apps.json: {e}")
        return

    # Create a quick lookup dictionary by message ID
    apps_by_id = {str(app['id']): app for app in apps if 'id' in app}
    print(f"Loaded {len(apps_by_id)} apps to update.")

    print("Logging into Telegram via MTProto as a User...")
    client = TelegramClient('user_session', API_ID, API_HASH)
    await client.start()
    
    updated_count = 0
    
    print(f"Iterating through channel history...")
    try:
        async for message in client.iter_messages(CHANNEL_USERNAME):
            msg_id = str(message.id)
            if msg_id in apps_by_id:
                app = apps_by_id[msg_id]
                
                # Extract original date
                if getattr(message, 'fwd_from', None) and getattr(message.fwd_from, 'date', None):
                    app['date'] = int(message.fwd_from.date.timestamp())
                elif getattr(message, 'date', None):
                    app['date'] = int(message.date.timestamp())
                else:
                    app['date'] = 0
                    
                updated_count += 1
                
                if updated_count % 100 == 0:
                    print(f"Updated {updated_count} apps so far...")
    except Exception as e:
        print(f"Error during extraction: {e}")
    finally:
        await client.disconnect()

    print(f"Finished! Successfully updated dates for {updated_count} apps.")
    
    # Save back to apps.json
    with open(APPS_FILE, 'w', encoding='utf-8') as f:
        json.dump(apps, f, ensure_ascii=False, separators=(',', ':'))
        
    print("Saved perfect dates to apps.json!")

if __name__ == '__main__':
    asyncio.run(main())
