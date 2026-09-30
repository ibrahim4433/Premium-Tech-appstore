import asyncio
import os
from telethon import TelegramClient

API_ID = 6372419
API_HASH = 'f0d104a2db47caa06a9d569431345b59'

# The private channel invite link or ID
SOURCE_CHANNEL = 'https://t.me/+ij7-LS669ahhMDFk'

# The bot you want to forward everything to
DESTINATION_BOT = '@Premium_tech_store_bot'

async def main():
    print("Logging into Telegram as a User...")
    client = TelegramClient('user_session', API_ID, API_HASH)
    await client.start()
    
    print(f"Resolving channel: {SOURCE_CHANNEL} ...")
    try:
        # If it's an invite link, Telethon will resolve it
        channel = await client.get_entity(SOURCE_CHANNEL)
    except Exception as e:
        print(f"Error joining/resolving channel: {e}")
        return

    print(f"Resolving bot: {DESTINATION_BOT} ...")
    bot = await client.get_entity(DESTINATION_BOT)

    print("Fetching history and automatically forwarding to the bot...")
    
    count = 0
    # Reverse=True starts from the oldest messages to newest, ensuring correct order
    async for message in client.iter_messages(channel, reverse=True):
        # We only care about messages with media (apps)
        if message.media:
            try:
                await client.forward_messages(bot, message)
                count += 1
                if count % 50 == 0:
                    print(f"Forwarded {count} messages so far...")
                    # Small sleep to prevent Telegram spam limits
                    await asyncio.sleep(2)
            except Exception as e:
                print(f"Error forwarding message {message.id}: {e}")
                
    print(f"\nDone! Successfully forwarded {count} apps/games to the bot.")
    print("Now you can just run your GitHub Action (update.py) and it will process them perfectly!")
    
    await client.disconnect()

if __name__ == '__main__':
    asyncio.run(main())
