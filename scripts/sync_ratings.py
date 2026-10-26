import os
import sys
import json
import asyncio
import re

# Telethon credentials
API_ID = 6372419
API_HASH = 'f0d104a2db47caa06a9d569431345b59'
CHANNEL_USERNAME = int(os.environ.get('TELEGRAM_CHANNEL_ID', '-1001423595432'))
APPS_FILE = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'apps.json')

def parse_poll_option(text, index, total_options):
    """
    Evaluates option text and returns (weight, category_key).
    weight is on a 1.0 to 5.0 scale.
    Standard channel poll options:
    - 🔥 ممتاز -> 5.0, 'excellent'
    - ⚡️ جيد   -> 4.0, 'good'
    - 😐 عادي  -> 3.0, 'average'
    - 👎 سيء   -> 1.0, 'bad'
    """
    clean = (text or '').strip()

    # 1. Semantic Arabic keywords
    if any(k in clean for k in ['ممتاز', 'خرافي', 'أسطوري', 'رائع جداً', 'ممتاز جدا']):
        return 5.0, 'excellent'
    if any(k in clean for k in ['جيد جداً', 'جيد جدا', 'رائع']):
        return 4.0, 'good'
    if 'جيد' in clean:
        return 4.0, 'good'
    if any(k in clean for k in ['عادي', 'متوسط', 'مقبول']):
        return 3.0, 'average'
    if any(k in clean for k in ['سيء', 'ضعيف', 'لا يعمل', 'فاشل', 'مش شغال', 'مشاكل']):
        return 1.0, 'bad'

    # 2. Star emoji detection (⭐⭐⭐⭐⭐ to ⭐)
    star_count = clean.count('⭐') + clean.count('⭐️')
    if 1 <= star_count <= 5:
        key_map = {5: 'excellent', 4: 'good', 3: 'average', 2: 'poor', 1: 'bad'}
        return float(star_count), key_map.get(star_count, 'average')

    # 3. Numerical scale (5, 4, 3, 2, 1)
    for n in (5, 4, 3, 2, 1):
        if str(n) in clean:
            key_map = {5: 'excellent', 4: 'good', 3: 'average', 2: 'poor', 1: 'bad'}
            return float(n), key_map.get(n, 'average')

    # 4. Position fallback (standard descending order)
    if total_options == 4:
        weights = [5.0, 4.0, 3.0, 1.0]
        keys = ['excellent', 'good', 'average', 'bad']
        if index < len(weights):
            return weights[index], keys[index]
    elif total_options == 5:
        weights = [5.0, 4.0, 3.0, 2.0, 1.0]
        keys = ['excellent', 'good', 'average', 'poor', 'bad']
        if index < len(weights):
            return weights[index], keys[index]

    return 3.0, 'average'

def extract_rating_from_poll(poll, results):
    """
    Extracts weighted 5-star rating, total votes, and breakdown from a Telethon poll.
    """
    if not poll or not results:
        return None, 0, {}

    total_voters = getattr(results, 'total_voters', 0)
    
    # Map raw option bytes to voter count
    votes_by_option = {}
    if getattr(results, 'results', None):
        for item in results.results:
            votes_by_option[item.option] = getattr(item, 'voters', 0)

    breakdown = {
        'excellent': 0,
        'good': 0,
        'average': 0,
        'bad': 0
    }

    total_score = 0.0
    counted_voters = 0
    answers = getattr(poll, 'answers', [])

    for idx, ans in enumerate(answers):
        opt_text = getattr(ans.text, 'text', str(getattr(ans, 'text', '')))
        weight, cat_key = parse_poll_option(opt_text, idx, len(answers))
        v_count = votes_by_option.get(ans.option, 0)

        breakdown[cat_key] = breakdown.get(cat_key, 0) + v_count
        total_score += weight * v_count
        counted_voters += v_count

    final_voters = max(total_voters, counted_voters)

    if final_voters > 0 and counted_voters > 0:
        avg_rating = round(total_score / counted_voters, 1)
        avg_rating = max(1.0, min(5.0, avg_rating))
    else:
        avg_rating = None

    return avg_rating, final_voters, breakdown

