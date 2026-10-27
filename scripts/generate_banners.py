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

def load_or_download_image(img_ref, timeout=12):
    """Load an image from local filesystem, web URL, or Telegram Worker proxy."""
    if not img_ref:
        return None
    
    # 1. Local filesystem path check
    if isinstance(img_ref, str) and (os.path.exists(img_ref) or img_ref.startswith("assets/")):
        if os.path.exists(img_ref):
            try:
                return Image.open(img_ref).convert("RGBA")
            except Exception:
                pass
                
    # 2. Remote URL or Telegram file_id via Worker
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
        return (0, 168, 232)
    img = image.copy().convert("RGB")
    img = img.resize((50, 50))
    colors = img.getcolors(50 * 50)
    if not colors:
        return (0, 168, 232)
    vibrant_colors = []
    for count, (r, g, b) in colors:
        brightness = (r * 299 + g * 587 + b * 114) / 1000
        saturation = max(r, g, b) - min(r, g, b)
        if 40 < brightness < 225 and saturation > 25:
            vibrant_colors.append((count * (saturation + 10), (r, g, b)))
    if vibrant_colors:
        vibrant_colors.sort(reverse=True, key=lambda x: x[0])
        return vibrant_colors[0][1]
    return (0, 168, 232)

def create_squircle_mask(size, radius):
    scale = 4
    w, h = size[0] * scale, size[1] * scale
    r = radius * scale
    mask = Image.new("L", (w, h), 0)
    draw = ImageDraw.Draw(mask)
    draw.rounded_rectangle([(0, 0), (w, h)], radius=r, fill=255)
    return mask.resize(size, Image.Resampling.LANCZOS)

def get_canonical_tag(app):
    """Classify any app or game into its canonical tag category with high-confidence indicators."""
    category = (app.get("category") or "").lower()
    tags = [t.lower().replace("#", "") for t in app.get("tags", [])]
    name = app.get("name", "").lower()
    desc = (app.get("description") or "").lower()
    
    # 1. High-confidence Title Indicators
    if any(w in name for w in ["vpn", "proxy", "shield vpn", "tunnel"]):
        return "vpn"
    if any(w in name for w in ["car", "driving", "racing", "speed", "asphalt", "drift", "racer"]):
        return "racing"

    # 2. Category: Games
    if "game" in category or any("game" in t for t in tags):
        if any(w in name or w in desc or any(w in t for t in tags) for w in ["action", "war", "battle", "gun", "combat", "fight", "strike"]):
            return "action"
        return "games"
        
    # 3. Explicit Specific Tags
    for t in tags:
        if t in ["vpn", "security", "firewall", "proxy", "shield"]: return "vpn"
        if t in ["ai", "aichatbot", "chatbot"]: return "ai"
        if t in ["music", "audio", "sound", "radio", "spotify", "listening", "podcasts"]: return "audio"
        if t in ["learning", "education", "programming"]: return "education"
        if t in ["sports", "football"]: return "sports"
        if t in ["photography", "photo", "photoeditor", "camera", "art", "wallpaper", "wallpapers"]: return "photos"
        if t in ["tools", "tool", "editor", "edit", "editing", "manager", "launcher", "dualspace"]: return "tools"
        if t in ["social", "comunication", "chat", "callingapps", "telegrammods"]: return "social"
        if t in ["books", "book", "pdf", "notes", "ebook"]: return "books"
        if t in ["watching", "watch", "tv", "movie", "cinema", "player", "videoplayer", "media"]: return "media"

    # 4. Secondary heuristics from description
    if any(w in name or w in desc for w in ["vpn", "shield", "proxy", "privacy"]): return "vpn"
    if any(w in name or w in desc for w in ["music", "song", "audio", "sound", "radio"]): return "audio"
    if any(w in name or w in desc for w in ["ai", "gpt", "bot", "assistant"]): return "ai"
    if any(w in name or w in desc for w in ["photo", "camera", "filter", "wallpaper"]): return "photos"
    if any(w in name or w in desc for w in ["learn", "study", "language"]): return "education"
    if any(w in name or w in desc for w in ["watch", "tv", "movie", "cinema", "stream", "video", "player", "tube"]): return "media"
    if any(w in name or w in desc for w in ["tool", "editor", "mod", "apk", "cleaner", "file"]): return "tools"
    if any(w in name or w in desc for w in ["chat", "message", "call", "social"]): return "social"
        
    return "default"

