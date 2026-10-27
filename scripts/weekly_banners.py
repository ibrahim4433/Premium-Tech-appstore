import json
import os
import sys
import time
import re

# Ensure scripts dir is in path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from generate_banners import composite_app_banner, create_guide_banner, get_canonical_tag

APPS_JSON_PATH = "apps.json"
BANNERS_JSON_PATH = "banners.json"

def clean_name(name):
    """Strip unnecessary emoji or channel prefixes from titles."""
    if not name:
        return ""
    name = re.sub(r"^[\s:\-–—•⚡🔥🎮📌💎🚀✨🧊🏷️\u200B-\u200D\uFEFF]+", "", name).strip()
    return name

def is_game(app):
    cat = (app.get("category") or "").lower()
    tags = [t.lower() for t in app.get("tags", [])]
    return "game" in cat or "#games" in tags or get_canonical_tag(app) == "games"

def compute_bayesian_score(app, m, C):
    v = app.get("votes", 0)
    r = app.get("rating", 0.0)
    if v == 0 or r == 0:
        return 0.0
    return (v / (v + m)) * r + (m / (v + m)) * C

def select_master_showcase():
    with open(APPS_JSON_PATH, "r", encoding="utf-8") as f:
        apps = json.load(f)

    # 1. Global Mean Rating for Bayesian formula
    rated_apps = [a for a in apps if a.get("votes", 0) > 0 and a.get("rating", 0) > 0]
    C = sum(a["rating"] for a in rated_apps) / len(rated_apps) if rated_apps else 4.2

    # 2. All-Time Apps & Games
    all_time_apps = [a for a in apps if not is_game(a) and a.get("votes", 0) > 0]
    all_time_games = [a for a in apps if is_game(a) and a.get("votes", 0) > 0]

    all_time_apps.sort(key=lambda a: compute_bayesian_score(a, m=5, C=C), reverse=True)
    all_time_games.sort(key=lambda a: compute_bayesian_score(a, m=3, C=C), reverse=True)

    # 3. Weekly / Fresh Drops (last 7 -> 14 -> 30 -> 90 days fallback ladder)
    max_date = max((a.get("date") or 0) for a in apps) if apps else time.time()
    weekly_apps = []
    weekly_games = []

    for days in [7, 14, 30, 90]:
        cutoff = max_date - (days * 86400)
        recent_a = [a for a in apps if not is_game(a) and (a.get("date") or 0) >= cutoff and a.get("votes", 0) > 0]
        if recent_a and not weekly_apps:
            recent_a.sort(key=lambda a: compute_bayesian_score(a, m=2, C=C), reverse=True)
            weekly_apps = recent_a[:3]

        recent_g = [a for a in apps if is_game(a) and (a.get("date") or 0) >= cutoff and a.get("votes", 0) > 0]
        if recent_g and not weekly_games:
            recent_g.sort(key=lambda a: compute_bayesian_score(a, m=2, C=C), reverse=True)
            weekly_games = recent_g[:2]

    if not weekly_apps:
        weekly_apps = all_time_apps[3:6] if len(all_time_apps) > 5 else all_time_apps[:2]
    if not weekly_games:
        weekly_games = all_time_games[1:3] if len(all_time_games) > 2 else all_time_games[:1]

    # 4. VPN & Security Category
    vpn_apps = [a for a in apps if get_canonical_tag(a) == "vpn" and a.get("votes", 0) > 0]
    vpn_apps.sort(key=lambda a: compute_bayesian_score(a, m=2, C=C), reverse=True)
    if not vpn_apps:
        vpn_apps = [a for a in apps if "vpn" in (a.get("name") or "").lower()][:2]

    # 5. Media & Cinema Category (Watching / Audio)
    media_apps = [a for a in apps if get_canonical_tag(a) in ["watching", "music"] and a.get("votes", 0) > 0]
    media_apps.sort(key=lambda a: compute_bayesian_score(a, m=2, C=C), reverse=True)

    # 6. AI & Smart Bots Category
    ai_apps = [a for a in apps if get_canonical_tag(a) == "ai" and a.get("votes", 0) > 0]
    ai_apps.sort(key=lambda a: compute_bayesian_score(a, m=2, C=C), reverse=True)

    # 7. Tools & Utilities Category
    tools_apps = [a for a in apps if get_canonical_tag(a) == "tools" and a.get("votes", 0) > 0]
    tools_apps.sort(key=lambda a: compute_bayesian_score(a, m=2, C=C), reverse=True)

    return {
        "alltime_apps": all_time_apps[:3],
        "alltime_games": all_time_games[:3],
        "weekly_apps": weekly_apps[:2],
        "weekly_games": weekly_games[:1],
        "vpn_apps": vpn_apps[:2],
        "media_apps": media_apps[:2],
        "ai_apps": ai_apps[:2],
        "tools_apps": tools_apps[:2]
    }

