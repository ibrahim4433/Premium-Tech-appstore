import json
import os
import sys
import time
import math
import random
import urllib.request
from io import BytesIO
from PIL import Image, ImageDraw, ImageFilter, ImageOps, ImageEnhance

WORKER_URL = "https://appstore-proxy.iateam.workers.dev"
TAG_BG_DIR = os.path.join("assets", "banners", "tag_backgrounds")
OUTPUT_DIR = os.path.join("assets", "banners", "generated")
os.makedirs(TAG_BG_DIR, exist_ok=True)
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Master 16 Categories Color Palettes & Identifiers
CATEGORY_THEMES = {
    "games":        {"primary": (168, 85, 247),  "secondary": (236, 72, 153),  "accent": (56, 189, 248),   "bg": (24, 12, 42)},
    "watching":     {"primary": (239, 68, 68),   "secondary": (249, 115, 22),  "accent": (250, 204, 21),   "bg": (38, 12, 14)},
    "tools":        {"primary": (14, 165, 233),  "secondary": (59, 130, 246),  "accent": (147, 197, 253),  "bg": (8, 24, 44)},
    "editing":      {"primary": (236, 72, 153),  "secondary": (168, 85, 247),  "accent": (251, 191, 36),   "bg": (36, 10, 32)},
    "vpn":          {"primary": (16, 185, 129),  "secondary": (6, 182, 212),   "accent": (255, 255, 255),  "bg": (8, 32, 24)},
    "ai":           {"primary": (139, 92, 246),  "secondary": (56, 189, 248),  "accent": (192, 132, 252),  "bg": (20, 14, 40)},
    "social":       {"primary": (34, 197, 94),   "secondary": (59, 130, 246),  "accent": (255, 255, 255),  "bg": (10, 30, 22)},
    "islamic":      {"primary": (16, 185, 129),  "secondary": (245, 158, 11),  "accent": (254, 240, 138),  "bg": (8, 28, 18)},
    "education":    {"primary": (245, 158, 11),  "secondary": (234, 88, 12),   "accent": (254, 243, 199),  "bg": (34, 20, 8)},
    "music":        {"primary": (236, 72, 153),  "secondary": (139, 92, 246),  "accent": (147, 197, 253),  "bg": (32, 10, 28)},
    "books":        {"primary": (217, 119, 6),   "secondary": (180, 83, 9),    "accent": (253, 230, 138),  "bg": (30, 18, 8)},
    "sports":       {"primary": (34, 197, 94),   "secondary": (234, 179, 8),   "accent": (255, 255, 255),  "bg": (12, 32, 16)},
    "camera":       {"primary": (244, 63, 94),   "secondary": (168, 85, 247),  "accent": (255, 255, 255),  "bg": (34, 10, 18)},
    "browsers":     {"primary": (14, 165, 233),  "secondary": (99, 102, 241),  "accent": (255, 255, 255),  "bg": (10, 22, 44)},
    "wallpapers":   {"primary": (236, 72, 153),  "secondary": (6, 182, 212),   "accent": (250, 204, 21),   "bg": (30, 12, 34)},
    "productivity": {"primary": (59, 130, 246),  "secondary": (16, 185, 129),  "accent": (255, 255, 255),  "bg": (12, 24, 40)},
}

def load_or_download_image(img_ref, timeout=12):
    """Load an image from local filesystem, web URL, or Telegram Worker proxy."""
    if not img_ref:
        return None
    if isinstance(img_ref, str) and (os.path.exists(img_ref) or img_ref.startswith("assets/")):
        if os.path.exists(img_ref):
            try:
                return Image.open(img_ref).convert("RGBA")
            except Exception:
                pass
                
    if isinstance(img_ref, str) and (img_ref.startswith("http://") or img_ref.startswith("https://")):
        url = img_ref
    else:
        url = f"{WORKER_URL}/?id={img_ref}&action=image"

    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    try:
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            data = resp.read()
            return Image.open(BytesIO(data)).convert("RGBA")
    except Exception as e:
        print(f"Warning: Failed to load image {str(img_ref)[:25]}...: {e}")
        return None

def get_dominant_color(image):
    """Extract dominant vibrant color from an image."""
    if not image:
        return (14, 165, 233)
    img = image.copy().convert("RGB")
    img = img.resize((50, 50))
    colors = img.getcolors(50 * 50)
    if not colors:
        return (14, 165, 233)
    vibrant_colors = []
    for count, (r, g, b) in colors:
        brightness = (r * 299 + g * 587 + b * 114) / 1000
        saturation = max(r, g, b) - min(r, g, b)
        if 40 < brightness < 225 and saturation > 25:
            vibrant_colors.append((count * (saturation + 10), (r, g, b)))
    if vibrant_colors:
        vibrant_colors.sort(reverse=True, key=lambda x: x[0])
        return vibrant_colors[0][1]
    return (14, 165, 233)

