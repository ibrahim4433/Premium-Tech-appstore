export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const fileId = url.searchParams.get("id");
    const chatId = url.searchParams.get("chat_id");
    const msgId = url.searchParams.get("msg_id");
    const action = url.searchParams.get("action") || "download";
    const filename = url.searchParams.get("filename") || "download.apk";

    // Handle health / status check
    if (url.pathname === "/health" || url.pathname === "/status") {
      return new Response(JSON.stringify({
        status: "ok",
        streamer_configured: Boolean(env.STREAMER_URL),
        bot_configured: Boolean(env.TELEGRAM_BOT_TOKEN)
      }), {
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
      });
    }

    if (!fileId && !msgId) {
      return new Response("Missing id or msg_id parameter", { status: 400 });
    }

    // 1. Large File Handling via MTProto Streamer
    // If STREAMER_URL is configured and we have chat_id & msg_id, redirect directly to streamer
    const STREAMER_URL = env.STREAMER_URL ? env.STREAMER_URL.replace(/\/+$/, '') : null;
    if (action === "download" && STREAMER_URL && chatId && msgId) {
      const targetStreamUrl = `${STREAMER_URL}/download/${encodeURIComponent(chatId)}/${encodeURIComponent(msgId)}?filename=${encodeURIComponent(filename)}`;
      return Response.redirect(targetStreamUrl, 302);
    }

    const BOT_TOKEN = env.TELEGRAM_BOT_TOKEN;
    if (!BOT_TOKEN) {
      return new Response("Bot token not configured in worker", { status: 500 });
    }

    try {
      // Check Cache for images
      const cache = caches.default;
      const cacheKey = new Request(url.toString(), request);
      if (action === "image") {
        const cachedResponse = await cache.match(cacheKey);
        if (cachedResponse) {
          return cachedResponse;
        }
      }

      // 2. Ask Telegram Bot API for the file path
      const getFileRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getFile?file_id=${fileId}`);
      const fileData = await getFileRes.json();

      if (!fileData.ok) {
        // If file is too big (>20MB) and STREAMER_URL is configured, redirect to streamer as fallback
        if (STREAMER_URL && (chatId || msgId)) {
          const fallbackUrl = `${STREAMER_URL}/download/${encodeURIComponent(chatId || '-1001423595432')}/${encodeURIComponent(msgId || '')}?filename=${encodeURIComponent(filename)}`;
          return Response.redirect(fallbackUrl, 302);
        }

        const isTooBig = fileData.description && fileData.description.toLowerCase().includes("too big");
        if (isTooBig && (chatId || msgId)) {
          // Gracefully redirect to the Telegram post instead of a jarring 400 error wall
          const cleanChat = (chatId || '-1001423595432').replace(/^-100/, '');
          return Response.redirect(`https://t.me/c/${cleanChat}/${msgId || ''}`, 302);
        }

        const errorMsg = isTooBig
          ? "File is larger than 20MB. To enable direct downloads for large files, deploy the MTProto streamer (see /streamer folder) and add STREAMER_URL to Worker environment variables."
          : "Telegram API error: " + fileData.description;

        return new Response(errorMsg, {
          status: 400,
          headers: { "Access-Control-Allow-Origin": "*" }
        });
      }

      const filePath = fileData.result.file_path;
      const downloadUrl = `https://api.telegram.org/file/bot${BOT_TOKEN}/${filePath}`;

      // 3. Fetch the file from Telegram and stream it
      const fileRes = await fetch(downloadUrl);

      const newHeaders = new Headers(fileRes.headers);
      newHeaders.set("Access-Control-Allow-Origin", "*");

      if (action === "download") {
        newHeaders.set("Content-Disposition", `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`);
      } else if (action === "image") {
        // Remove attachment header so browsers render the image inline instead of forcing a download or failing
        newHeaders.delete("Content-Disposition");
        const lowerPath = filePath.toLowerCase();
        let mime = "image/jpeg";
        if (lowerPath.endsWith(".png")) mime = "image/png";
        else if (lowerPath.endsWith(".webp")) mime = "image/webp";
        else if (lowerPath.endsWith(".svg")) mime = "image/svg+xml";
        newHeaders.set("Content-Type", mime);
        newHeaders.set("Cache-Control", "public, s-maxage=86400, max-age=86400"); // Cache images for 24h
      }

      const response = new Response(fileRes.body, {
        status: fileRes.status,
        headers: newHeaders
      });

      // Save to Cloudflare Cache if it's an image
      if (action === "image" && fileRes.status === 200) {
        if (env.waitUntil) {
          env.waitUntil(cache.put(cacheKey, response.clone()));
        } else {
          await cache.put(cacheKey, response.clone());
        }
      }

      return response;

    } catch (e) {
      return new Response("Error processing request: " + e.message, {
        status: 500,
        headers: { "Access-Control-Allow-Origin": "*" }
      });
    }
  },
};
