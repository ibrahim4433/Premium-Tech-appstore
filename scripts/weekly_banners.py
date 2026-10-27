import json
import os
import sys
import time
import re
from generate_banners import composite_app_banner, create_guide_banner

APPS_JSON_PATH = "apps.json"
BANNERS_JSON_PATH = "banners.json"

def clean_name(name):
    """Strip unnecessary emoji or channel prefixes from titles."""
    if not name:
        return ""
    # Strip leading colon, bullet, dash, emojis, or zero-width spaces
    name = re.sub(r"^[\s:\-–—•⚡🔥🎮📌💎🚀✨🧊🏷️\u200B-\u200D\uFEFF]+", "", name).strip()
    return name

def is_game(app):
    cat = (app.get("category") or "").lower()
    tags = [t.lower() for t in app.get("tags", [])]
    return "game" in cat or "#games" in tags

def compute_bayesian_score(app, m, C):
    v = app.get("votes", 0)
    r = app.get("rating", 0.0)
    if v == 0 or r == 0:
        return 0.0
    return (v / (v + m)) * r + (m / (v + m)) * C

def select_weekly_winners():
    with open(APPS_JSON_PATH, "r", encoding="utf-8") as f:
        apps = json.load(f)

    # 1. Global Mean Rating for Bayesian formula
    rated_apps = [a for a in apps if a.get("votes", 0) > 0 and a.get("rating", 0) > 0]
    C = sum(a["rating"] for a in rated_apps) / len(rated_apps) if rated_apps else 4.2

    # 2. All-Time Champions
    all_time_apps = [a for a in apps if not is_game(a) and a.get("votes", 0) > 0]
    all_time_games = [a for a in apps if is_game(a) and a.get("votes", 0) > 0]

    all_time_apps.sort(key=lambda a: compute_bayesian_score(a, m=5, C=C), reverse=True)
    all_time_games.sort(key=lambda a: compute_bayesian_score(a, m=3, C=C), reverse=True)

    top_app_alltime = all_time_apps[0] if all_time_apps else None
    top_game_alltime = all_time_games[0] if all_time_games else None

    # 3. Weekly / Trending Champions (last 7 -> 14 -> 30 -> 90 days fallback ladder)
    max_date = max((a.get("date") or 0) for a in apps) if apps else time.time()
    
    top_app_weekly = None
    top_game_weekly = None

    for days in [7, 14, 30, 90]:
        cutoff = max_date - (days * 86400)
        recent_apps = [
            a for a in apps 
            if not is_game(a) and (a.get("date") or 0) >= cutoff and a.get("votes", 0) > 0
            and (top_app_alltime is None or a["name"] != top_app_alltime["name"])
        ]
        if recent_apps and not top_app_weekly:
            recent_apps.sort(key=lambda a: compute_bayesian_score(a, m=2, C=C), reverse=True)
            top_app_weekly = recent_apps[0]

        recent_games = [
            a for a in apps 
            if is_game(a) and (a.get("date") or 0) >= cutoff and a.get("votes", 0) > 0
            and (top_game_alltime is None or a["name"] != top_game_alltime["name"])
        ]
        if recent_games and not top_game_weekly:
            recent_games.sort(key=lambda a: compute_bayesian_score(a, m=2, C=C), reverse=True)
            top_game_weekly = recent_games[0]

    # Graceful fallback if no fresh games or apps voted in recent windows
    if not top_app_weekly and len(all_time_apps) > 1:
        top_app_weekly = all_time_apps[1]
    if not top_game_weekly and len(all_time_games) > 1:
        top_game_weekly = all_time_games[1]

    return {
        "alltime_app": top_app_alltime,
        "alltime_game": top_game_alltime,
        "weekly_app": top_app_weekly,
        "weekly_game": top_game_weekly
    }

