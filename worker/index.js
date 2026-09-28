export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const fileId = url.searchParams.get("id");
    const action = url.searchParams.get("action") || "download";

    if (!fileId) {
      return new Response("Missing id parameter", { status: 400 });
    }

    const BOT_TOKEN = env.TELEGRAM_BOT_TOKEN;
    if (!BOT_TOKEN) {
      return new Response("Bot token not configured in worker", { status: 500 });
    }

    try {
      // 1. Ask Telegram for the file path
      const getFileRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getFile?file_id=${fileId}`);
      const fileData = await getFileRes.json();

      if (!fileData.ok) {
        return new Response("Telegram API error: " + fileData.description, { status: 400 });
      }

      const filePath = fileData.result.file_path;
      const downloadUrl = `https://api.telegram.org/file/bot${BOT_TOKEN}/${filePath}`;

      // 2. Fetch the file from Telegram and stream it
      const fileRes = await fetch(downloadUrl);
      
      const newHeaders = new Headers(fileRes.headers);
      newHeaders.set("Access-Control-Allow-Origin", "*");

      const filename = url.searchParams.get("filename") || "download.apk";

      if (action === "download") {
        newHeaders.set("Content-Disposition", `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`);
      } else if (action === "image") {
        newHeaders.set("Cache-Control", "public, max-age=86400"); // Cache images for 24h
      }

      return new Response(fileRes.body, {
        status: fileRes.status,
        headers: newHeaders
      });

    } catch (e) {
      return new Response("Error processing request: " + e.message, { status: 500 });
    }
  },
};
