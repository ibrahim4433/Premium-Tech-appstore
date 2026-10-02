import os
from PIL import Image
import glob

# Path to banners
banners_path = '/mnt/c/Documents and Settings/ibrah/My Documents/github/Premium-Tech-appstore/assets/banners/**/*.jpg'

# Find all banner jpgs
images = glob.glob(banners_path, recursive=True)

for img_path in images:
    try:
        # Open image
        img = Image.open(img_path)
        
        # Resize to max 800px width (maintain aspect ratio)
        max_width = 800
        if img.width > max_width:
            wpercent = (max_width / float(img.width))
            hsize = int((float(img.height) * float(wpercent)))
            img = img.resize((max_width, hsize), Image.Resampling.LANCZOS)
        
        # Save heavily compressed for web
        img.save(img_path, "JPEG", optimize=True, quality=65)
        print(f"Compressed: {img_path}")
    except Exception as e:
        print(f"Failed to compress {img_path}: {e}")