def load_tag_background(tag, width=1200, height=600):
    """Load the dedicated AI-generated background for the given tag."""
    primary_filename = f"tag_{tag}.jpg"
    primary_path = os.path.join(TAG_BG_DIR, primary_filename)
    
    target_path = None
    if os.path.exists(primary_path):
        target_path = primary_path
    elif tag in ["racing", "action"]:
        fallback = os.path.join(TAG_BG_DIR, "tag_games.jpg")
        if os.path.exists(fallback):
            target_path = fallback
    else:
        fallback = os.path.join(TAG_BG_DIR, "tag_default.jpg")
        if os.path.exists(fallback):
            target_path = fallback
            
    if target_path:
        try:
            img = Image.open(target_path).convert("RGBA")
            print(f"   -> [Tag BG Loaded] {target_path} (for tag: '{tag}')")
            return ImageOps.fit(img, (width, height), method=Image.Resampling.LANCZOS)
        except Exception as e:
            print(f"Warning loading tag background {target_path}: {e}")

    # Fallback procedural gradient
    canvas = Image.new("RGBA", (width, height), (7, 13, 24, 255))
    draw = ImageDraw.Draw(canvas)
    for y in range(height):
        r = y / height
        draw.line([(0, y), (width, y)], fill=(int(6 * (1 - r) + 4 * r), int(12 * (1 - r) + 8 * r), int(22 * (1 - r) + 16 * r), 255))
    return canvas

def draw_thematic_tag_effects(canvas, tag, dom_color, width=1200, height=600):
    """Draw visual effects that match BOTH the tag AND the app's icon color palette."""
    effects_layer = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    draw = ImageDraw.Draw(effects_layer)
    r, g, b = dom_color

    # 1. Racing & High Speed
    if tag == "racing":
        random.seed(r + g + b)
        for i in range(14):
            sy = 45 + i * 38
            sx = int(width * 0.54 + (i * 32) % 240)
            length = random.randint(160, 360)
            streak_color = (r, g, b, random.randint(60, 130)) if i % 2 == 0 else (255, 255, 255, random.randint(40, 100))
            draw.line([(sx, sy), (sx + length, sy - 14)], fill=streak_color, width=random.randint(2, 4))
        # Ground perspective neon grid
        for i in range(6):
            y_pos = height - 10 - i * 18
            alpha = int(55 * (1 - i / 6))
            draw.line([(int(width * 0.58), y_pos), (width, y_pos)], fill=(r, g, b, alpha), width=1)

    # 2. General Games & Action
    elif tag in ["games", "action"]:
        hud_color = (r, g, b, 90)
        cx, cy = int(width * 0.80), int(height * 0.48)
        hw, hh = 160, 160
        arm = 30
        draw.line([(cx - hw, cy - hh), (cx - hw + arm, cy - hh)], fill=hud_color, width=2)
        draw.line([(cx - hw, cy - hh), (cx - hw, cy - hh + arm)], fill=hud_color, width=2)
        draw.line([(cx + hw, cy - hh), (cx + hw - arm, cy - hh)], fill=hud_color, width=2)
        draw.line([(cx + hw, cy - hh), (cx + hw, cy - hh + arm)], fill=hud_color, width=2)
        draw.line([(cx - hw, cy + hh), (cx - hw + arm, cy + hh)], fill=hud_color, width=2)
        draw.line([(cx - hw, cy + hh), (cx - hw, cy + hh - arm)], fill=hud_color, width=2)
        draw.line([(cx + hw, cy + hh), (cx + hw - arm, cy + hh)], fill=hud_color, width=2)
        draw.line([(cx + hw, cy + hh), (cx + hw, cy + hh - arm)], fill=hud_color, width=2)

    # 3. Tools / Dev / VPN / Security
    elif tag in ["tools", "vpn"]:
        circuit_color = (r, g, b, 85)
        accent_color = (255, 255, 255, 140)
        traces = [
            [(width - 380, 80), (width - 240, 80), (width - 200, 120), (width - 80, 120)],
            [(width - 450, 480), (width - 320, 480), (width - 270, 530), (width - 120, 530)],
            [(width - 160, 200), (width - 160, 290), (width - 120, 330)],
            [(width - 500, 240), (width - 420, 240), (width - 380, 280)],
        ]
        for pts in traces:
            draw.line(pts, fill=circuit_color, width=2)
            end_x, end_y = pts[-1]
            draw.ellipse([(end_x - 4, end_y - 4), (end_x + 4, end_y + 4)], fill=circuit_color)
            draw.ellipse([(end_x - 2, end_y - 2), (end_x + 2, end_y + 2)], fill=accent_color)

    # 4. Media / Video / Cinema
    elif tag in ["media", "photos"]:
        flare_y = height // 2
        for rad in range(20, 0, -3):
            f_alpha = int(40 * (1 - rad / 20))
            draw.ellipse([(width * 0.45, flare_y - rad * 2), (width * 0.98, flare_y + rad * 2)], fill=(r, g, b, f_alpha))
        random.seed(r + g + b)
        for _ in range(14):
            bx = random.randint(int(width * 0.52), width - 30)
            by = random.randint(40, height - 60)
            brad = random.randint(12, 38)
            b_alpha = random.randint(20, 50)
            draw.ellipse([(bx - brad, by - brad), (bx + brad, by + brad)], fill=(r, g, b, b_alpha))

    # 5. Audio / Music
    elif tag == "audio":
        base_x = int(width * 0.88)
        bar_w = 6
        gap = 5
        bar_count = 14
        random.seed(r + g)
        for i in range(bar_count):
            bx = base_x + i * (bar_w + gap)
            b_height = random.randint(30, 140)
            by1 = height - 100 - b_height
            by2 = height - 100
            draw.rounded_rectangle([(bx, by1), (bx + bar_w, by2)], radius=3, fill=(r, g, b, 140))
            draw.rounded_rectangle([(bx, by1), (bx + bar_w, by1 + 6)], radius=2, fill=(255, 255, 255, 200))

    # 6. AI / Education / Social / Books / Default (Constellation & Stardust)
    else:
        random.seed(r * 2 + g)
        for _ in range(22):
            sx = random.randint(int(width * 0.55), width - 30)
            sy = random.randint(40, height - 50)
            s_rad = random.randint(2, 5)
            draw.ellipse([(sx - s_rad, sy - s_rad), (sx + s_rad, sy + s_rad)], fill=(r, g, b, random.randint(60, 140)))
            if s_rad > 3:
                draw.ellipse([(sx - 1, sy - 1), (sx + 1, sy + 1)], fill=(255, 255, 255, 180))

    canvas.alpha_composite(effects_layer, (0, 0))

