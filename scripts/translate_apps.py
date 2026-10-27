"""
Automatic translation module for Premium-Tech AppStore.
Translates Arabic app descriptions into English safely, cleanly, and for free.
Can be run standalone or imported into scripts/update.py.
"""

import os
import sys
import json
import re
import time
import random
import urllib.request
import urllib.parse
import urllib.error
from concurrent.futures import ThreadPoolExecutor, as_completed

APPS_FILE = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'apps.json')

USER_AGENTS = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:123.0) Gecko/20100101 Firefox/123.0'
]

def has_arabic(text):
    """Check if the text contains Arabic characters."""
    if not text:
        return False
    return bool(re.search(r'[\u0600-\u06FF]', text))

def translate_gtx(text, source_lang='ar', target_lang='en', timeout=15):
    """Translate text using Google Translate free gtx endpoint."""
    url = 'https://translate.googleapis.com/translate_a/single?' + urllib.parse.urlencode({
        'client': 'gtx',
        'sl': source_lang,
        'tl': target_lang,
        'dt': 't',
        'q': text
    })
    headers = {
        'User-Agent': random.choice(USER_AGENTS),
        'Accept': '*/*',
        'Accept-Language': 'en-US,en;q=0.9,ar;q=0.8'
    }
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            if resp.status == 200:
                raw = resp.read().decode('utf-8')
                data = json.loads(raw)
                parts = [item[0] for item in data[0] if item and item[0]]
                return ''.join(parts).strip()
    except urllib.error.HTTPError as e:
        if e.code == 429:
            # Rate limited, back off
            time.sleep(4.0 + random.uniform(1.0, 3.0))
        raise
    return ''

def translate_mymemory(text, source_lang='ar', target_lang='en', timeout=15):
    """Fallback translation using MyMemory API."""
    # Split text into chunks < 500 chars for MyMemory limit
    paragraphs = text.split('\n')
    translated_paras = []
    for p in paragraphs:
        if not p.strip() or not has_arabic(p):
            translated_paras.append(p)
            continue
        url = 'https://api.mymemory.translated.net/get?' + urllib.parse.urlencode({
            'q': p[:500],
            'langpair': f'{source_lang}|{target_lang}'
        })
        req = urllib.request.Request(url, headers={'User-Agent': USER_AGENT})
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            translated_paras.append(data.get('responseData', {}).get('translatedText', p))
    return '\n'.join(translated_paras).strip()

def translate_text(text, source_lang='ar', target_lang='en', max_retries=3):
    """
    Safely translates text from Arabic to English with retries and fallbacks.
    Preserves text if already English or on total failure.
    """
    if not text or not text.strip():
        return ''
    
    # If text has no Arabic characters, it is already English/non-Arabic
    if not has_arabic(text):
        return text.strip()

    # Attempt primary method (Google gtx)
    for attempt in range(max_retries):
        try:
            result = translate_gtx(text, source_lang, target_lang)
            if result:
                return result
        except Exception as e:
            wait = 1.0 * (attempt + 1)
            time.sleep(wait)

    # Attempt fallback method (MyMemory)
    try:
        fallback_res = translate_mymemory(text, source_lang, target_lang)
        if fallback_res:
            return fallback_res
    except Exception:
        pass

    # If all fails, return original text safely
    return text.strip()

def translate_app_item(app):
    """Translate an individual app item if it needs translation."""
    desc = app.get('description', '')
    desc_en = app.get('description_en', '')

    # Needs translation if desc_en is missing/empty, but desc exists
    if desc and not desc_en:
        if not has_arabic(desc):
            app['description_en'] = desc
            return True
        time.sleep(random.uniform(0.05, 0.15))
        translated = translate_text(desc, 'ar', 'en')
        if translated:
            app['description_en'] = translated
            return True
    return False

def translate_missing_apps(apps, max_workers=6, progress_callback=None, save_checkpoint_fn=None):
    """
    Scans a list of app dicts for any missing 'description_en', translates them in parallel,
    and returns the count of newly translated apps.
    """
    to_translate = []
    for idx, app in enumerate(apps):
        desc = app.get('description', '')
        desc_en = app.get('description_en', '')
        if desc and not desc_en:
            to_translate.append((idx, app))

    if not to_translate:
        return 0

    total = len(to_translate)
    print(f"[Translation] Found {total} apps needing English translation.")
    
    completed_count = 0
    checkpoint_interval = 50

    with ThreadPoolExecutor(max_workers=max_workers) as executor:
        future_to_app = {
            executor.submit(translate_app_item, app): (idx, app)
            for idx, app in to_translate
        }

        for future in as_completed(future_to_app):
            idx, app = future_to_app[future]
            try:
                success = future.result()
                if success:
                    completed_count += 1
            except Exception as e:
                print(f"[Translation Error] App {app.get('name')}: {e}")

            if progress_callback:
                progress_callback(completed_count, total)
            elif completed_count % 25 == 0 or completed_count == total:
                print(f"[Translation Progress] {completed_count}/{total} apps translated...")

            if save_checkpoint_fn and (completed_count % checkpoint_interval == 0):
                save_checkpoint_fn(apps)

    return completed_count

def run_translation_pipeline(apps_path=None):
    """Main function to run translation on apps.json."""
    path = apps_path or APPS_FILE
    if not os.path.exists(path):
        print(f"Error: {path} not found.")
        return 0

    print(f"Loading {path}...")
    with open(path, 'r', encoding='utf-8') as f:
        apps = json.load(f)

    def save_checkpoint(data):
        tmp_path = path + '.tmp'
        with open(tmp_path, 'w', encoding='utf-8') as out_f:
            json.dump(data, out_f, ensure_ascii=False, separators=(',', ':'))
        os.replace(tmp_path, path)
        print(f"Checkpoint safely saved ({len(data)} apps)")

    t0 = time.time()
    translated_count = translate_missing_apps(
        apps,
        max_workers=6,
        save_checkpoint_fn=save_checkpoint
    )

    if translated_count > 0:
        save_checkpoint(apps)
        dur = time.time() - t0
        print(f"Successfully translated {translated_count} apps in {dur:.1f}s.")
    else:
        print("All apps already have English translations up to date.")

    return translated_count

if __name__ == '__main__':
    run_translation_pipeline()
