# 🚀 Telegram MTProto File Streamer (Optional / Self-Hosted)

> [!NOTE]
> The primary, 100% automated method for direct downloads in this repository is now **GitHub Actions Cloud Mirroring to GitHub Releases** (see the root [README.md](../README.md)). It requires **0 servers, 0 credit cards, and 0 maintenance**.
>
> This `streamer/` microservice is kept as an optional alternative for running locally or hosting on a self-owned VPS.

---

## 🔑 Prerequisites: Telegram API Credentials

1. Go to [https://my.telegram.org](https://my.telegram.org) and log in with your Telegram account.
2. Click on **API development tools**.
3. Create an application to get your:
   - **`api_id`** (numeric)
   - **`api_hash`** (alphanumeric string)

---

## 💻 Local / VPS Running Instructions

1. Navigate to the streamer directory:
   ```bash
   cd streamer
   pip install -r requirements.txt
   ```

2. Set environment variables (or create a `.env` file):
   ```bash
   export TELEGRAM_BOT_TOKEN="your_bot_token"
   export TELEGRAM_API_ID="your_api_id"
   export TELEGRAM_API_HASH="your_api_hash"
   ```

3. Run the microservice:
   ```bash
   uvicorn app:app --host 0.0.0.0 --port 8000
   ```

4. Test in browser:
   Visit `http://localhost:8000/health`. You should see `status: ok` and your bot username.
