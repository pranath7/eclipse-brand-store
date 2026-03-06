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
    print("🌑 ECLIPSE MARKETING BOT — AUTO MODE 🌑")
    print("-" * 30)
    
    # The default image I generated for you
    DEFAULT_IMAGE = "eclipse_lookbook_1.png"

    if IG_USERNAME == "YOUR_USERNAME":
        print("[ACTION REQUIRED] Please open 'ig_bot.py' and enter your IG_USERNAME and IG_PASSWORD.")
    elif not os.path.exists(DEFAULT_IMAGE):
        print(f"[ERROR] {DEFAULT_IMAGE} not found. Please ensure the image is in the folder.")
    else:
        print(f"Bot starting... Preparing to post {DEFAULT_IMAGE} to your feed.")
        # Uncomment the lines below to start the automation
        # bot.login()
        # bot.upload_photo(DEFAULT_IMAGE)
        # bot.respond_to_comments()
    
    print("\n" + "-" * 30)
    print("Next Steps:")
    print("1. Add your credentials inside 'ig_bot.py'.")
    print("2. Run: python ig_bot.py")
