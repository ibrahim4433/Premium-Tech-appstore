# 📱 Premium Tech AppStore

Welcome to the **Premium Techs AppStore** repository! This project is a fully automated, static web application hosted on GitHub Pages that serves as a beautiful frontend for a Telegram Channel. 

It automatically fetches apps and games posted in a private Telegram channel and displays them in a premium, glassmorphism-styled dark mode UI, allowing users to download files directly from Telegram without leaving their browser!

## 🌟 Features
- **Fully Automated Data Pipeline:** Uses GitHub Actions to sync with your Telegram channel every 6 hours automatically.
- **Premium UI:** A stunning, modern dark-mode interface built with Vanilla CSS (Glassmorphism, CSS Variables, Responsive Design).
- **Zero Server Costs:** Hosted entirely for free on GitHub Pages.
- **Smart Parsing:** Automatically reads Arabic Telegram messages, extracting App/Game titles, descriptions, versions, and icons accurately.
- **Secure Direct Downloads:** Uses a Cloudflare Worker proxy to generate fresh download links on-the-fly, keeping your Telegram Bot Token 100% secure.
- **Conflict Resilience:** The GitHub Action is programmed with a smart retry-loop to handle commit conflicts automatically.

## 🏗️ Architecture

1. **The Updater (`scripts/update.py`):** A Python script that connects to the Telegram API to fetch new messages in the channel. It parses the custom format used in the channel and saves the structured data to `apps.json`.
2. **The Automation (`.github/workflows/update.yml`):** A cron job that runs the Python script and commits any new apps found back to the repository.
3. **The Proxy (`worker/index.js`):** A Cloudflare Worker that acts as a secure bridge. When a user clicks "Download", the Worker fetches the real Telegram file path and streams the APK directly to the user.
4. **The Frontend (`index.html` & `js/app.js`):** The GitHub Pages website that reads `apps.json` and renders the application cards.

## 🚀 Setup Guide

If you are cloning this project to build your own AppStore, follow these steps:

### 1. Telegram Bot Setup
1. Create a bot using [@BotFather](https://t.me/botfather) and copy the **Bot Token**.
2. Add your new Bot as an **Administrator** to your Telegram Channel.

### 2. Cloudflare Worker Setup (The Proxy)
1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com) and create a new **Worker**.
2. Paste the code from `worker/index.js` into your new Worker.
3. In the Worker's Settings -> Variables, add a new Environment Variable named `TELEGRAM_BOT_TOKEN` and set it to your Bot Token.
4. Deploy the Worker and copy its URL.
5. Open `js/app.js` in this repository and replace `WORKER_URL` on line 2 with your new Cloudflare Worker URL.

### 3. GitHub Automation Setup
1. Go to your repository's **Settings** -> **Secrets and variables** -> **Actions**.
2. Click **New repository secret**.
3. Name: `TELEGRAM_BOT_TOKEN`. Value: Your Bot Token.
4. Go to **Settings** -> **Actions** -> **General** and enable **Read and write permissions** under Workflow permissions.

### 4. Posting Format
The Python script is designed to parse messages in this specific format. Post them together in your channel:

**Message 1 (Photo with text):**
```text
🧩 تطبيق App Name (or 🎮 لعبة Game Name)
📍من طلبات المشتركين
⚡ الوصف : This is the description.
🧊 الإصدار : 1.0.0
```
**Message 2 (File):**
*The APK/ZIP file itself.*

---
*Created with ❤️ by Premium Tech*