def composite_app_banner(app, filename, badge_text="TOP RATED"):
    """
    Automated tag-based banner compositor:
    1. Selects the right AI background for the app's tag (from assets/banners/tag_backgrounds/)
    2. Draws visual effects matching the app's own icon color and tag
    3. Renders screenshot card mockup (if screenshots exist)
    4. Renders elevated app icon (with 3D squircle & ambient glow)
    5. Applies left-hand contrast vignette for pristine typography
    """
    width, height = 1200, 600
    app_name = app.get("name", "Unknown").strip().lstrip(": ⚡🔥🎮📌").strip()
    tag = get_canonical_tag(app)
    
    print(f"\n=======================================================")
    print(f"Compositing [{badge_text}]: {app_name} | Tag: '{tag}' -> {filename}")

    # 1. Base Layer: Tag-based AI Background
    bg_image = load_tag_background(tag, width, height)
    canvas = bg_image.copy()

    # 2. Icon and Screenshots
    icon = load_or_download_image(app.get("icon_id"))
    dom_color = get_dominant_color(icon)
    r, g, b = dom_color
    
    screenshot = None
    if app.get("screenshots") and len(app["screenshots"]) > 0:
        screenshot = load_or_download_image(app["screenshots"][0])

    # 3. Ambient Color Bloom (Tinted to app's icon color)
    center_x = int(width * 0.77)
    center_y = int(height * 0.50)

    bloom = Image.new("RGBA", (580, 580), (0, 0, 0, 0))
    bloom_draw = ImageDraw.Draw(bloom)
    for rad in range(280, 0, -8):
        alpha = int(75 * (1 - rad / 280))
        bloom_draw.ellipse(
            [(290 - rad, 290 - rad), (290 + rad, 290 + rad)],
            fill=(r, g, b, alpha)
        )
    canvas.alpha_composite(bloom, (center_x - 290, center_y - 290))

    # 4. Tag Thematic Visual Effects (matched to app's icon color & tag)
    draw_thematic_tag_effects(canvas, tag, dom_color, width, height)

    # 5. Left-Side Contrast Overlay (guarantees crystal-clear typography on frontend)
    overlay = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    ov_draw = ImageDraw.Draw(overlay)
    for x in range(width):
        ratio = x / width
        alpha = int(235 * (1 - 0.52 * (ratio ** 1.35)))
        ov_draw.line([(x, 0), (x, height)], fill=(6, 11, 20, alpha))
        
    for y in range(height):
        y_ratio = y / height
        if y_ratio > 0.65:
            extra_alpha = int(120 * ((y_ratio - 0.65) / 0.35))
            ov_draw.line([(0, y), (width, y)], fill=(4, 8, 15, extra_alpha))
            
    canvas.alpha_composite(overlay, (0, 0))

    # 6. Showcase: Screenshot Card Mockup (if any) + Icon Badge
    if screenshot:
        print(f"   -> Found screenshot: compositing device mockup")
        sc_w, sc_h = 320, 480
        sc_crop = ImageOps.fit(screenshot, (sc_w, sc_h), method=Image.Resampling.LANCZOS)
        sc_mask = create_squircle_mask((sc_w, sc_h), 28)
        
        # Soft Mockup Shadow
        sc_shadow = Image.new("RGBA", (sc_w + 60, sc_h + 60), (0, 0, 0, 0))
        sc_shadow_draw = ImageDraw.Draw(sc_shadow)
        sc_shadow_draw.rounded_rectangle([(30, 35), (sc_w + 30, sc_h + 35)], radius=28, fill=(0, 0, 0, 175))
        sc_shadow = sc_shadow.filter(ImageFilter.GaussianBlur(18))
        
        card_x = center_x - 190
        card_y = center_y - 230
        canvas.alpha_composite(sc_shadow, (card_x - 30, card_y - 30))
        
        sc_framed = Image.new("RGBA", (sc_w, sc_h), (0, 0, 0, 0))
        sc_framed.paste(sc_crop, (0, 0), sc_mask)
        sc_border_draw = ImageDraw.Draw(sc_framed)
        sc_border_draw.rounded_rectangle([(0, 0), (sc_w - 1, sc_h - 1)], radius=28, outline=(255, 255, 255, 75), width=2)
        canvas.alpha_composite(sc_framed, (card_x, card_y))

        # Floating Hero App Icon overlapping mockup
        if icon:
            icon_size = 170
            icon_res = icon.resize((icon_size, icon_size), Image.Resampling.LANCZOS)
            icon_mask = create_squircle_mask((icon_size, icon_size), int(icon_size * 0.22))
            
            shadow_pad = 50
            icon_shadow = Image.new("RGBA", (icon_size + shadow_pad * 2, icon_size + shadow_pad * 2), (0, 0, 0, 0))
            ish_draw = ImageDraw.Draw(icon_shadow)
            ish_draw.rounded_rectangle(
                [(shadow_pad, shadow_pad + 12), (shadow_pad + icon_size, shadow_pad + icon_size + 12)],
                radius=int(icon_size * 0.22),
                fill=(0, 0, 0, 195)
            )
            icon_shadow = icon_shadow.filter(ImageFilter.GaussianBlur(20))
            
            icon_x = card_x - 65
            icon_y = center_y + 30
            canvas.alpha_composite(icon_shadow, (icon_x - shadow_pad, icon_y - shadow_pad))
            
            icon_framed = Image.new("RGBA", (icon_size, icon_size), (0, 0, 0, 0))
            icon_framed.paste(icon_res, (0, 0), icon_mask)
            icon_border = ImageDraw.Draw(icon_framed)
            icon_border.rounded_rectangle([(0, 0), (icon_size - 1, icon_size - 1)], radius=int(icon_size * 0.22), outline=(255, 255, 255, 110), width=2)
            canvas.alpha_composite(icon_framed, (icon_x, icon_y))
    else:
        # No screenshot: Large Hero App Icon with 3D glass backplate
        print(f"   -> No screenshot: compositing hero icon showcase")
        if icon:
            icon_size = 270
            icon_res = icon.resize((icon_size, icon_size), Image.Resampling.LANCZOS)
            icon_mask = create_squircle_mask((icon_size, icon_size), int(icon_size * 0.22))
            
            # Ambient Backplate
            bp_w, bp_h = 330, 330
            backplate = Image.new("RGBA", (bp_w, bp_h), (0, 0, 0, 0))
            bp_draw = ImageDraw.Draw(backplate)
            bp_draw.rounded_rectangle([(0, 0), (bp_w - 1, bp_h - 1)], radius=42, fill=(10, 18, 30, 130), outline=(255, 255, 255, 35), width=1)
            
            shadow_pad = 70
            icon_shadow = Image.new("RGBA", (icon_size + shadow_pad * 2, icon_size + shadow_pad * 2), (0, 0, 0, 0))
            ish_draw = ImageDraw.Draw(icon_shadow)
            ish_draw.rounded_rectangle(
                [(shadow_pad, shadow_pad + 16), (shadow_pad + icon_size, shadow_pad + icon_size + 16)],
                radius=int(icon_size * 0.22),
                fill=(0, 0, 0, 210)
            )
            icon_shadow = icon_shadow.filter(ImageFilter.GaussianBlur(26))
            
            pos_x = center_x - icon_size // 2 + 30
            pos_y = center_y - icon_size // 2
            
            canvas.alpha_composite(backplate, (pos_x - 30, pos_y - 30))
            canvas.alpha_composite(icon_shadow, (pos_x - shadow_pad, pos_y - shadow_pad))
            
            icon_framed = Image.new("RGBA", (icon_size, icon_size), (0, 0, 0, 0))
            icon_framed.paste(icon_res, (0, 0), icon_mask)
            icon_border = ImageDraw.Draw(icon_framed)
            icon_border.rounded_rectangle([(0, 0), (icon_size - 1, icon_size - 1)], radius=int(icon_size * 0.22), outline=(255, 255, 255, 95), width=2)
            canvas.alpha_composite(icon_framed, (pos_x, pos_y))

    final_rgb = canvas.convert("RGB")
    out_path = os.path.join(OUTPUT_DIR, filename)
    final_rgb.save(out_path, "JPEG", quality=86, optimize=True)
    size_kb = os.path.getsize(out_path) / 1024
    print(f"   -> [Banner Saved] {out_path} ({size_kb:.1f} KB)")
    return f"assets/banners/generated/{filename}"

