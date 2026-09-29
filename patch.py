import re

with open("scripts/update.py", "r") as f:
    content = f.read()

# We want to replace the main function's fetching logic with a while loop
# Find the start of the logic
start_str = """    print(f"Fetching updates from offset: {offset}")
    url = f"https://api.telegram.org/bot{BOT_TOKEN}/getUpdates"
    import json
    params = {
        'offset': offset, 
        'timeout': 10,
        'allowed_updates': json.dumps(['message', 'channel_post', 'edited_channel_post'])
    }
    response = requests.get(url, params=params)
    if response.status_code != 200:
        print(f"Telegram API Error {response.status_code}: {response.text}")
    updates = response.json().get('result', []) if response.status_code == 200 else []
    
    print(f"Received {len(updates)} updates from Telegram.")
    
    highest_offset = offset
    added_count = 0
    
    for update in updates:"""

# Wait, let's just do it with python's ast or by splitting lines.
lines = content.split('\n')
start_idx = -1
end_idx = -1
for i, line in enumerate(lines):
    if line.startswith('    print(f"Fetching updates from offset: {offset}")'):
        start_idx = i
    if line.startswith('    if added_count > 0:'):
        end_idx = i

if start_idx != -1 and end_idx != -1:
    logic_lines = lines[start_idx:end_idx]
    
    new_logic = [
        '    url = f"https://api.telegram.org/bot{BOT_TOKEN}/getUpdates"',
        '    import json',
        '    highest_offset = offset',
        '    added_count = 0',
        '    ',
        '    while True:',
        '        print(f"Fetching updates from offset: {offset}")',
        '        params = {',
        "            'offset': offset, ",
        "            'timeout': 10,",
        "            'allowed_updates': json.dumps(['message', 'channel_post', 'edited_channel_post'])",
        '        }',
        '        response = requests.get(url, params=params)',
        '        if response.status_code != 200:',
        '            print(f"Telegram API Error {response.status_code}: {response.text}")',
        '            break',
        "        updates = response.json().get('result', []) if response.status_code == 200 else []",
        '        ',
        '        if not updates:',
        '            break',
        '            ',
        '        print(f"Received {len(updates)} updates from Telegram.")',
        '        ',
    ]
    
    # Now find where the for loop starts in logic_lines
    for_loop_idx = -1
    for i, line in enumerate(logic_lines):
        if line.startswith('    for update in updates:'):
            for_loop_idx = i
            break
            
    for loop_line in logic_lines[for_loop_idx:]:
        new_logic.append("    " + loop_line)
        
    new_logic.append("        offset = highest_offset")
    new_logic.append("        save_offset(highest_offset)")
    new_logic.append("")
    
    lines = lines[:start_idx] + new_logic + lines[end_idx:]
    with open("scripts/update.py", "w") as f:
        f.write('\n'.join(lines))
    print("Patched successfully")
else:
    print("Could not find start/end indices")

