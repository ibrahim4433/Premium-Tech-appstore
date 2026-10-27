import os
import re
import urllib.parse
from contextlib import asynccontextmanager
from typing import Optional

from fastapi import FastAPI, HTTPException, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse, StreamingResponse
from telethon import TelegramClient
from telethon.tl.types import MessageMediaDocument, DocumentAttributeFilename
import uvicorn

API_ID = os.environ.get("TELEGRAM_API_ID")
API_HASH = os.environ.get("TELEGRAM_API_HASH")
BOT_TOKEN = os.environ.get("TELEGRAM_BOT_TOKEN")

client: Optional[TelegramClient] = None
bot_info = {}

@asynccontextmanager
async def lifespan(app: FastAPI):
    global client, bot_info
    if not API_ID or not API_HASH or not BOT_TOKEN:
        print("WARNING: TELEGRAM_API_ID, TELEGRAM_API_HASH, or TELEGRAM_BOT_TOKEN missing from environment variables!")
    else:
        try:
            print("Connecting to Telegram MTProto...")
            client = TelegramClient('appstore_bot_session', int(API_ID), API_HASH)
            await client.start(bot_token=BOT_TOKEN)
            me = await client.get_me()
            bot_info = {"id": me.id, "username": me.username, "first_name": me.first_name}
            print(f"Telegram MTProto Connected as @{me.username} (ID: {me.id})")
        except Exception as e:
            print(f"Error starting Telegram client: {e}")
    yield
    if client and client.is_connected():
        print("Disconnecting Telegram client...")
        await client.disconnect()

app = FastAPI(
    title="Premium Techs AppStore - Telegram MTProto Streamer",
    description="High-speed MTProto streaming microservice to download Telegram files > 20MB directly in browsers.",
    version="1.0.0",
    lifespan=lifespan
)

# CORS configuration to allow web visitors on GitHub Pages or custom domains
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["Content-Range", "Content-Length", "Accept-Ranges", "Content-Disposition"]
)

def normalize_chat_id(chat_id: int | str) -> int:
    s = str(chat_id).strip()
    if s.startswith('-100'):
        return int(s)
    if s.startswith('-'):
        return int(s)
    if len(s) >= 9:
        return int(f"-100{s}")
    return int(s)

async def stream_telegram_file(chat_id: int, message_id: int, filename: Optional[str], request: Request):
    if not client or not client.is_connected():
        raise HTTPException(
            status_code=503,
            detail="Telegram client is not connected. Please check TELEGRAM_API_ID, TELEGRAM_API_HASH, and TELEGRAM_BOT_TOKEN environment variables."
        )

    norm_chat = normalize_chat_id(chat_id)
    try:
        try:
            entity = await client.get_entity(norm_chat)
        except Exception:
            entity = norm_chat
            
        message = await client.get_messages(entity, ids=int(message_id))
    except Exception as e:
        raise HTTPException(status_code=404, detail=f"Failed to find channel/message: {str(e)}")

    if not message or not message.media:
        raise HTTPException(status_code=404, detail="Message or file attachment not found.")

    document = getattr(message.media, 'document', None)
    if not document:
        raise HTTPException(status_code=400, detail="Target message does not contain a document/file.")

    total_size = document.size
    mime_type = document.mime_type or "application/vnd.android.package-archive"

    if not filename:
        for attr in document.attributes:
            if isinstance(attr, DocumentAttributeFilename):
                filename = attr.file_name
                break
    if not filename:
        filename = f"app_{message_id}.apk"

    safe_ascii_name = re.sub(r'[^a-zA-Z0-9_\-\.]', '_', filename)
    encoded_utf8_name = urllib.parse.quote(filename)
    content_disposition = f"attachment; filename=\"{safe_ascii_name}\"; filename*=UTF-8''{encoded_utf8_name}"

    range_header = request.headers.get("Range")
    status_code = 200
    headers = {
        "Accept-Ranges": "bytes",
        "Content-Type": mime_type,
        "Content-Disposition": content_disposition,
        "Access-Control-Allow-Origin": "*"
    }

    offset = 0
    length = total_size

    if range_header:
        range_match = re.match(r"bytes=(\d+)-(\d*)", range_header.strip())
        if range_match:
            start = int(range_match.group(1))
            end_str = range_match.group(2)
            end = int(end_str) if end_str else total_size - 1

            if start >= total_size:
                raise HTTPException(
                    status_code=416,
                    detail="Requested Range Not Satisfiable",
                    headers={"Content-Range": f"bytes */{total_size}"}
                )

            end = min(end, total_size - 1)
            offset = start
            length = end - start + 1
            status_code = 206
            headers["Content-Range"] = f"bytes {start}-{end}/{total_size}"

    headers["Content-Length"] = str(length)
    CHUNK_SIZE = 1024 * 1024

    async def file_stream_generator():
        try:
            async for chunk in client.iter_download(
                document,
                offset=offset,
                limit=length,
                chunk_size=CHUNK_SIZE
            ):
                yield chunk
        except Exception as err:
            print(f"Streaming error for msg {message_id}: {err}")

    return StreamingResponse(
        file_stream_generator(),
        status_code=status_code,
        headers=headers
    )

