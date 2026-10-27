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
        with open(APPS_FILE, 'r', encoding='utf-8') as f:
            try:
                apps = json.load(f)
                # Aggressive deduplication on load to clean up any existing duplicates
                seen = set()
                dedup_apps = []
                for app in apps:
                    name = app.get('name', '').strip().lower()
                    if name and name not in seen:
                        seen.add(name)
                        dedup_apps.append(app)
                return dedup_apps
            except:
                return []
    return []

def save_apps(apps):
    with open(APPS_FILE, 'w', encoding='utf-8') as f:
        # Minify JSON output to save space and reduce download time
        json.dump(apps, f, ensure_ascii=False, separators=(',', ':'))

def update_seo_html(apps):
    import datetime
    
    # Update index.html
    html_file = 'index.html'
    if os.path.exists(html_file):
        with open(html_file, 'r', encoding='utf-8') as f:
            html_content = f.read()
            
        seo_html = "<!-- SEO_APPS_START -->\n"
        for app in apps:
            name = app.get('name', 'Unknown')
            desc = app.get('description', '').replace('\n', ' ')
            # Truncate description to prevent huge file size
            desc = (desc[:150] + '...') if len(desc) > 150 else desc
            seo_html += f"            <article><h3>{name}</h3><p>{desc}</p></article>\n"
        seo_html += "            <!-- SEO_APPS_END -->"
        
        import re
        new_html = re.sub(r'<!-- SEO_APPS_START -->.*?<!-- SEO_APPS_END -->', seo_html, html_content, flags=re.DOTALL)
        
        with open(html_file, 'w', encoding='utf-8') as f:
            f.write(new_html)
            
    # Update sitemap.xml date
    sitemap_file = 'sitemap.xml'
    if os.path.exists(sitemap_file):
        with open(sitemap_file, 'r', encoding='utf-8') as f:
            sitemap_content = f.read()
            
        today = datetime.datetime.now().strftime("%Y-%m-%d")
        import re
        new_sitemap = re.sub(r'<lastmod>.*?</lastmod>', f'<lastmod>{today}T00:00:00+00:00</lastmod>', sitemap_content)
        
        with open(sitemap_file, 'w', encoding='utf-8') as f:
            f.write(new_sitemap)

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
    
    # Language Detection (simple heuristic based on Arabic characters ratio)
    arabic_chars = len(re.findall(r'[\u0600-\u06FF]', text))
    total_chars = len(text.replace(' ', ''))
    app_data['lang'] = 'ar' if (total_chars > 0 and (arabic_chars / total_chars) > 0.1) else 'en'
    
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

GROUP_CHAT_ID = os.environ.get('TELEGRAM_GROUP_ID', '-1002471318704')
ADMIN_CACHE = {}

def is_admin_sender(message):
    chat = message.get('chat', {})
    chat_id = str(chat.get('id', ''))
    
    # 1. Anonymous admin posting as the group
    sender_chat = message.get('sender_chat', {})
    if sender_chat:
        sender_chat_id = str(sender_chat.get('id', ''))
        if sender_chat_id == chat_id or sender_chat_id == str(GROUP_CHAT_ID):
            return True

    # 2. Telegram GroupAnonymousBot
    from_user = message.get('from', {})
    if from_user.get('username') == 'GroupAnonymousBot' or from_user.get('id') == 1087968824:
        return True

    # 3. Check admin status for normal user accounts in group
    user_id = from_user.get('id')
    if user_id:
        if user_id in ADMIN_CACHE:
            return ADMIN_CACHE[user_id]
        if BOT_TOKEN and chat_id:
            try:
                res = requests.get(
                    f"https://api.telegram.org/bot{BOT_TOKEN}/getChatMember",
                    params={'chat_id': chat_id, 'user_id': user_id},
                    timeout=5
                ).json()
                if res.get('ok') and res.get('result', {}).get('status') in ['creator', 'administrator']:
                    ADMIN_CACHE[user_id] = True
                    return True
                ADMIN_CACHE[user_id] = False
            except Exception:
                pass
    return False

