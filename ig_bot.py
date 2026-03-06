import time
import random
import os
from instagrapi import Client

# 🌑 ECLIPSE INSTAGRAM BOT 🌑
# This script handles automated content posting and engagement for the brand.

# --- CONFIGURATION (FILL THIS IN) ---
IG_USERNAME = "YOUR_USERNAME"
IG_PASSWORD = "YOUR_PASSWORD"
STORE_URL = "https://eclipse-store-001.web.app" # Update with your live URL

# --- CAPTION TEMPLATES ---
CAPTIONS = [
    "It Was All A Dream. 🌑 Drop 001 is live now. 🏁\nShop at: {url}\n#eclipse #streetwearindia #karanaujla #lifestyle",
    "Shadows and Light. The Signature Oversized Tee. 🌑✨\nGrab yours before it's gone: {url}\n#fashionindia #punjabistreetwear #oversizedtee",
    "180 GSM Heavyweight. Built for those who dare to dream. 🏁🔥\nLink in bio: {url}\n#eclipsebrand #clothingbrand #luxuryfashion",
    "Karan Aujla inspired. ECLIPSE Drop 001. 🎤🌑\nShop now: {url}\n#punjabimusic #ka #itwasalladream"
]

def generate_caption():
    return random.choice(CAPTIONS).format(url=STORE_URL)

class EclipseBot:
    def __init__(self):
        self.cl = Client()
        self.logged_in = False

    def login(self):
        print("Logging into Instagram...")
        try:
            self.cl.login(IG_USERNAME, IG_PASSWORD)
            self.logged_in = True
            print(f"Logged in as {IG_USERNAME} 🌑")
        except Exception as e:
            print(f"Login failed: {e}")

    def upload_photo(self, path):
        if not self.logged_in: return
        print(f"Uploading photo: {path}")
        try:
            caption = generate_caption()
            self.cl.photo_upload(path, caption)
            print("Successfully uploaded! 🏁")
        except Exception as e:
            print(f"Upload failed: {e}")

    def upload_reel(self, path):
        if not self.logged_in: return
        print(f"Uploading reel: {path}")
        try:
            caption = generate_caption()
            self.cl.clip_upload(path, caption)
            print("Successfully uploaded Reel! 🏁🚀")
        except Exception as e:
            print(f"Reel upload failed: {e}")

    def respond_to_comments(self):
        """Placeholder for automated comment responses."""
        print("Scanning for new comments to respond to... 🔍")
        # Logic to fetch recent media and reply to keywords like 'price', 'link', 'how to buy'
        pass

if __name__ == "__main__":
    bot = EclipseBot()
    
    print("-" * 30)
    print("ECLIPSE MARKETING BOT ACTIVE")
    print("-" * 30)
    print("1. Generate AI visuals using 'ai_content_gen.py'")
    print("2. Place the visual file in this directory.")
    print("3. Run this script to post them!")
    
    # Example Usage (Commented out to prevent accidental runs)
    # bot.login()
    # bot.upload_photo("my_ai_lookbook_1.jpg")
    
    print("\n[READY] Fill in your IG credentials in the script to start the movement.")