def create_squircle_mask(size, radius):
    scale = 4
    w, h = size[0] * scale, size[1] * scale
    r = radius * scale
    mask = Image.new("L", (w, h), 0)
    draw = ImageDraw.Draw(mask)
    draw.rounded_rectangle([(0, 0), (w, h)], radius=r, fill=255)
    return mask.resize(size, Image.Resampling.LANCZOS)

def get_canonical_tag(app):
    """Accurately classify any app into one of the 16 Master Store Categories."""
    category = (app.get("category") or "").lower()
    tags = [t.lower().replace("#", "") for t in app.get("tags", [])]
    name = (app.get("name") or "").lower()
    desc = ((app.get("description") or "") + " " + (app.get("description_en") or "")).lower()

    # 1. Islamic & Quran
    if any(w in name or w in desc or any(w in t for t in tags) for w in ["quran", "islam", "prayer", "athkar", "azkar", "adhan", "tafseer", "قرآن", "إسلام", "اذكار", "صلاة"]):
        return "islamic"

    # 2. VPN & Security
    if any(w in name or any(w in t for t in tags) for w in ["vpn", "proxy", "shield", "tunnel", "dns", "firewall", "unblock", "حماية"]):
        return "vpn"

    # 3. AI & Smart Bots
    if any(w in name or any(w in t for t in tags) for w in ["ai", "gpt", "chatbot", "chatgpt", "gemini", "claude", "bot", "assistant", "ذكاء"]):
        return "ai"

    # 4. Games & Entertainment
    if "game" in category or any("game" in t for t in tags) or any(w in name for w in ["game", "racer", "racing", "gta", "psp", "simulator", "minecraft", "sonic", "driving", "asphalt"]):
        return "games"

    # 5. Movies & Live TV
    if any(w in name or w in desc or any(w in t for t in tags) for w in ["watching", "movie", "tv", "cinema", "iptv", "stream", "anime", "drama", "player", "مشاهدة", "أفلام", "مباريات"]):
        return "watching"

    # 6. Editing & Design
    if any(w in name or any(w in t for t in tags) for w in ["editing", "editor", "videoeditor", "capcut", "lightroom", "picsart", "montage", "reels", "filter", "مونتاج", "تصميم"]):
        return "editing"

    # 7. Camera & Photography
    if any(w in name or any(w in t for t in tags) for w in ["camera", "photography", "cam", "lens", "dslr", "photo", "selfie", "كاميرا", "تصوير"]):
        return "camera"

    # 8. Music & Audio
    if any(w in name or any(w in t for t in tags) for w in ["music", "audio", "sound", "spotify", "mp3", "podcast", "radio", "song", "موسيقى", "صوت"]):
        return "music"

    # 9. Social & Communication
    if any(w in name or any(w in t for t in tags) for w in ["social", "chat", "whatsapp", "telegram", "messenger", "insta", "tiktok", "calling", "تواصل"]):
        return "social"

    # 10. Education & Learning
    if any(w in name or any(w in t for t in tags) for w in ["education", "learning", "duolingo", "study", "course", "code", "programming", "تعليم", "لغات"]):
        return "education"

    # 11. Books & Documents
    if any(w in name or any(w in t for t in tags) for w in ["books", "book", "pdf", "reader", "dictionary", "notes", "كتب"]):
        return "books"

    # 12. Sports & Fitness
    if any(w in name or any(w in t for t in tags) for w in ["sports", "football", "score", "fitness", "workout", "soccer", "gym", "رياضة"]):
        return "sports"

    # 13. Browsers & Web
    if any(w in name or any(w in t for t in tags) for w in ["browser", "browsers", "web", "chrome", "edge", "opera", "brave", "متصفح"]):
        return "browsers"

    # 14. Wallpapers & Themes
    if any(w in name or any(w in t for t in tags) for w in ["wallpaper", "wallpapers", "theme", "themes", "iconpack", "launcher", "خلفيات", "ثيمات"]):
        return "wallpapers"

    # 15. Productivity & Office
    if any(w in name or any(w in t for t in tags) for w in ["productivity", "office", "wps", "word", "excel", "sheet", "planner", "إنتاجية"]):
        return "productivity"

    # 16. Tools & Utilities (Default Fallback)
    return "tools"

