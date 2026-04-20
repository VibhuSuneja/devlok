import asyncio
try:
    import edge_tts
except ImportError:
    print("Please install edge-tts: pip install edge-tts")
    exit(1)
import os

# Microsoft Azure Neural TTS Voice
VOICE = "en-GB-RyanNeural"  # A calm, soothing British male voice
RATE = "-15%"               # Slowed down for a meditative cadence

CHAKRAS = [
    {"index": 0, "id": "root", "affirmation": "I am grounded. I am safe. I belong."},
    {"index": 1, "id": "sacral", "affirmation": "I feel. I create. I flow."},
    {"index": 2, "id": "solar", "affirmation": "I act with purpose. I hold my power."},
    {"index": 3, "id": "heart", "affirmation": "I love unconditionally. My heart is open."},
    {"index": 4, "id": "throat", "affirmation": "I speak truth. I express freely."},
    {"index": 5, "id": "thirdeye", "affirmation": "I see clearly. My intuition guides me."},
    {"index": 6, "id": "crown", "affirmation": "I am divine. I am one with all."}
]

OUTPUT_DIR = os.path.join(os.getcwd(), "client", "public", "audio", "chakras")

async def generate_all():
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    print(f"Generating high-quality neural voiceover using: {VOICE}")
    
    for c in CHAKRAS:
        filename = f"{c['index']}_{c['id']}.mp3"
        filepath = os.path.join(OUTPUT_DIR, filename)
        text = c['affirmation']
        
        if os.path.exists(filepath):
            print(f"-> Skipping {filename} (already exists)")
            continue
            
        print(f"-> Generating {filename}...")
        try:
            communicate = edge_tts.Communicate(text, VOICE, rate=RATE)
            await communicate.save(filepath)
            print(f"   [SUCCESS] Saved {filename}")
        except Exception as e:
            print(f"   [ERROR] Failed to generate {filename}: {e}")

if __name__ == "__main__":
    asyncio.run(generate_all())
