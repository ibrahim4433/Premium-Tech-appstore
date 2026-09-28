import os
import json
import requests
import re

BOT_TOKEN = os.environ.get('TELEGRAM_BOT_TOKEN')
APPS_FILE = 'apps.json'
OFFSET_FILE = 'offset.txt'
PENDING_FILE = 'pending_app.json'

def get_offset():
    if os.path.exists(OFFSET_FILE):
        with open(OFFSET_FILE, 'r') as f:
            content = f.read().strip()
            return int(content) if content else 0
    return 0

def save_offset(offset):
    with open(OFFSET_FILE, 'w') as f:
        f.write(str(offset))

def load_apps():
    if os.path.exists(APPS_FILE):
        with open(APPS_FILE, 'r') as f:
            try:
                return json.load(f)
            except:
                return []
    return []

def save_apps(apps):
    with open(APPS_FILE, 'w', encoding='utf-8') as f:
        json.dump(apps, f, indent=4, ensure_ascii=False)

def load_pending():
    if os.path.exists(PENDING_FILE):
        try:
            with open(PENDING_FILE, 'r', encoding='utf-8') as f:
                return json.load(f)
        except:
            return {}
    return {}

def save_pending(pending):
    with open(PENDING_FILE, 'w', encoding='utf-8') as f:
        json.dump(pending, f, ensure_ascii=False)

def extract_text_info(text):
    app_data = {'name': 'Unknown App', 'description': '', 'version': '', 'category': 'Apps', 'tags': []}
    
    # Extract tags (e.g., #games, #Social)
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
            # Don't add lines that are just tags
            if not line_stripped.startswith('#'):
                desc_lines.append(line_stripped)
            
    app_data['description'] = '\n'.join(desc_lines).strip()
    return app_data

def main():
    if not BOT_TOKEN:
        print("Error: TELEGRAM_BOT_TOKEN environment variable not set.")
        return

    offset = get_offset()
    apps = load_apps()
    current_app = load_pending()
    
    print(f"Fetching updates from offset: {offset}")
    url = f"https://api.telegram.org/bot{BOT_TOKEN}/getUpdates"
    params = {'offset': offset, 'timeout': 10, 'allowed_updates': ['channel_post']}
    response = requests.get(url, params=params)
    updates = response.json().get('result', []) if response.status_code == 200 else []
    
    highest_offset = offset
    added_count = 0
    
    for update in updates:
        update_id = update['update_id']
        highest_offset = max(highest_offset, update_id + 1)
        
        message = update.get('channel_post')
        if not message:
            continue
            
        # Check for Message 1: Photo + Caption (App Info)
        if 'photo' in message and ('caption' in message or 'text' in message):
            text = message.get('caption', message.get('text', ''))
            if '🧩 تطبيق' in text or '🎮 لعبة' in text:
                current_app = extract_text_info(text)
                current_app['icon_id'] = message['photo'][-1]['file_id']
                save_pending(current_app)
                print(f"Found info for: {current_app['name']}, waiting for APK...")
                
        # Check for Message 2: Document (APK)
        elif 'document' in message:
            if current_app and 'name' in current_app:
                current_app['file_id'] = message['document']['file_id']
                current_app['file_name'] = message['document'].get('file_name', 'Download.apk')
                current_app['size'] = message['document'].get('file_size', 0)
                current_app['id'] = str(message['message_id'])
                
                # Add to database
                apps = [a for a in apps if a.get('id') != current_app['id']]
                apps.insert(0, current_app)
                added_count += 1
                print(f"Successfully added app: {current_app['name']} with its APK file!")
                
                # Reset pending state
                current_app = {}
                save_pending(current_app)

    if added_count > 0:
        save_apps(apps)
        
    save_offset(highest_offset)
    print(f"Processed {added_count} new apps.")

if __name__ == "__main__":
    main()
