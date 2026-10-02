from PIL import Image
import os

source_path = "assets/logo.jpg"
out_192 = "assets/logo-192.png"
out_512 = "assets/logo-512.png"

try:
    img = Image.open(source_path)
    
    # Create 192x192 PNG
    img_192 = img.resize((192, 192), Image.Resampling.LANCZOS)
    img_192.save(out_192, "PNG")
    print("Created logo-192.png")
    
    # Create 512x512 PNG
    img_512 = img.resize((512, 512), Image.Resampling.LANCZOS)
    img_512.save(out_512, "PNG")
    print("Created logo-512.png")
    
except Exception as e:
    print(f"Error: {e}")
