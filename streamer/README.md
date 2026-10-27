# 🚀 Telegram MTProto File Streamer (100% Free Forever · No Credit Card Required)

This microservice uses **Telethon (Telegram MTProto Client API)** to stream files up to **2,000 MB (2 GB)** directly from your Telegram channel to website visitors' browsers with **zero storage cost** and **100% security**.

---

## 🔑 Step 1: Get Telegram API ID & Hash (Free & takes 60 seconds)

1. Go to [https://my.telegram.org](https://my.telegram.org) and log in with your Telegram account phone number.
2. Click on **API development tools**.
3. In the form:
   - **App title:** `AppStoreStreamer` (or anything you like)
   - **Short name:** `appstream`
   - Platform: `Other`
4. Click **Create application**.
5. Copy your numeric **`api_id`** and alphanumeric **`api_hash`**.

---

## ☁️ Step 2: Deploy to Glitch.com (100% Free · No Credit Card Required)

Glitch is a generous cloud platform that **never asks for a credit card** and gives you a free permanent HTTPS server.

1. Go to **[https://glitch.com](https://glitch.com)** and sign in with your GitHub account.
2. Click the **New Project** button at the top right -> choose **Import from GitHub**.
3. In the popup, paste your GitHub repository:
   `your-username/Premium-Tech-appstore`
4. Glitch will clone your repository into a fresh project in 5 seconds!
5. In the left sidebar file list, click on the **`.env`** file (Glitch's private secrets file) and add these 3 variables:
   ```env
   TELEGRAM_BOT_TOKEN=your_bot_token_here
   TELEGRAM_API_ID=your_api_id_here
   TELEGRAM_API_HASH=your_api_hash_here
   ```
6. Glitch reads `glitch.json` and automatically starts your streamer on port 3000!
7. To find your public URL:
   - Click **Share** (top right) -> copy the **Live Site** link (or click **Preview** -> **Open in new window**).
   - Your URL looks like: `https://<your-project-name>.glitch.me`

---

## ⚡ Step 3: Connect to your Cloudflare Worker

1. Open your [Cloudflare Dashboard](https://dash.cloudflare.com) -> **Workers & Pages** -> your worker.
2. Go to **Settings** -> **Variables and Secrets**.
3. Under **Environment Variables**, click **Add**:
   - Variable name: `STREAMER_URL`
   - Value: `https://<your-project-name>.glitch.me` (your URL from Step 2)
4. Click **Save and Deploy**.
5. Deploy the updated worker code from [`worker/index.js`](../worker/index.js).

---

## 🧪 Testing the Streamer
Visit your streamer URL in your browser:
`https://<your-project-name>.glitch.me`

You will see the active dark-mode dashboard and your connected bot name (`@Premium_tech_store_bot`).
Now click "Download" on any 500MB+ game on your website and watch it download directly in the browser!