@app.get("/", response_class=HTMLResponse)
async def home():
    is_online = bool(client and client.is_connected())
    status_class = "online" if is_online else "offline"
    bot_name = f"@{bot_info.get('username')}" if is_online else "Not Connected"
    status_text = f"Connected as {bot_name}" if is_online else "Disconnected (Check Secrets)"

    html = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Premium Techs AppStore Streamer</title>
  <style>
    * {{ box-sizing: border-box; margin: 0; padding: 0; }}
    body {{ font-family: system-ui, -apple-system, sans-serif; background: #0b0f19; color: #f8fafc; display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 20px; }}
    .card {{ background: #131b2e; border-radius: 20px; padding: 36px; max-width: 520px; width: 100%; box-shadow: 0 20px 40px rgba(0,0,0,0.6); border: 1px solid rgba(255,255,255,0.08); }}
    h1 {{ font-size: 1.45rem; color: #38bdf8; display: flex; align-items: center; gap: 10px; margin-bottom: 14px; }}
    .status {{ display: inline-flex; align-items: center; gap: 8px; padding: 6px 14px; border-radius: 9999px; font-size: 0.85rem; font-weight: 600; margin-bottom: 20px; }}
    .status.online {{ background: rgba(34,197,94,0.15); color: #4ade80; border: 1px solid rgba(34,197,94,0.3); }}
    .status.offline {{ background: rgba(239,68,68,0.15); color: #f87171; border: 1px solid rgba(239,68,68,0.3); }}
    .status-dot {{ width: 8px; height: 8px; border-radius: 50%; background: currentColor; }}
    p {{ color: #94a3b8; font-size: 0.95rem; line-height: 1.6; margin-bottom: 22px; }}
    h3 {{ font-size: 0.95rem; text-transform: uppercase; letter-spacing: 0.05em; color: #cbd5e1; margin-bottom: 12px; }}
    ul {{ list-style: none; display: flex; flex-direction: column; gap: 8px; }}
    li {{ background: #0b0f19; padding: 10px 14px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.05); font-size: 0.88rem; color: #94a3b8; }}
    code {{ color: #38bdf8; font-family: monospace; font-weight: 600; }}
  </style>
</head>
<body>
  <div class="card">
    <h1>🚀 AppStore MTProto Streamer</h1>
    <div class="status {status_class}">
      <span class="status-dot"></span>
      <span>{status_text}</span>
    </div>
    <p>High-speed streaming bridge to download Android apps and games up to <strong>2 GB</strong> directly from Telegram to web browsers with resumable HTTP Range downloads.</p>
    <h3>Available Endpoints</h3>
    <ul>
      <li><code>/health</code> — Streamer & Telegram status JSON</li>
      <li><code>/download/&#123;chat_id&#125;/&#123;msg_id&#125;</code> — Direct file download</li>
    </ul>
  </div>
</body>
</html>"""
    return html

@app.get("/health")
async def health():
    is_online = bool(client and client.is_connected())
    return {
        "status": "ok" if is_online else "degraded",
        "telegram_connected": is_online,
        "bot": bot_info
    }

@app.get("/download/{chat_id}/{message_id}")
async def download_by_path(chat_id: str, message_id: int, request: Request, filename: Optional[str] = None):
    return await stream_telegram_file(chat_id, message_id, filename, request)

@app.get("/download")
async def download_by_query(
    request: Request,
    chat_id: Optional[str] = None,
    msg_id: Optional[int] = None,
    id: Optional[int] = None,
    filename: Optional[str] = None
):
    target_msg_id = msg_id or id
    if not chat_id or not target_msg_id:
        raise HTTPException(status_code=400, detail="Missing required parameters: 'chat_id' and 'id' (or 'msg_id').")
    return await stream_telegram_file(chat_id, target_msg_id, filename, request)

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 7860))
    uvicorn.run("app:app", host="0.0.0.0", port=port, reload=False)
