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
      // Check Cache first
      const cache = caches.default;
      const cacheKey = new Request(url.toString(), request);
      if (action === "image") {
        const cachedResponse = await cache.match(cacheKey);
        if (cachedResponse) {
          return cachedResponse;
        }
      }

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
        newHeaders.set("Cache-Control", "public, s-maxage=86400, max-age=86400"); // Cache images for 24h
      }

      const response = new Response(fileRes.body, {
        status: fileRes.status,
        headers: newHeaders
      });

      // Save to Cloudflare Cache if it's an image
      if (action === "image" && fileRes.status === 200) {
        // Cloudflare requires we clone the response before putting it in cache
        // wait until the cache is written (using ctx.waitUntil if available, but in module syntax we can just await)
        // actually standard worker syntax allows cache.put without blocking
        env.waitUntil && env.waitUntil(cache.put(cacheKey, response.clone()));
        if (!env.waitUntil) {
             await cache.put(cacheKey, response.clone());
        }
      }

      return response;

    } catch (e) {
      return new Response("Error processing request: " + e.message, { status: 500 });
    }
  },
};
