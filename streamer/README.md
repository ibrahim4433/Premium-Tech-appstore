# 🚀 Telegram MTProto File Streamer (100% Free Forever)

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

## ☁️ Step 2: Deploy to Render.com (100% Free Forever · Recommended)

Render offers a permanent **Free Web Service** tier ($0/month, no credit card required) that runs Python and FastAPI natively with zero restrictions.

1. Go to [https://render.com](https://render.com) and click **Sign Up** -> choose **GitHub**.
2. Click the **New +** button at the top right -> choose **Web Service**.
3. Select **Build and deploy from a Git repository** and connect your repository: `Premium-Tech-appstore`.
4. Configure these fields:
   - **Name:** `appstore-streamer` (or any name)
   - **Region:** Frankfurt (EU) or Oregon (US)
   - **Branch:** `main`
   - **Root Directory:** `streamer`
   - **Runtime:** `Python 3`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn app:app --host 0.0.0.0 --port $PORT`
   - **Instance Type:** Select **`Free`** ($0/month)
5. Scroll down to **Environment Variables** and click **Add Environment Variable** for these 3:
   - Key: `TELEGRAM_BOT_TOKEN` | Value: (Your Bot Token from @BotFather)
   - Key: `TELEGRAM_API_ID` | Value: (Your numeric `api_id`)
   - Key: `TELEGRAM_API_HASH` | Value: (Your string `api_hash`)
6. Click **Deploy Web Service** at the bottom!
7. Render will build and deploy your streamer in ~1 minute. Once live, copy your service URL:
   - Format: `https://appstore-streamer.onrender.com`

---

## ⚡ Step 3: Connect to your Cloudflare Worker

1. Open your [Cloudflare Dashboard](https://dash.cloudflare.com) -> **Workers & Pages** -> your worker.
2. Go to **Settings** -> **Variables and Secrets**.
3. Under **Environment Variables**, click **Add**:
   - Variable name: `STREAMER_URL`
   - Value: `https://appstore-streamer.onrender.com` (your URL from Step 2)
4. Click **Save and Deploy**.
5. Update your worker code with [`worker/index.js`](../worker/index.js) and click **Deploy**.

---

## 🧪 Testing the Streamer
Visit your streamer URL in your browser:
`https://appstore-streamer.onrender.com`

You will see the active status dashboard and connected bot name (`@Premium_tech_store_bot`).
Now click "Download" on any 500MB+ game on your website and watch it download instantly in the browser!