def find_target_app(reply_msg, apps, current_app):
    if not reply_msg:
        return None

    # Method 1: Match by forwarded channel message ID (which matches app['id'])
    fwd_orig_id = reply_msg.get('forward_from_message_id')
    if not fwd_orig_id and 'forward_origin' in reply_msg:
        fwd_orig_id = reply_msg['forward_origin'].get('message_id')

    if fwd_orig_id:
        str_id = str(fwd_orig_id)
        for a in apps:
            if str(a.get('id')) == str_id:
                return a
        # In channel: Info post (ID) -> APK file (ID+1)
        try:
            int_id = int(str_id)
            for a in apps:
                if str(a.get('id')) in (str(int_id + 1), str(int_id - 1)):
                    return a
        except Exception:
            pass
        if current_app and str(current_app.get('id')) == str_id:
            return current_app

    # Method 2: Match by Document (file_id or file_name)
    if 'document' in reply_msg:
        doc = reply_msg['document']
        doc_file_id = doc.get('file_id')
        doc_name = doc.get('file_name', '').strip().lower()
        if doc_file_id:
            for a in apps:
                if a.get('file_id') == doc_file_id:
                    return a
            if current_app and current_app.get('file_id') == doc_file_id:
                return current_app
        if doc_name:
            for a in apps:
                if a.get('file_name', '').strip().lower() == doc_name:
                    return a
            if current_app and current_app.get('file_name', '').strip().lower() == doc_name:
                return current_app

    # Method 3: Match by Caption / Text (Info post)
    text = reply_msg.get('caption', reply_msg.get('text', ''))
    if '🧩 تطبيق' in text or '🎮 لعبة' in text:
        info = extract_text_info(text)
        name = info.get('name', '').strip().lower()
        if name:
            for a in apps:
                if a.get('name', '').strip().lower() == name:
                    return a
            if current_app and current_app.get('name', '').strip().lower() == name:
                return current_app

    return None