def create_guide_banner(theme, filename):
    """Create a stylized brand guide banner."""
    width, height = 1200, 600
    canvas = Image.new("RGBA", (width, height), (7, 13, 24, 255))
    
    themes = {
        "features": {
            "primary": (17, 166, 212),
            "secondary": (2, 71, 115),
            "accent": (56, 189, 248)
        },
        "telegram": {
            "primary": (34, 158, 217),
            "secondary": (15, 76, 129),
            "accent": (255, 255, 255)
        },
        "github": {
            "primary": (46, 160, 67),
            "secondary": (22, 27, 34),
            "accent": (88, 166, 255)
        },
        "coffee": {
            "primary": (217, 119, 6),
            "secondary": (120, 53, 15),
            "accent": (254, 240, 138)
        }
    }
    cfg = themes.get(theme, themes["features"])
    pr, pg, pb = cfg["primary"]
    
    bg_draw = ImageDraw.Draw(canvas)
    for y in range(height):
        ratio = y / height
        cr = int(cfg["secondary"][0] * (1 - ratio) * 0.3 + 5)
        cg = int(cfg["secondary"][1] * (1 - ratio) * 0.3 + 9)
        cb = int(cfg["secondary"][2] * (1 - ratio) * 0.3 + 18)
        bg_draw.line([(0, y), (width, y)], fill=(cr, cg, cb, 255))
        
    orb = Image.new("RGBA", (850, 850), (0, 0, 0, 0))
    orb_draw = ImageDraw.Draw(orb)
    for rad in range(400, 0, -8):
        alpha = int(45 * (1 - rad / 400))
        orb_draw.ellipse(
            [(425 - rad, 425 - rad), (425 + rad, 425 + rad)],
            fill=(pr, pg, pb, alpha)
        )
    canvas.alpha_composite(orb, (width - 600, height // 2 - 425))

    overlay = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    ov_draw = ImageDraw.Draw(overlay)
    for x in range(width):
        ratio = x / width
        alpha = int(225 * (1 - 0.5 * (ratio ** 1.3)))
        ov_draw.line([(x, 0), (x, height)], fill=(6, 11, 20, alpha))
    canvas.alpha_composite(overlay, (0, 0))

    final_rgb = canvas.convert("RGB")
    out_path = os.path.join(OUTPUT_DIR, filename)
    final_rgb.save(out_path, "JPEG", quality=86, optimize=True)
    return f"assets/banners/generated/{filename}"