def main():
    print("=== STARTING WEEKLY BANNER GENERATION PIPELINE ===")
    winners = select_weekly_winners()

    # Step 1: Render Images via Pillow Compositor
    print("\n1. Generating Dynamic App & Game Banners...")
    banner_paths = {}

    if winners["alltime_app"]:
        banner_paths["alltime_app"] = composite_app_banner(
            winners["alltime_app"], "alltime_app.jpg", badge_text="ALL-TIME APP"
        )
    if winners["alltime_game"]:
        banner_paths["alltime_game"] = composite_app_banner(
            winners["alltime_game"], "alltime_game.jpg", badge_text="ALL-TIME GAME"
        )
    if winners["weekly_app"]:
        banner_paths["weekly_app"] = composite_app_banner(
            winners["weekly_app"], "weekly_app.jpg", badge_text="WEEKLY APP"
        )
    if winners["weekly_game"]:
        banner_paths["weekly_game"] = composite_app_banner(
            winners["weekly_game"], "weekly_game.jpg", badge_text="WEEKLY GAME"
        )

    print("\n2. Generating Ecosystem Guide Banners...")
    guide_features_img = create_guide_banner("features", "guide_features.jpg")
    guide_tg_img = create_guide_banner("telegram", "guide_telegram.jpg")
    guide_gh_img = create_guide_banner("github", "guide_github.jpg")
    guide_coffee_img = create_guide_banner("coffee", "guide_coffee.jpg")

    # Step 2: Build banners.json
    print("\n3. Building banners.json with localized typography & actions...")

    banners_data = []

    # --- CARD 1: HALL OF FAME ---
    hall_of_fame_slides = []
    if winners["alltime_app"]:
        app = winners["alltime_app"]
        c_name = clean_name(app["name"])
        hall_of_fame_slides.append({
            "image": banner_paths["alltime_app"],
            "badge": {"ar": "🏆 أسطورة التطبيقات", "en": "ALL-TIME LEGEND APP"},
            "title": {"ar": c_name, "en": c_name},
            "subtitle": {
                "ar": f"التقييم الأعلى في تاريخ المنصة ★ {app.get('rating', 5.0)} ({app.get('votes', 0)} صوت)",
                "en": f"Highest-rated app in store history ★ {app.get('rating', 5.0)} ({app.get('votes', 0)} votes)"
            },
            "action": {
                "type": "open_app",
                "appName": app["name"],
                "appId": str(app.get("id", ""))
            }
        })

    if winners["alltime_game"]:
        game = winners["alltime_game"]
        g_name = clean_name(game["name"])
        hall_of_fame_slides.append({
            "image": banner_paths["alltime_game"],
            "badge": {"ar": "🎮 صدارة الألعاب", "en": "ALL-TIME TOP GAME"},
            "title": {"ar": g_name, "en": g_name},
            "subtitle": {
                "ar": f"اللعبة الأكثر تفضيلاً وتقييماً ★ {game.get('rating', 4.5)} ({game.get('votes', 0)} صوت)",
                "en": f"Most-favored game with unlocked experience ★ {game.get('rating', 4.5)} ({game.get('votes', 0)} votes)"
            },
            "action": {
                "type": "open_app",
                "appName": game["name"],
                "appId": str(game.get("id", ""))
            }
        })

    if hall_of_fame_slides:
        banners_data.append({
            "id": "hall_of_fame",
            "action": hall_of_fame_slides[0]["action"],
            "slides": hall_of_fame_slides
        })

    # --- CARD 2: WEEKLY SPOTLIGHT ---
    weekly_slides = []
    if winners["weekly_app"]:
        w_app = winners["weekly_app"]
        w_name = clean_name(w_app["name"])
        weekly_slides.append({
            "image": banner_paths["weekly_app"],
            "badge": {"ar": "⚡ اختيار هذا الأسبوع", "en": "APP OF THE WEEK"},
            "title": {"ar": w_name, "en": w_name},
            "subtitle": {
                "ar": f"الأكثر تميزاً في تريند الأسبوع ★ {w_app.get('rating', 4.8)} ({w_app.get('votes', 0)} صوت)",
                "en": f"Trending community pick this week ★ {w_app.get('rating', 4.8)} ({w_app.get('votes', 0)} votes)"
            },
            "action": {
                "type": "open_app",
                "appName": w_app["name"],
                "appId": str(w_app.get("id", ""))
            }
        })

    if winners["weekly_game"]:
        w_game = winners["weekly_game"]
        wg_name = clean_name(w_game["name"])
        weekly_slides.append({
            "image": banner_paths["weekly_game"],
            "badge": {"ar": "🚀 لعبة الأسبوع الجديدة", "en": "GAME OF THE WEEK"},
            "title": {"ar": wg_name, "en": wg_name},
            "subtitle": {
                "ar": f"مغامرة الأسبوع الحصرية بأعلى تقييم ★ {w_game.get('rating', 4.5)} ({w_game.get('votes', 0)} صوت)",
                "en": f"Fresh game drop with top community votes ★ {w_game.get('rating', 4.5)} ({w_game.get('votes', 0)} votes)"
            },
            "action": {
                "type": "open_app",
                "appName": w_game["name"],
                "appId": str(w_game.get("id", ""))
            }
        })

    if weekly_slides:
        banners_data.append({
            "id": "weekly_spotlight",
            "action": weekly_slides[0]["action"],
            "slides": weekly_slides
        })

    # --- CARD 3: ECOSYSTEM & SUPPORT GUIDE ---
    guide_slides = [
        {
            "image": guide_features_img,
            "badge": {"ar": "💎 مزايا المنصة", "en": "STORE FEATURES"},
            "title": {"ar": "سرعة، أمان، وبدون إعلانات", "en": "Speed, Security & Zero Ads"},
            "subtitle": {
                "ar": "تحميل فوري عبر سيرفرات تليجرام، وتطبيق PWA يعمل بدون إنترنت",
                "en": "Direct Telegram CDN streaming & offline PWA support"
            },
            "action": {"type": "scroll", "target": "#categories-view"}
        },
        {
            "image": guide_tg_img,
            "badge": {"ar": "📢 المجتمع الرسمي", "en": "TELEGRAM COMMUNITY"},
            "title": {"ar": "قناة Premium Techs الرسمية", "en": "Official Telegram Channel"},
            "subtitle": {
                "ar": "تحديثات يومية حصرية، وتصويت مباشر لاختيار النسخ القادمة",
                "en": "Daily exclusive updates, requests, and poll voting"
            },
            "action": {"type": "link", "target": "https://t.me/+ij7-LS669ahhMDFk"}
        },
        {
            "image": guide_gh_img,
            "badge": {"ar": "💻 كود مفتوح المصدر", "en": "100% OPEN SOURCE"},
            "title": {"ar": "مشروع مفتوح على GitHub", "en": "Open Source on GitHub"},
            "subtitle": {
                "ar": "تصفح الكود، أبلغ عن أفكارك، أو ضع نجمة ⭐ لدعم المشروع",
                "en": "Inspect code, submit issues, or leave a star ⭐"
            },
            "action": {"type": "link", "target": "https://github.com/ibrahim432/Premium-Tech-appstore"}
        },
        {
            "image": guide_coffee_img,
            "badge": {"ar": "☕ دعم المطورين", "en": "BUY ME A COFFEE"},
            "title": {"ar": "ادعم استمرار وتطوير المتجر", "en": "Support Store Development"},
            "subtitle": {
                "ar": "مساهمتك الرمزية تساعدنا في تغطية الخوادم وإبقاء المتجر مجانياً",
                "en": "Your support keeps the platform free, fast, and ad-free"
            },
            "action": {"type": "link", "target": "https://t.me/IA_Ibr"}
        }
    ]

    banners_data.append({
        "id": "ecosystem_guide",
        "action": guide_slides[0]["action"],
        "slides": guide_slides
    })

    with open(BANNERS_JSON_PATH, "w", encoding="utf-8") as f:
        json.dump(banners_data, f, ensure_ascii=False, indent=2)

    print(f"\nSUCCESS! banners.json updated with {len(banners_data)} banner cards and {sum(len(b['slides']) for b in banners_data)} slides.")

if __name__ == "__main__":
    main()
