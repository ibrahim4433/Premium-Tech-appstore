import os
import json
import re
import asyncio
from telethon import TelegramClient
from telethon.tl.types import MessageMediaDocument, MessageMediaPhoto
from telethon import utils

API_ID = 6372419
API_HASH = 'f0d104a2db47caa06a9d569431345b59'
BOT_TOKEN = os.environ.get('TELEGRAM_BOT_TOKEN')
CHANNEL_USERNAME = 'premium_techs'
APPS_FILE = 'apps.json'

def extract_text_info(text):
    app_data = {'name': 'Unknown App', 'description': '', 'version': '', 'category': 'Apps', 'tags': []}
    
    app_data['tags'] = list(set(re.findall(r'#\w+', text)))
    
    lines = text.split('\n')
    desc_lines = []
    in_desc = False
    
    for line in lines:
        line_stripped = line.strip()
        
        if '🧩 تطبيق' in line_stripped:
            app_data['name'] = line_stripped.split('🧩 تطبيق')[-1].strip()
            app_data['category'] = 'Apps'
        elif '🎮 لعبة' in line_stripped:
            app_data['name'] = line_stripped.split('🎮 لعبة')[-1].strip()
            app_data['category'] = 'Games'
            
        elif '🧊 الإصدار' in line_stripped:
            app_data['version'] = line_stripped.split(':')[-1].strip() if ':' in line_stripped else line_stripped.replace('🧊 الإصدار', '').strip()
            if in_desc:
                desc_lines.append(line_stripped)
            
        elif 'الوصف' in line_stripped and ('⚡' in line_stripped or '⚡️' in line_stripped):
            in_desc = True
            if ':' in line_stripped:
                desc_text = line_stripped.split(':', 1)[-1].strip()
                if desc_text:
                    desc_lines.append(desc_text)
                    
        elif '༺' in line_stripped or line_stripped.startswith('للتنزيل') or 'تم التعديل' in line_stripped:
            in_desc = False
            
        elif in_desc:
            if not line_stripped.startswith('#'):
                desc_lines.append(line_stripped)
            
    app_data['description'] = '\n'.join(desc_lines).strip()
    return app_data

async def main():
    if not BOT_TOKEN:
        print("Error: TELEGRAM_BOT_TOKEN environment variable not set.")
        return

    print("Logging into Telegram via MTProto...")
    client = TelegramClient('bot_session', API_ID, API_HASH)
    await client.start(bot_token=BOT_TOKEN)
    
    print(f"Scraping history from @{CHANNEL_USERNAME}...")
    
    apps = []
    pending_app = None
    
    async for message in client.iter_messages(CHANNEL_USERNAME, reverse=True):
        if isinstance(message.media, MessageMediaPhoto) and message.text:
            text = message.text
            if '🧩 تطبيق' in text or '🎮 لعبة' in text:
                pending_app = extract_text_info(text)
                pending_app['icon_id'] = utils.pack_bot_file_id(message.media)
                print(f"Found info for: {pending_app['name']}")
                
        elif isinstance(message.media, MessageMediaDocument):
            if pending_app and 'name' in pending_app:
                doc = message.media.document
                pending_app['file_id'] = utils.pack_bot_file_id(message.media)
                
                file_name = 'Download.apk'
                for attr in doc.attributes:
                    if hasattr(attr, 'file_name'):
                        file_name = attr.file_name
                        break
                        
                pending_app['file_name'] = file_name
                pending_app['size'] = doc.size
                pending_app['id'] = str(message.id)
                
                apps = [a for a in apps if a.get('name', '').strip().lower() != pending_app['name'].strip().lower()]
                apps.insert(0, pending_app)
                print(f"Successfully added app: {pending_app['name']} with its APK file!")
                pending_app = None

    print(f"Total apps extracted: {len(apps)}")
    
    if apps:
        with open(APPS_FILE, 'w', encoding='utf-8') as f:
            json.dump(apps, f, indent=4, ensure_ascii=False)
        print("Saved all apps to apps.json!")

if __name__ == "__main__":
    asyncio.run(main())
