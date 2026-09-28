import os
import json
import requests

BOT_TOKEN = os.environ.get('TELEGRAM_BOT_TOKEN')
APPS_FILE = 'apps.json'
OFFSET_FILE = 'offset.txt'

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
    with open(APPS_FILE, 'w') as f:
        json.dump(apps, f, indent=4)

def fetch_updates(offset):
    url = f"https://api.telegram.org/bot{BOT_TOKEN}/getUpdates"
    params = {'offset': offset, 'timeout': 10, 'allowed_updates': ['channel_post']}
    response = requests.get(url, params=params)
    if response.status_code == 200:
        return response.json().get('result', [])
    return []

def extract_app_info(message):
    app_data = {}
    
    if 'document' in message:
        app_data['file_id'] = message['document']['file_id']
        app_data['file_name'] = message['document'].get('file_name', 'Download')
        app_data['size'] = message['document'].get('file_size', 0)
    else:
        return None # Only care about posts with files (APKs/ZIPs)
        
    text = message.get('caption') or message.get('text', '')
    lines = [line.strip() for line in text.split('\n') if line.strip()]
    
    if lines:
        app_data['name'] = lines[0]
        app_data['description'] = '\n'.join(lines[1:]) if len(lines) > 1 else 'No description provided.'
    else:
        app_data['name'] = app_data.get('file_name', 'Unknown App')
        app_data['description'] = 'No description provided.'

    # Handle image (thumbnail)
    if 'document' in message and 'thumbnail' in message['document']:
         app_data['icon_id'] = message['document']['thumbnail']['file_id']
    elif 'photo' in message:
         app_data['icon_id'] = message['photo'][-1]['file_id']
         
    return app_data

def main():
    if not BOT_TOKEN:
        print("Error: TELEGRAM_BOT_TOKEN environment variable not set.")
        return

    offset = get_offset()
    apps = load_apps()
    
    print(f"Fetching updates from offset: {offset}")
    updates = fetch_updates(offset)
    
    highest_offset = offset
    added_count = 0
    
    for update in updates:
        update_id = update['update_id']
        highest_offset = max(highest_offset, update_id + 1)
        
        message = update.get('channel_post')
        if not message:
            continue
            
        app_info = extract_app_info(message)
        if app_info:
            app_info['id'] = str(message['message_id'])
            
            # Remove older version of the same app post if we are editing
            apps = [a for a in apps if a.get('id') != app_info['id']]
            
            # Insert at the beginning (newest first)
            apps.insert(0, app_info) 
            added_count += 1
            print(f"Added/Updated app: {app_info['name']}")

    if added_count > 0:
        save_apps(apps)
        save_offset(highest_offset)
        print(f"Successfully processed {added_count} app updates.")
    else:
        print("No new apps found.")
        save_offset(highest_offset) # Save offset anyway to skip these updates next time

if __name__ == "__main__":
    main()