def load_tag_background(tag, width=1200, height=600):
    """Load the dedicated background for the category or render a rich procedural canvas."""
    primary_filename = f"tag_{tag}.jpg"
    primary_path = os.path.join(TAG_BG_DIR, primary_filename)
    
    if os.path.exists(primary_path):
        try:
            img = Image.open(primary_path).convert("RGBA")
            # Apply slight vibrancy & brightness boost
            enhancer = ImageEnhance.Color(img)
            img = enhancer.enhance(1.2)
            b_enhancer = ImageEnhance.Brightness(img)
            img = b_enhancer.enhance(1.1)
            print(f"   -> [Tag BG Loaded] {primary_path}")
            return ImageOps.fit(img, (width, height), method=Image.Resampling.LANCZOS)
        except Exception as e:
            print(f"Warning loading tag background {primary_path}: {e}")

    # Fallback to aliases
    alias_map = {
        "watching": "tag_media.jpg",
        "camera": "tag_photos.jpg",
        "music": "tag_audio.jpg",
    }
    alias_file = alias_map.get(tag)
    if alias_file:
        alias_path = os.path.join(TAG_BG_DIR, alias_file)
        if os.path.exists(alias_path):
            try:
                img = Image.open(alias_path).convert("RGBA")
                return ImageOps.fit(img, (width, height), method=Image.Resampling.LANCZOS)
            except Exception:
                pass

    # High-Craft Procedural Canvas
    cfg = CATEGORY_THEMES.get(tag, CATEGORY_THEMES["tools"])
    bg_r, bg_g, bg_b = cfg["bg"]
    pr, pg, pb = cfg["primary"]

    canvas = Image.new("RGBA", (width, height), (bg_r, bg_g, bg_b, 255))
    draw = ImageDraw.Draw(canvas)
    for y in range(height):
        ratio = y / height
        cr = int(bg_r * (1 - ratio * 0.4))
        cg = int(bg_g * (1 - ratio * 0.4))
        cb = int(bg_b * (1 - ratio * 0.4))
        draw.line([(0, y), (width, y)], fill=(cr, cg, cb, 255))
        
    # Large Radiant Ambient Glow on the Right
    orb = Image.new("RGBA", (800, 800), (0, 0, 0, 0))
    orb_draw = ImageDraw.Draw(orb)
    for rad in range(380, 0, -10):
        alpha = int(90 * (1 - rad / 380))
        orb_draw.ellipse([(400 - rad, 400 - rad), (400 + rad, 400 + rad)], fill=(pr, pg, pb, alpha))
    canvas.alpha_composite(orb, (int(width * 0.72) - 400, height // 2 - 400))
    return canvas

def draw_thematic_tag_effects(canvas, tag, dom_color, width=1200, height=600, cx=None, cy=None):
    """Draw high-contrast, luminous visual effects matching each of the 16 categories."""
    effects = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    draw = ImageDraw.Draw(effects)
    r, g, b = dom_color
    if cx is None:
        cx = int(width * 0.775)
    if cy is None:
        cy = int(height * 0.50)

    # 1. Games: Cyber HUD & Targeting Crosshairs & Laser Grid
    if tag == "games":
        hud_c = (r, g, b, 140)
        hw, hh = 195, 195
        arm = 40
        draw.line([(cx - hw, cy - hh), (cx - hw + arm, cy - hh)], fill=hud_c, width=3)
        draw.line([(cx - hw, cy - hh), (cx - hw, cy - hh + arm)], fill=hud_c, width=3)
        draw.line([(cx + hw, cy - hh), (cx + hw - arm, cy - hh)], fill=hud_c, width=3)
        draw.line([(cx + hw, cy - hh), (cx + hw, cy - hh + arm)], fill=hud_c, width=3)
        draw.line([(cx - hw, cy + hh), (cx - hw + arm, cy + hh)], fill=hud_c, width=3)
        draw.line([(cx - hw, cy + hh), (cx - hw, cy + hh - arm)], fill=hud_c, width=3)
        draw.line([(cx + hw, cy + hh), (cx + hw - arm, cy + hh)], fill=hud_c, width=3)
        draw.line([(cx + hw, cy + hh), (cx + hw, cy + hh - arm)], fill=hud_c, width=3)
        for i in range(5):
            gy = height - 12 - i * 16
            draw.line([(int(width * 0.55), gy), (width, gy)], fill=(r, g, b, int(60 * (1 - i / 5))), width=1)

    # 2. Movies & Live TV: Cinema Spotlights & Lens Flares
    elif tag == "watching":
        draw.ellipse([(int(width * 0.45), cy - 6), (width, cy + 6)], fill=(r, g, b, 60))
        random.seed(r + g + b)
        for _ in range(16):
            bx = random.randint(int(width * 0.55), width - 30)
            by = random.randint(50, height - 50)
            brad = random.randint(14, 40)
            draw.ellipse([(bx - brad, by - brad), (bx + brad, by + brad)], fill=(r, g, b, random.randint(25, 60)))

    # 3. Tools & Utilities: Circuit Traces & Hardware Bus Lines
    elif tag == "tools":
        c_col = (r, g, b, 120)
        traces = [
            [(width - 380, 80), (width - 240, 80), (width - 200, 120), (width - 80, 120)],
            [(width - 450, 480), (width - 320, 480), (width - 270, 530), (width - 120, 530)],
            [(width - 160, 200), (width - 160, 290), (width - 120, 330)],
        ]
        for tr in traces:
            draw.line(tr, fill=c_col, width=2)
            draw.ellipse([(tr[-1][0] - 4, tr[-1][1] - 4), (tr[-1][0] + 4, tr[-1][1] + 4)], fill=(255, 255, 255, 180))

    # 4. VPN & Security: Cyber Shield Rings & Radar Wave
    elif tag == "vpn":
        for rad in [170, 215, 260]:
            draw.ellipse([(cx - rad, cy - rad), (cx + rad, cy + rad)], outline=(16, 185, 129, 75), width=2)
        draw.arc([(cx - 215, cy - 215), (cx + 215, cy + 215)], start=-45, end=45, fill=(56, 189, 248, 140), width=3)

    # 5. AI & Smart Bots: Neural Synapses & Quantum Nodes
    elif tag == "ai":
        nodes = [(cx - 140, cy - 80), (cx + 120, cy - 90), (cx + 140, cy + 80), (cx - 120, cy + 90), (cx, cy - 130), (cx + 80, cy + 140)]
        for pt in nodes:
            draw.line([(cx, cy), pt], fill=(139, 92, 246, 80), width=2)
            draw.ellipse([(pt[0] - 6, pt[1] - 6), (pt[0] + 6, pt[1] + 6)], fill=(56, 189, 248, 220))

    # 6. Editing & Design: Color Swatches & Crop Guides
    elif tag == "editing":
        swatch_colors = [(236, 72, 153, 140), (168, 85, 247, 140), (56, 189, 248, 140), (251, 191, 36, 140)]
        for idx, sc in enumerate(swatch_colors):
            sx = cx + int(190 * math.cos(math.radians(idx * 60 - 60)))
            sy = cy + int(190 * math.sin(math.radians(idx * 60 - 60)))
            draw.ellipse([(sx - 16, sy - 16), (sx + 16, sy + 16)], fill=sc)
            draw.ellipse([(sx - 8, sy - 8), (sx + 8, sy + 8)], fill=(255, 255, 255, 180))
        draw.line([(cx - 160, cy - 140), (cx + 160, cy + 140)], fill=(236, 72, 153, 80), width=2)

    # 7. Social & Communication: Chat Bubbles & Network Wave
    elif tag == "social":
        for rad in [180, 240]:
            draw.arc([(cx - rad, cy - rad), (cx + rad, cy + rad)], start=140, end=270, fill=(34, 197, 94, 90), width=2)
        bx, by = cx - 180, cy - 120
        draw.rounded_rectangle([(bx, by), (bx + 70, by + 45)], radius=12, fill=(34, 197, 94, 100))
        draw.polygon([(bx + 15, by + 45), (bx + 8, by + 58), (bx + 28, by + 45)], fill=(34, 197, 94, 100))

    # 8. Islamic & Quran: Arabesque Geometric Rays & Rub el Hizb
    elif tag == "islamic":
        for i in range(12):
            ang = math.radians(30 * i)
            lx = cx + 210 * math.cos(ang)
            ly = cy + 210 * math.sin(ang)
            draw.line([(cx, cy), (lx, ly)], fill=(245, 158, 11, 55), width=2)
        draw.ellipse([(cx - 180, cy - 180), (cx + 180, cy + 180)], outline=(254, 240, 138, 80), width=2)

    # 9. Education & Learning: Atomic Orbital Rings & Wisdom Sparks
    elif tag == "education":
        for ang in [-30, 30, 90]:
            draw.arc([(cx - 200, cy - 90), (cx + 200, cy + 90)], start=0, end=360, fill=(245, 158, 11, 75), width=2)
        draw.ellipse([(cx - 8, cy - 8), (cx + 8, cy + 8)], fill=(255, 255, 255, 220))

    # 10. Music & Audio: Graphic Equalizer & Audio Wave
    elif tag == "music":
        base_x = int(width * 0.86)
        bar_w = 7
        gap = 5
        random.seed(r + g)
        for i in range(14):
            bx = base_x + i * (bar_w + gap)
            b_h = random.randint(35, 140)
            by1 = height - 90 - b_h
            draw.rounded_rectangle([(bx, by1), (bx + bar_w, height - 90)], radius=3, fill=(r, g, b, 140))
            draw.rounded_rectangle([(bx, by1), (bx + bar_w, by1 + 5)], radius=2, fill=(255, 255, 255, 220))

    # 11. Books & Documents: Knowledge Contour Curves
    elif tag == "books":
        for i in range(4):
            curve_y = cy + 120 + i * 14
            draw.arc([(cx - 180, curve_y - 40), (cx, curve_y + 40)], start=280, end=360, fill=(217, 119, 6, 90), width=2)
            draw.arc([(cx, curve_y - 40), (cx + 180, curve_y + 40)], start=180, end=260, fill=(217, 119, 6, 90), width=2)

    # 12. Sports & Fitness: Kinetic Velocity Streaks
    elif tag == "sports":
        for i in range(6):
            sy = 120 + i * 55
            draw.line([(cx - 160 + i * 20, sy), (cx + 180 + i * 20, sy - 40)], fill=(34, 197, 94, 110), width=3)

    # 13. Camera & Photography: Viewfinder Brackets & Focus Hexagon
    elif tag == "camera":
        vw, vh = 170, 140
        b_c = (244, 63, 94, 120)
        draw.line([(cx - vw, cy - vh), (cx - vw + 30, cy - vh)], fill=b_c, width=3)
        draw.line([(cx - vw, cy - vh), (cx - vw, cy - vh + 30)], fill=b_c, width=3)
        draw.line([(cx + vw, cy - vh), (cx + vw - 30, cy - vh)], fill=b_c, width=3)
        draw.line([(cx + vw, cy - vh), (cx + vw, cy - vh + 30)], fill=b_c, width=3)
        draw.line([(cx - vw, cy + vh), (cx - vw + 30, cy + vh)], fill=b_c, width=3)
        draw.line([(cx - vw, cy + vh), (cx - vw, cy + vh - 30)], fill=b_c, width=3)
        draw.line([(cx + vw, cy + vh), (cx + vw - 30, cy + vh)], fill=b_c, width=3)
        draw.line([(cx + vw, cy + vh), (cx + vw, cy + vh - 30)], fill=b_c, width=3)
        draw.ellipse([(cx - 6, cy - 6), (cx + 6, cy + 6)], fill=(255, 255, 255, 200))

    # 14. Browsers & Web: Globe Wireframe & Digital Beams
    elif tag == "browsers":
        for rad in [160, 210]:
            draw.ellipse([(cx - rad, cy - rad), (cx + rad, cy + rad)], outline=(14, 165, 233, 75), width=2)
        draw.line([(cx - 210, cy), (cx + 210, cy)], fill=(14, 165, 233, 85), width=2)
        draw.arc([(cx - 110, cy - 210), (cx + 110, cy + 210)], start=0, end=360, fill=(99, 102, 241, 75), width=2)

    # 15. Wallpapers & Themes: Prismatic AMOLED Crystal Geometry
    elif tag == "wallpapers":
        poly_pts = [
            (cx, cy - 180), (cx + 160, cy - 60), (cx + 100, cy + 140),
            (cx - 100, cy + 140), (cx - 160, cy - 60)
        ]
        draw.polygon(poly_pts, outline=(236, 72, 153, 90), width=2)
        for pt in poly_pts:
            draw.line([(cx, cy), pt], fill=(6, 182, 212, 70), width=1)
            draw.ellipse([(pt[0] - 4, pt[1] - 4), (pt[0] + 4, pt[1] + 4)], fill=(255, 255, 255, 180))

    # 16. Productivity & Office: Ascending Analytics Trendline & Milestones
    elif tag == "productivity":
        chart_pts = [
            (cx - 180, cy + 120), (cx - 110, cy + 80), (cx - 40, cy + 95),
            (cx + 40, cy + 10), (cx + 120, cy - 40), (cx + 180, cy - 110)
        ]
        draw.line(chart_pts, fill=(16, 185, 129, 130), width=3)
        for pt in chart_pts:
            draw.ellipse([(pt[0] - 6, pt[1] - 6), (pt[0] + 6, pt[1] + 6)], fill=(59, 130, 246, 200))
            draw.ellipse([(pt[0] - 3, pt[1] - 3), (pt[0] + 3, pt[1] + 3)], fill=(255, 255, 255, 240))

    canvas.alpha_composite(effects, (0, 0))

def composite_app_banner(app, filename, badge_text="TOP RATED"):
    """
    Renders a vibrant, high-contrast, beautiful banner:
    1. Rich tag background (bright & scenic)
    2. Subtle ambient bloom matched to app's icon
    3. Category visual effects
    4. Framed phone mockup (if screenshot) + 3D squircle app icon
    5. Soft left vignette (ensures text visibility without black mud)
    """
    width, height = 1200, 600
    app_name = (app.get("name") or "App").strip()
    tag = get_canonical_tag(app)
    
    print(f"\n=======================================================")
    print(f"Compositing [{badge_text}]: {app_name} | Category: '{tag}' -> {filename}")

    # 1. Base Layer
    bg_image = load_tag_background(tag, width, height)
    canvas = bg_image.copy()

    # 2. Icon and Screenshots
    icon = load_or_download_image(app.get("icon_id"))
    dom_color = get_dominant_color(icon)
    r, g, b = dom_color
    
    screenshot = None
    if app.get("screenshots") and len(app["screenshots"]) > 0:
        screenshot = load_or_download_image(app["screenshots"][0])

    # 3. Ambient Color Bloom (Aligned to Unified Focal Center)
    center_x = int(width * 0.775)
    center_y = int(height * 0.50)

    bloom = Image.new("RGBA", (580, 580), (0, 0, 0, 0))
    bloom_draw = ImageDraw.Draw(bloom)
    for rad in range(280, 0, -8):
        alpha = int(80 * (1 - rad / 280))
        bloom_draw.ellipse([(290 - rad, 290 - rad), (290 + rad, 290 + rad)], fill=(r, g, b, alpha))
    canvas.alpha_composite(bloom, (center_x - 290, center_y - 290))

    # 4. Thematic Effects (Centered at Exact Same Focal Point)
    draw_thematic_tag_effects(canvas, tag, dom_color, width, height, cx=center_x, cy=center_y)

    # 5. Soft, Controlled Left Vignette (Leaves Background Visible, No Black Mud!)
    soft_vignette = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    sv_draw = ImageDraw.Draw(soft_vignette)
    for x in range(int(width * 0.55)):
        ratio = x / (width * 0.55)
        # Smoothly tapers from 110 opacity on far left to 0 at center!
        alpha = int(115 * ((1 - ratio) ** 1.6))
        sv_draw.line([(x, 0), (x, height)], fill=(6, 12, 22, alpha))
    canvas.alpha_composite(soft_vignette, (0, 0))

    # 6. Showcase: Screenshot Card Mockup + App Icon Squircle
    if screenshot:
        print(f"   -> Found screenshot: compositing device mockup")
        sc_w, sc_h = 320, 480
        sc_crop = ImageOps.fit(screenshot, (sc_w, sc_h), method=Image.Resampling.LANCZOS)
        sc_mask = create_squircle_mask((sc_w, sc_h), 28)
        
        # Soft Mockup Shadow
        sc_shadow = Image.new("RGBA", (sc_w + 60, sc_h + 60), (0, 0, 0, 0))
        sc_shadow_draw = ImageDraw.Draw(sc_shadow)
        sc_shadow_draw.rounded_rectangle([(30, 35), (sc_w + 30, sc_h + 35)], radius=28, fill=(0, 0, 0, 160))
        sc_shadow = sc_shadow.filter(ImageFilter.GaussianBlur(18))
        
        card_x = center_x - 190
        card_y = center_y - 235
        canvas.alpha_composite(sc_shadow, (card_x - 30, card_y - 30))
        
        # Framed Phone Card
        sc_framed = Image.new("RGBA", (sc_w, sc_h), (0, 0, 0, 0))
        sc_framed.paste(sc_crop, (0, 0), sc_mask)
        sc_border = ImageDraw.Draw(sc_framed)
        sc_border.rounded_rectangle([(0, 0), (sc_w - 1, sc_h - 1)], radius=28, outline=(255, 255, 255, 80), width=2)
        canvas.alpha_composite(sc_framed, (card_x, card_y))

        # Floating Overlapping Icon
        if icon:
            icon_size = 230
            icon_res = icon.resize((icon_size, icon_size), Image.Resampling.LANCZOS)
            icon_mask = create_squircle_mask((icon_size, icon_size), int(icon_size * 0.22))
            
            shadow_pad = 60
            icon_shadow = Image.new("RGBA", (icon_size + shadow_pad * 2, icon_size + shadow_pad * 2), (0, 0, 0, 0))
            ish_draw = ImageDraw.Draw(icon_shadow)
            ish_draw.rounded_rectangle(
                [(shadow_pad, shadow_pad + 16), (shadow_pad + icon_size, shadow_pad + icon_size + 16)],
                radius=int(icon_size * 0.22),
                fill=(0, 0, 0, 190)
            )
            icon_shadow = icon_shadow.filter(ImageFilter.GaussianBlur(22))
            
            icon_x = center_x - 30
            icon_y = center_y + 30
            canvas.alpha_composite(icon_shadow, (icon_x - shadow_pad, icon_y - shadow_pad))
            
            icon_framed = Image.new("RGBA", (icon_size, icon_size), (0, 0, 0, 0))
            icon_framed.paste(icon_res, (0, 0), icon_mask)
            icon_border = ImageDraw.Draw(icon_framed)
            icon_border.rounded_rectangle([(0, 0), (icon_size - 1, icon_size - 1)], radius=int(icon_size * 0.22), outline=(255, 255, 255, 110), width=2)
            canvas.alpha_composite(icon_framed, (icon_x, icon_y))
    else:
        # Hero App Icon Showcase on Elevated Glass Backplate
        print(f"   -> No screenshot: compositing hero icon showcase")
        if icon:
            icon_size = 270
            icon_res = icon.resize((icon_size, icon_size), Image.Resampling.LANCZOS)
            icon_mask = create_squircle_mask((icon_size, icon_size), int(icon_size * 0.22))
            
            bp_w, bp_h = 340, 340
            backplate = Image.new("RGBA", (bp_w, bp_h), (0, 0, 0, 0))
            bp_draw = ImageDraw.Draw(backplate)
            bp_draw.rounded_rectangle([(0, 0), (bp_w - 1, bp_h - 1)], radius=44, fill=(10, 18, 30, 140), outline=(255, 255, 255, 55), width=2)
            
            shadow_pad = 70
            icon_shadow = Image.new("RGBA", (icon_size + shadow_pad * 2, icon_size + shadow_pad * 2), (0, 0, 0, 0))
            ish_draw = ImageDraw.Draw(icon_shadow)
            ish_draw.rounded_rectangle(
                [(shadow_pad, shadow_pad + 16), (shadow_pad + icon_size, shadow_pad + icon_size + 16)],
                radius=int(icon_size * 0.22),
                fill=(0, 0, 0, 200)
            )
            icon_shadow = icon_shadow.filter(ImageFilter.GaussianBlur(24))
            
            pos_x = center_x - icon_size // 2
            pos_y = center_y - icon_size // 2
            
            bp_x = center_x - bp_w // 2
            bp_y = center_y - bp_h // 2
            
            canvas.alpha_composite(backplate, (bp_x, bp_y))
            canvas.alpha_composite(icon_shadow, (pos_x - shadow_pad, pos_y - shadow_pad))
            
            icon_framed = Image.new("RGBA", (icon_size, icon_size), (0, 0, 0, 0))
            icon_framed.paste(icon_res, (0, 0), icon_mask)
            icon_border = ImageDraw.Draw(icon_framed)
            icon_border.rounded_rectangle([(0, 0), (icon_size - 1, icon_size - 1)], radius=int(icon_size * 0.22), outline=(255, 255, 255, 110), width=2)
            canvas.alpha_composite(icon_framed, (pos_x, pos_y))

    final_rgb = canvas.convert("RGB")
    out_path = os.path.join(OUTPUT_DIR, filename)
    final_rgb.save(out_path, "JPEG", quality=88, optimize=True)
    size_kb = os.path.getsize(out_path) / 1024
    print(f"   -> [Banner Saved] {out_path} ({size_kb:.1f} KB)")
    return f"assets/banners/generated/{filename}"

def create_guide_banner(theme, filename):
    """
    Renders a vibrant, high-craft brand guide banner with bright ambient lighting
    and a bold, glowing 3D-styled vector illustration.
    """
    width, height = 1200, 600
    canvas = Image.new("RGBA", (width, height), (10, 18, 32, 255))
    
    themes = {
        "features": {
            "bg_dark": (6, 24, 44),
            "bg_bright": (14, 58, 98),
            "primary": (17, 166, 212),
            "secondary": (56, 189, 248),
            "accent": (250, 204, 21)
        },
        "telegram": {
            "bg_dark": (10, 32, 58),
            "bg_bright": (24, 82, 138),
            "primary": (34, 158, 217),
            "secondary": (96, 196, 248),
            "accent": (255, 255, 255)
        },
        "github": {
            "bg_dark": (13, 27, 20),
            "bg_bright": (22, 64, 42),
            "primary": (46, 160, 67),
            "secondary": (86, 211, 100),
            "accent": (88, 166, 255)
        },
        "coffee": {
            "bg_dark": (38, 20, 8),
            "bg_bright": (92, 48, 16),
            "primary": (217, 119, 6),
            "secondary": (245, 158, 11),
            "accent": (254, 240, 138)
        }
    }
    cfg = themes.get(theme, themes["features"])
    pr, pg, pb = cfg["primary"]
    sr, sg, sb = cfg["secondary"]

    # Atmospheric Background
    bg_draw = ImageDraw.Draw(canvas)
    for y in range(height):
        r_ratio = y / height
        cr = int(cfg["bg_dark"][0] * (1 - r_ratio) + cfg["bg_bright"][0] * r_ratio)
        cg = int(cfg["bg_dark"][1] * (1 - r_ratio) + cfg["bg_bright"][1] * r_ratio)
        cb = int(cfg["bg_dark"][2] * (1 - r_ratio) + cfg["bg_bright"][2] * r_ratio)
        bg_draw.line([(0, y), (width, y)], fill=(cr, cg, cb, 255))

    # Ambient Light Blooms
    center_x = int(width * 0.76)
    center_y = int(height * 0.50)
    
    bloom = Image.new("RGBA", (800, 800), (0, 0, 0, 0))
    bloom_draw = ImageDraw.Draw(bloom)
    for rad in range(380, 0, -10):
        alpha = int(120 * (1 - rad / 380))
        bloom_draw.ellipse([(400 - rad, 400 - rad), (400 + rad, 400 + rad)], fill=(pr, pg, pb, alpha))
    canvas.alpha_composite(bloom, (center_x - 400, center_y - 400))

    for rad in [170, 220, 270]:
        ring = Image.new("RGBA", (width, height), (0, 0, 0, 0))
        rd = ImageDraw.Draw(ring)
        rd.ellipse([(center_x - rad, center_y - rad), (center_x + rad, center_y + rad)], outline=(sr, sg, sb, 45), width=2)
        canvas.alpha_composite(ring, (0, 0))

    # Vector Artwork
    art_layer = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    draw = ImageDraw.Draw(art_layer)

    if theme == "telegram":
        badge_r = 130
        for r_step in range(badge_r, 0, -4):
            val = r_step / badge_r
            draw.ellipse([(center_x - r_step, center_y - r_step), (center_x + r_step, center_y + r_step)], fill=(int(pr * val + 40 * (1 - val)), int(pg * val + 180 * (1 - val)), int(pb * val + 245 * (1 - val)), 255))
        draw.ellipse([(center_x - badge_r, center_y - badge_r), (center_x + badge_r, center_y + badge_r)], outline=(255, 255, 255, 180), width=4)
        pts_plane = [(center_x + 60, center_y - 35), (center_x - 55, center_y + 15), (center_x - 15, center_y + 35), (center_x + 25, center_y + 20)]
        draw.polygon(pts_plane, fill=(255, 255, 255, 255))
        draw.polygon([(center_x + 60, center_y - 35), (center_x - 55, center_y + 15), (center_x - 5, center_y - 5)], fill=(235, 245, 255, 255))
        draw.polygon([(center_x - 15, center_y + 35), (center_x - 5, center_y - 5), (center_x + 10, center_y + 15)], fill=(180, 215, 245, 255))
        for i, dist in enumerate([160, 195, 230]):
            draw.arc([(center_x - dist, center_y - dist), (center_x + dist, center_y + dist)], start=310, end=410, fill=(255, 255, 255, int(180 * (1 - i / 3))), width=3)

    elif theme == "github":
        badge_r = 135
        hex_pts = [(center_x + badge_r * math.cos(math.radians(60 * i - 30)), center_y + badge_r * math.sin(math.radians(60 * i - 30))) for i in range(6)]
        draw.polygon(hex_pts, fill=(20, 35, 28, 230), outline=(sr, sg, sb, 220))
        n1 = (center_x - 45, center_y + 45)
        n2 = (center_x - 45, center_y - 45)
        n3 = (center_x + 45, center_y - 15)
        draw.line([n1, n2], fill=(sr, sg, sb, 220), width=6)
        draw.line([n1, (center_x, center_y + 45), n3], fill=(sr, sg, sb, 220), width=6)
        for pt in [n1, n2, n3]:
            draw.ellipse([(pt[0] - 18, pt[1] - 18), (pt[0] + 18, pt[1] + 18)], fill=(46, 160, 67, 255), outline=(255, 255, 255), width=4)
            draw.ellipse([(pt[0] - 8, pt[1] - 8), (pt[0] + 8, pt[1] + 8)], fill=(255, 255, 255))

    elif theme == "coffee":
        cup_w, cup_h = 140, 110
        top_x1, top_y1 = center_x - cup_w // 2, center_y - cup_h // 2 + 20
        top_x2, top_y2 = center_x + cup_w // 2, center_y + cup_h // 2 + 20
        draw.rounded_rectangle([(top_x1, top_y1), (top_x2, top_y2)], radius=24, fill=(245, 158, 11, 240), outline=(254, 240, 138, 255), width=4)
        draw.arc([(top_x2 - 15, top_y1 + 10), (top_x2 + 45, top_y2 - 20)], start=270, end=90, fill=(245, 158, 11, 255), width=10)
        draw.arc([(top_x2 - 15, top_y1 + 10), (top_x2 + 45, top_y2 - 20)], start=270, end=90, fill=(254, 240, 138, 255), width=3)
        draw.ellipse([(center_x - 100, top_y2 - 10), (center_x + 100, top_y2 + 20)], fill=(217, 119, 6, 255), outline=(254, 240, 138, 220), width=3)
        hx, hy = center_x, top_y1 + 50
        draw.polygon([(hx, hy + 18), (hx - 18, hy), (hx - 9, hy - 14), (hx, hy - 6), (hx + 9, hy - 14), (hx + 18, hy)], fill=(255, 255, 255, 240))
        for ox in [-25, 0, 25]:
            draw.arc([(center_x + ox - 15, top_y1 - 50), (center_x + ox + 15, top_y1 - 10)], start=200, end=340, fill=(254, 240, 138, 190), width=4)

    elif theme == "features":
        shield_w, shield_h = 160, 200
        sx1, sy1 = center_x - shield_w // 2, center_y - shield_h // 2
        sx2, sy2 = center_x + shield_w // 2, center_y + shield_h // 2
        pts_shield = [(center_x, sy1), (sx2, sy1 + 45), (sx2 - 15, sy2 - 40), (center_x, sy2), (sx1 + 15, sy2 - 40), (sx1, sy1 + 45)]
        draw.polygon(pts_shield, fill=(14, 58, 98, 220), outline=(56, 189, 248, 255), width=4)
        lx, ly = center_x, center_y
        pts_bolt = [(lx + 8, ly - 50), (lx - 25, ly + 5), (lx - 2, ly + 5), (lx - 12, ly + 50), (lx + 25, ly - 5), (lx + 2, ly - 5)]
        draw.polygon(pts_bolt, fill=(250, 204, 21, 255), outline=(255, 255, 255, 230), width=2)

    canvas.alpha_composite(art_layer, (0, 0))

    # Soft, Controlled Left Vignette
    soft_vignette = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    sv_draw = ImageDraw.Draw(soft_vignette)
    for x in range(int(width * 0.55)):
        ratio = x / (width * 0.55)
        alpha = int(115 * ((1 - ratio) ** 1.6))
        sv_draw.line([(x, 0), (x, height)], fill=(6, 12, 22, alpha))
    canvas.alpha_composite(soft_vignette, (0, 0))

    final_rgb = canvas.convert("RGB")
    out_path = os.path.join(OUTPUT_DIR, filename)
    final_rgb.save(out_path, "JPEG", quality=88, optimize=True)
    return f"assets/banners/generated/{filename}"
