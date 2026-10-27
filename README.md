# 📱 Premium Techs AppStore

Welcome to the **Premium Techs AppStore** repository! This project is a fully automated, static web application hosted on GitHub Pages that serves as a beautiful frontend for a Telegram Channel. 

It automatically fetches apps and games posted in the private Telegram channel and displays them in a premium, glassmorphism-styled dark mode UI, allowing users to download files directly from Telegram without leaving their browser!

## 🌟 Features
- **Fully Automated Data Pipeline:** Uses GitHub Actions to sync with your Telegram channel every 6 hours automatically.
- **Direct Browser Downloads (All File Sizes):**
  - **Files < 20MB:** Streamed instantly on-the-fly via a secure Cloudflare Worker proxy.
  - **Files > 20MB:** Automatically mirrored to high-speed GitHub Release assets via GitHub Actions with zero external hosting, zero credit cards, and zero ID verification needed.
- **Premium UI:** A stunning, modern interface built with Vanilla CSS (Glassmorphism, CSS Variables, Responsive Design).
- **Bilingual Support (English & Arabic):** Full right-to-left (RTL) and left-to-right (LTR) support with an easy language toggle.
- **Dark & Light Mode:** Built-in theme switcher to suit user preferences.
- **Advanced Search & Filtering:** Instantly search apps, filter by categories, and sort by name, size, or date.
- **Smart Categories:** Automatically tags and groups apps/games into intuitive categories (Games, Social, Tools, etc.) based on keywords.
- **Zero Server Costs ($0 Forever):** Hosted entirely for free on GitHub Pages and GitHub Actions.
- **Smart Parsing:** Automatically reads Arabic Telegram messages, extracting App/Game titles, descriptions, versions, and icons accurately.
- **Secure Token Protection:** Keeps your Telegram Bot Token and credentials 100% hidden and secure.

## 🏗️ Architecture

1. **The Updater (`scripts/update.py`):** A Python script that connects to the Telegram API to fetch new messages in the channel. It parses the custom format used in the channel and saves the structured data to `apps.json`.
2. **The Automation (`.github/workflows/update.yml`):** A cron job that runs the Python script, fetches updates, mirrors large APKs (>20MB) to GitHub Releases, and commits changes back to the repository.
3. **The Proxy (`worker/index.js`):** A Cloudflare Worker that acts as a secure bridge. When a user clicks "Download" for files < 20MB, the Worker streams the file directly to the browser.
4. **The Direct CDN Releases:** For large files (>20MB), GitHub Actions uses MTProto (Telethon) to download the APK once and uploads it directly to GitHub Releases (`https://github.com/{owner}/{repo}/releases/download/...`), providing users with direct, resumable, 100MB/s CDN downloads without ever opening Telegram.
5. **The Frontend (`index.html` & `js/app.js`):** The GitHub Pages website that reads `apps.json` and renders application cards with direct browser download buttons for all apps.

## 🚀 Setup Guide

If you are cloning this project or setting up your own AppStore, follow these steps:

### 1. Telegram Bot Setup
1. Create a bot using [@BotFather](https://t.me/botfather) and copy the **Bot Token**.
2. Add your new Bot as an **Administrator** to your Telegram Channel.

### 2. Cloudflare Worker Setup (Small Files Proxy)
1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com) and create a new **Worker**.
2. Paste the code from `worker/index.js` into your new Worker.
3. In Worker Settings -> Variables, add an Environment Variable named `TELEGRAM_BOT_TOKEN` and set it to your Bot Token.
4. Deploy the Worker and copy its URL (e.g. `https://appstore-proxy.iateam.workers.dev`).
5. In `js/app.js`, verify `WORKER_URL` points to your Cloudflare Worker URL.

### 3. GitHub Secrets Configuration (Enables Automated Large File Downloads)
To allow GitHub Actions to fetch messages and mirror large files (> 20MB) into GitHub Releases:
1. Obtain your free Telegram API credentials from [my.telegram.org](https://my.telegram.org) (under "API development tools").
2. Go to your GitHub repository's **Settings** -> **Secrets and variables** -> **Actions**.
3. Under **Repository secrets**, add these three secrets:
   - `TELEGRAM_BOT_TOKEN`: Your Telegram Bot Token from BotFather.
   - `TELEGRAM_API_ID`: Your numeric Telegram `api_id`.
   - `TELEGRAM_API_HASH`: Your string Telegram `api_hash`.
4. Go to **Settings** -> **Actions** -> **General** -> scroll down to **Workflow permissions** and select **Read and write permissions** (this allows the action to upload releases and commit `apps.json`).
5. Click **Save**.

### 4. Running the Workflow
- The workflow runs automatically every 6 hours.
- You can also trigger it manually at any time:
  1. Go to the **Actions** tab in your repository.
  2. Select **Update AppStore Database** on the left.
  3. Click **Run workflow**, enter `max_mirror` (e.g. `10` or `20`), and click **Run workflow**.

### 5. Posting Format
Post messages in your channel in this format:

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
*Created with ❤️ by IA TEAM*