async def main():
    print("=== Telegram Channel Apps Rating Synchronizer ===")
    
    if not os.path.exists(APPS_FILE):
        print(f"Error: {APPS_FILE} not found.")
        sys.exit(1)

    with open(APPS_FILE, 'r', encoding='utf-8') as f:
        apps = json.load(f)

    print(f"Loaded {len(apps)} apps from {APPS_FILE}.")

    # Check for CLI flags
    is_full_sync = '--full' in sys.argv
    max_active_apps = 120

    # Determine which apps need checking
    target_apps = []
    for idx, app in enumerate(apps):
        if is_full_sync or idx < max_active_apps or not app.get('rating') or app.get('votes', 0) == 0:
            target_apps.append(app)

    print(f"Selected {len(target_apps)} apps for ratings synchronization (Full Sync: {is_full_sync}).")

    if not target_apps:
        print("No apps to synchronize. Done.")
        return

    # Initialize Telethon Client using StringSession
    string_session = os.environ.get('TELEGRAM_STRING_SESSION', '').strip()
    if not string_session:
        print("Error: TELEGRAM_STRING_SESSION environment variable not set.")
        sys.exit(1)

    from telethon import TelegramClient
    from telethon.sessions import StringSession
    from telethon.tl.types import MessageMediaPoll

    print("Connecting to Telegram MTProto via StringSession...")
    client = TelegramClient(StringSession(string_session), API_ID, API_HASH)
    await client.start()

    try:
        channel_entity = await client.get_entity(CHANNEL_USERNAME)
        print(f"Successfully resolved channel: {getattr(channel_entity, 'title', CHANNEL_USERNAME)}")
    except Exception as e:
        print(f"Error resolving channel entity: {e}")
        await client.disconnect()
        sys.exit(1)

    # Build target poll IDs list
    # Channel sequence: [Photo: ID-1] -> [APK: ID] -> [Poll: ID+1]
    poll_id_to_app = {}
    for app in target_apps:
        app_id_str = str(app.get('id', ''))
        if not app_id_str.isdigit():
            continue
            
        app_int_id = int(app_id_str)
        poll_msg_id = app.get('poll_msg_id') or (app_int_id + 1)
        poll_id_to_app[poll_msg_id] = app

    all_poll_ids = list(poll_id_to_app.keys())
    print(f"Prepared {len(all_poll_ids)} poll IDs to query in batches.")

    updated_count = 0
    BATCH_SIZE = 100

    for i in range(0, len(all_poll_ids), BATCH_SIZE):
        batch = all_poll_ids[i:i + BATCH_SIZE]
        print(f"Fetching batch {i // BATCH_SIZE + 1} ({len(batch)} messages)...")
        
        try:
            messages = await client.get_messages(channel_entity, ids=batch)
        except Exception as e:
            print(f"Error fetching batch: {e}")
            continue

        for msg in messages:
            if not msg:
                continue

            # Check if this message is a poll
            if isinstance(getattr(msg, 'media', None), MessageMediaPoll):
                target_app = poll_id_to_app.get(msg.id)
                if not target_app:
                    continue

                media = msg.media
                rating, votes, breakdown = extract_rating_from_poll(media.poll, media.results)

                # Update target app
                target_app['poll_msg_id'] = msg.id
                target_app['rating'] = rating
                target_app['votes'] = votes
                target_app['rating_breakdown'] = breakdown

                updated_count += 1
                poll_q = getattr(media.poll, 'question', '')
                q_text = getattr(poll_q, 'text', str(poll_q))
                print(f"[{updated_count}] {target_app['name']} -> Rating: {rating} ★ ({votes} votes) - Q: {q_text[:30]}")

        # Sleep briefly between batches to respect rate limits
        if i + BATCH_SIZE < len(all_poll_ids):
            await asyncio.sleep(1.0)

    await client.disconnect()

    print("\n" + "=" * 50)
    print(f"Ratings synchronization finished!")
    print(f"Synchronized ratings for {updated_count} apps.")
    print("=" * 50)

    if updated_count > 0:
        print(f"Saving updated data to {APPS_FILE}...")
        with open(APPS_FILE, 'w', encoding='utf-8') as f:
            json.dump(apps, f, ensure_ascii=False, separators=(',', ':'))
        print("Successfully saved apps.json with updated ratings!")
    else:
        print("No ratings were updated.")

if __name__ == '__main__':
    asyncio.run(main())
