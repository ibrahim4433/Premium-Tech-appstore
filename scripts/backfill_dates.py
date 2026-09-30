import json
import asyncio
import aiohttp
import re
from datetime import datetime

APPS_FILE = 'apps.json'
CHANNEL = 'premium_techs'

async def fetch_date(session, app):
    app_id = app.get('id')
    if not app_id:
        return app
    
    # If date is already perfectly valid (e.g., > 2000), maybe skip?
    # No, let's force backfill to ensure channel accuracy.
    url = f"https://t.me/s/{CHANNEL}/{app_id}"
    try:
        async with session.get(url, timeout=10) as resp:
            if resp.status == 200:
                html = await resp.text()
                # Find datetime="2024-05-10T15:30:00+00:00"
                match = re.search(r'datetime="([^"]+)"', html)
                if match:
                    dt_str = match.group(1)
                    # Convert to unix timestamp
                    dt = datetime.fromisoformat(dt_str)
                    app['date'] = int(dt.timestamp())
                    print(f"Updated {app.get('name')} -> {dt_str}")
    except Exception as e:
        print(f"Failed {app_id}: {e}")
        
    return app

async def main():
    with open(APPS_FILE, 'r', encoding='utf-8') as f:
        apps = json.load(f)
        
    print(f"Loaded {len(apps)} apps. Backfilling dates...")
    
    async with aiohttp.ClientSession() as session:
        tasks = []
        for app in apps:
            tasks.append(fetch_date(session, app))
            
        # Run in chunks of 50 to avoid rate limits/timeouts
        chunk_size = 50
        for i in range(0, len(tasks), chunk_size):
            await asyncio.gather(*tasks[i:i+chunk_size])
            print(f"Processed chunk {i//chunk_size + 1}")
            await asyncio.sleep(0.5)
            
    with open(APPS_FILE, 'w', encoding='utf-8') as f:
        json.dump(apps, f, ensure_ascii=False, separators=(',', ':'))
        
    print("Done backfilling dates!")

if __name__ == '__main__':
    asyncio.run(main())