def main():
    if not BOT_TOKEN:
        print("Error: TELEGRAM_BOT_TOKEN environment variable not set.")
        return

    offset = get_offset()
    apps = load_apps()
    current_app = load_pending()
    me_res = requests.get(f"https://api.telegram.org/bot{BOT_TOKEN}/getMe").json()
    if me_res.get('ok'):
        print(f"Bot Identity Confirmed: @{me_res['result']['username']}")
        
    wh_info = requests.get(f"https://api.telegram.org/bot{BOT_TOKEN}/getWebhookInfo").json()
    print(f"Webhook/Queue Status: {wh_info}")
    
    url = f"https://api.telegram.org/bot{BOT_TOKEN}/getUpdates"
    import json
    highest_offset = offset
    added_count = 0
    media_group_to_app = {}
    
    while True:
        print(f"Fetching updates from offset: {offset}")
        params = {
            'offset': offset, 
            'timeout': 10,
            'allowed_updates': json.dumps(['message', 'edited_message', 'channel_post', 'edited_channel_post'])
        }
        response = requests.get(url, params=params)
        if response.status_code != 200:
            print(f"Telegram API Error {response.status_code}: {response.text}")
            break
        updates = response.json().get('result', []) if response.status_code == 200 else []
        
        if not updates:
            break
            
        print(f"Received {len(updates)} updates from Telegram.")
        
        for update in updates:
            # print(f"Processing update: {json.dumps(update, ensure_ascii=False)}") # Uncomment if deep debug needed
            update_id = update['update_id']
            highest_offset = max(highest_offset, update_id + 1)
            
            is_edit = 'edited_channel_post' in update or 'edited_message' in update
            message = update.get('channel_post') or update.get('edited_channel_post') or update.get('message') or update.get('edited_message')
            if not message:
                continue
                
            # Check for Message 1: Photo + Caption (App Info Post from Channel)
            text = message.get('caption', message.get('text', ''))
            if 'photo' in message and ('🧩 تطبيق' in text or '🎮 لعبة' in text):
                extracted_info = extract_text_info(text)
                
                photo_array = message['photo']
                thumb_index = 1 if len(photo_array) > 1 else 0
                extracted_info['icon_id'] = photo_array[thumb_index]['file_id']
                
                if is_edit:
                    # Update existing app in database by name (case-insensitive)
                    existing_app = next((a for a in apps if a.get('name', '').strip().lower() == extracted_info['name'].strip().lower()), None)
                    if existing_app:
                        existing_app.update(extracted_info)
                        added_count += 1
                        print(f"Updated info for existing app: {existing_app['name']}")
                    elif current_app and current_app.get('name', '').strip().lower() == extracted_info['name'].strip().lower():
                        current_app.update(extracted_info)
                        save_pending(current_app)
                else:
                    # Preserve any screenshots already attached
                    if current_app and 'screenshots' in current_app:
                        extracted_info['screenshots'] = current_app['screenshots']
                    current_app = extracted_info
                    save_pending(current_app)
                    print(f"Found info for: {current_app['name']}, waiting for APK...")
                
            # Check for Message 2: Document (APK file from Channel)
            elif 'document' in message and not (message.get('reply_to_message') and message['document'].get('mime_type', '').startswith('image/')):
                if is_edit:
                    # Update existing APK if the file was replaced
                    app_to_update = next((a for a in apps if a.get('id') == str(message['message_id'])), None)
                    if app_to_update:
                        app_to_update['file_id'] = message['document']['file_id']
                        app_to_update['file_name'] = message['document'].get('file_name', 'Download.apk')
                        app_to_update['size'] = message['document'].get('file_size', 0)
                        added_count += 1
                        print(f"Updated APK file for existing app: {app_to_update['name']}")
                elif current_app and 'name' in current_app:
                    current_app['file_id'] = message['document']['file_id']
                    current_app['file_name'] = message['document'].get('file_name', 'Download.apk')
                    current_app['size'] = message['document'].get('file_size', 0)
                    
                    orig_id = message.get('forward_from_message_id')
                    current_app['id'] = str(orig_id) if orig_id else str(message['message_id'])
                    
                    orig_chat = message.get('forward_from_chat')
                    current_app['chat_id'] = str(orig_chat['id']) if orig_chat else str(message['chat']['id'])
                    
                    current_app['date'] = message.get('forward_date', message.get('date', 0))
                    
                    # Associate deterministic poll message ID (Channel sequence: [N-1: Info] -> [N: APK] -> [N+1: Poll])
                    try:
                        current_app['poll_msg_id'] = int(current_app['id']) + 1
                    except Exception:
                        pass
                    
                    # Remove older versions of the same app (Deduplication by Name)
                    apps = [a for a in apps if a.get('name', '').strip().lower() != current_app['name'].strip().lower()]
                    
                    # Add to database
                    apps.insert(0, current_app)
                    added_count += 1
                    print(f"Successfully added app: {current_app['name']} with its APK file!")
                    
                    # Reset pending state
                    current_app = {}
                    save_pending(current_app)

            # Check for Message 3: Screenshot posted as Reply in Linked Group by Admins
            elif 'photo' in message or ('document' in message and message.get('document', {}).get('mime_type', '').startswith('image/')):
                reply_msg = message.get('reply_to_message')
                media_group_id = message.get('media_group_id')
                
                if (reply_msg or (media_group_id and media_group_id in media_group_to_app)) and is_admin_sender(message):
                    target_app = None
                    if reply_msg:
                        target_app = find_target_app(reply_msg, apps, current_app)
                        if target_app and media_group_id:
                            media_group_to_app[media_group_id] = target_app
                    elif media_group_id and media_group_id in media_group_to_app:
                        target_app = media_group_to_app[media_group_id]
                        
                    if target_app:
                        # Extract photo file_id (highest resolution)
                        if 'photo' in message and message['photo']:
                            photo_id = message['photo'][-1]['file_id']
                        elif 'document' in message:
                            photo_id = message['document']['file_id']
                        else:
                            photo_id = None
                            
                        if photo_id:
                            if 'screenshots' not in target_app:
                                target_app['screenshots'] = []
                            if photo_id not in target_app['screenshots']:
                                target_app['screenshots'].append(photo_id)
                                added_count += 1
                                if current_app and target_app == current_app:
                                    save_pending(current_app)
                                print(f"Added screenshot for app '{target_app.get('name')}': {photo_id[:16]}...")
    
        offset = highest_offset
        save_offset(highest_offset)

    if added_count > 0:
        save_apps(apps)
        update_seo_html(apps)
        
    save_offset(highest_offset)
    print(f"Processed {added_count} new apps.")

if __name__ == "__main__":
    main()