def main():
    print("=== STARTING EXPANDED MASTER BANNER GENERATION PIPELINE ===")
    showcase = select_master_showcase()

    # Step 1: Render All Banner Images
    print("\n1. Rendering Dynamic App & Category Banners...")
    banner_paths = {}

    # All-Time Apps
    for idx, app in enumerate(showcase["alltime_apps"], 1):
        key = f"alltime_app_{idx}"
        banner_paths[key] = composite_app_banner(app, f"{key}.jpg", badge_text=f"ALL-TIME APP #{idx}")

    # All-Time Games
    for idx, game in enumerate(showcase["alltime_games"], 1):
        key = f"alltime_game_{idx}"
        banner_paths[key] = composite_app_banner(game, f"{key}.jpg", badge_text=f"ALL-TIME GAME #{idx}")

    # Weekly Drops
    for idx, app in enumerate(showcase["weekly_apps"], 1):
        key = f"weekly_app_{idx}"
        banner_paths[key] = composite_app_banner(app, f"{key}.jpg", badge_text=f"WEEKLY APP #{idx}")
    for idx, game in enumerate(showcase["weekly_games"], 1):
        key = f"weekly_game_{idx}"
        banner_paths[key] = composite_app_banner(game, f"{key}.jpg", badge_text=f"WEEKLY GAME #{idx}")

    # VPN & Security
    for idx, app in enumerate(showcase["vpn_apps"], 1):
        key = f"vpn_app_{idx}"
        banner_paths[key] = composite_app_banner(app, f"{key}.jpg", badge_text=f"VPN #{idx}")

    # Media & Cinema
    for idx, app in enumerate(showcase["media_apps"], 1):
        key = f"media_app_{idx}"
        banner_paths[key] = composite_app_banner(app, f"{key}.jpg", badge_text=f"MEDIA #{idx}")

    # AI & Smart Bots
    for idx, app in enumerate(showcase["ai_apps"], 1):
        key = f"ai_app_{idx}"
        banner_paths[key] = composite_app_banner(app, f"{key}.jpg", badge_text=f"AI #{idx}")

    # Tools & Utilities
    for idx, app in enumerate(showcase["tools_apps"], 1):
        key = f"tool_app_{idx}"
        banner_paths[key] = composite_app_banner(app, f"{key}.jpg", badge_text=f"TOOL #{idx}")

    # Guide Banners
    print("\n2. Rendering 3D Ecosystem Guide Banners...")
    guide_features_img = create_guide_banner("features", "guide_features.jpg")
    guide_tg_img = create_guide_banner("telegram", "guide_telegram.jpg")
    guide_gh_img = create_guide_banner("github", "guide_github.jpg")
    guide_coffee_img = create_guide_banner("coffee", "guide_coffee.jpg")

    # Step 2: Build banners.json (Master 8-Card Store Lineup)
    print("\n3. Building banners.json with 8 master cards and dynamic slides...")
    banners_data = []

    # --- CARD 1: 🏆 HALL OF FAME APPS ---
    c1_slides = []
    for idx, app in enumerate(showcase["alltime_apps"], 1):
        c_name = clean_name(app["name"])
        c1_slides.append({
            "image": banner_paths[f"alltime_app_{idx}"],
            "badge": {"ar": f"🏆 أسطورة التطبيقات #{idx}", "en": f"ALL-TIME APP #{idx}"},
            "title": {"ar": c_name, "en": c_name},
            "subtitle": {
                "ar": f"التقييم الأعلى في تاريخ المنصة ★ {app.get('rating', 5.0)} ({app.get('votes', 0)} صوت)",
                "en": f"Highest-rated app in store history ★ {app.get('rating', 5.0)} ({app.get('votes', 0)} votes)"
            },
            "action": {"type": "open_app", "appName": app["name"], "appId": str(app.get("id", ""))}
        })
    if c1_slides:
        banners_data.append({"id": "hall_of_fame_apps", "action": c1_slides[0]["action"], "slides": c1_slides})

    # --- CARD 2: 🎮 HALL OF FAME GAMES ---
    c2_slides = []
    for idx, game in enumerate(showcase["alltime_games"], 1):
        g_name = clean_name(game["name"])
        c2_slides.append({
            "image": banner_paths[f"alltime_game_{idx}"],
            "badge": {"ar": f"🎮 صدارة الألعاب #{idx}", "en": f"TOP RATED GAME #{idx}"},
            "title": {"ar": g_name, "en": g_name},
            "subtitle": {
                "ar": f"تجربة ألعاب أسطورية بتقييم ★ {game.get('rating', 4.5)} ({game.get('votes', 0)} صوت)",
                "en": f"Undisputed peak gaming score ★ {game.get('rating', 4.5)} ({game.get('votes', 0)} votes)"
            },
            "action": {"type": "open_app", "appName": game["name"], "appId": str(game.get("id", ""))}
        })
    if c2_slides:
        banners_data.append({"id": "hall_of_fame_games", "action": c2_slides[0]["action"], "slides": c2_slides})

    # --- CARD 3: ⚡ WEEKLY TRENDING SPOTLIGHT ---
    c3_slides = []
    for idx, app in enumerate(showcase["weekly_apps"], 1):
        w_name = clean_name(app["name"])
        c3_slides.append({
            "image": banner_paths[f"weekly_app_{idx}"],
            "badge": {"ar": "⚡ اختيار هذا الأسبوع", "en": "APP OF THE WEEK"},
            "title": {"ar": w_name, "en": w_name},
            "subtitle": {
                "ar": f"الأكثر تميزاً في تصويت المشتركين ★ {app.get('rating', 4.8)} ({app.get('votes', 0)} صوت)",
                "en": f"Trending community drop this week ★ {app.get('rating', 4.8)} ({app.get('votes', 0)} votes)"
            },
            "action": {"type": "open_app", "appName": app["name"], "appId": str(app.get("id", ""))}
        })
    for idx, game in enumerate(showcase["weekly_games"], 1):
        wg_name = clean_name(game["name"])
        c3_slides.append({
            "image": banner_paths[f"weekly_game_{idx}"],
            "badge": {"ar": "🚀 لعبة الأسبوع الجديدة", "en": "GAME OF THE WEEK"},
            "title": {"ar": wg_name, "en": wg_name},
            "subtitle": {
                "ar": f"أقوى لعبة أضيفت حديثاً بتقييم ★ {game.get('rating', 4.5)} ({game.get('votes', 0)} صوت)",
                "en": f"Fresh game drop with top rating ★ {game.get('rating', 4.5)} ({game.get('votes', 0)} votes)"
            },
            "action": {"type": "open_app", "appName": game["name"], "appId": str(game.get("id", ""))}
        })
    if c3_slides:
        banners_data.append({"id": "weekly_spotlight", "action": c3_slides[0]["action"], "slides": c3_slides})

    # --- CARD 4: 🛡️ TOP VPN & SECURITY ---
    c4_slides = []
    for idx, app in enumerate(showcase["vpn_apps"], 1):
        v_name = clean_name(app["name"])
        c4_slides.append({
            "image": banner_paths[f"vpn_app_{idx}"],
            "badge": {"ar": "🛡️ حماية وشبكات VPN", "en": "SECURITY & VPN"},
            "title": {"ar": v_name, "en": v_name},
            "subtitle": {
                "ar": f"فك الحجب وتأمين التصفح بسرعة فائقة ★ {app.get('rating', 4.8)} ({app.get('votes', 0)} صوت)",
                "en": f"Fast proxy & privacy shield ★ {app.get('rating', 4.8)} ({app.get('votes', 0)} votes)"
            },
            "action": {"type": "open_app", "appName": app["name"], "appId": str(app.get("id", ""))}
        })
    if c4_slides:
        banners_data.append({"id": "vpn_security", "action": c4_slides[0]["action"], "slides": c4_slides})

    # --- CARD 5: 🎬 MOVIES, ANIME & ENTERTAINMENT ---
    c5_slides = []
    for idx, app in enumerate(showcase["media_apps"], 1):
        m_name = clean_name(app["name"])
        c5_slides.append({
            "image": banner_paths[f"media_app_{idx}"],
            "badge": {"ar": "🎬 سينما ومشاهدة وموسيقى", "en": "CINEMA & MEDIA"},
            "title": {"ar": m_name, "en": m_name},
            "subtitle": {
                "ar": f"مشاهدة بدون إعلانات وبأعلى جودة ★ {app.get('rating', 4.8)} ({app.get('votes', 0)} صوت)",
                "en": f"Ad-free cinema & high-res streaming ★ {app.get('rating', 4.8)} ({app.get('votes', 0)} votes)"
            },
            "action": {"type": "open_app", "appName": app["name"], "appId": str(app.get("id", ""))}
        })
    if c5_slides:
        banners_data.append({"id": "cinema_media", "action": c5_slides[0]["action"], "slides": c5_slides})

    # --- CARD 6: 🤖 AI & SMART BOTS ---
    c6_slides = []
    for idx, app in enumerate(showcase["ai_apps"], 1):
        ai_name = clean_name(app["name"])
        c6_slides.append({
            "image": banner_paths[f"ai_app_{idx}"],
            "badge": {"ar": "🤖 ذكاء اصطناعي ومساعدات", "en": "SMART AI & BOTS"},
            "title": {"ar": ai_name, "en": ai_name},
            "subtitle": {
                "ar": f"مساعدات ذكية وتوليد فوري بتقييم ★ {app.get('rating', 4.8)} ({app.get('votes', 0)} صوت)",
                "en": f"Generative intelligence & chatbots ★ {app.get('rating', 4.8)} ({app.get('votes', 0)} votes)"
            },
            "action": {"type": "open_app", "appName": app["name"], "appId": str(app.get("id", ""))}
        })
    if c6_slides:
        banners_data.append({"id": "ai_smart_bots", "action": c6_slides[0]["action"], "slides": c6_slides})

    # --- CARD 7: 🛠️ TOOLS & UTILITIES ---
    c7_slides = []
    for idx, app in enumerate(showcase["tools_apps"], 1):
        t_name = clean_name(app["name"])
        c7_slides.append({
            "image": banner_paths[f"tool_app_{idx}"],
            "badge": {"ar": "🛠️ أدوات وأدوات مساعدة", "en": "TOOLS & UTILITIES"},
            "title": {"ar": t_name, "en": t_name},
            "subtitle": {
                "ar": f"أدوات احترافية لتحسين وإدارة هاتفك ★ {app.get('rating', 4.9)} ({app.get('votes', 0)} صوت)",
                "en": f"System optimization & pro utilities ★ {app.get('rating', 4.9)} ({app.get('votes', 0)} votes)"
            },
            "action": {"type": "open_app", "appName": app["name"], "appId": str(app.get("id", ""))}
        })
    if c7_slides:
        banners_data.append({"id": "tools_utilities", "action": c7_slides[0]["action"], "slides": c7_slides})

    # --- CARD 8: 💎 ECOSYSTEM & SUPPORT GUIDE ---
    c8_slides = [
        {
            "image": guide_features_img,
            "badge": {"ar": "💎 مزايا المنصة الحصرية", "en": "STORE FEATURES"},
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
    banners_data.append({"id": "ecosystem_guide", "action": c8_slides[0]["action"], "slides": c8_slides})

    with open(BANNERS_JSON_PATH, "w", encoding="utf-8") as f:
        json.dump(banners_data, f, ensure_ascii=False, indent=2)

    total_slides = sum(len(b["slides"]) for b in banners_data)
    print(f"\nSUCCESS! banners.json updated with {len(banners_data)} master cards and {total_slides} dynamic slides.")

if __name__ == "__main__":
    main()
