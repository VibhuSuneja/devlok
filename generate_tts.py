import asyncio
import os
import edge_tts

output_dir = "client/public/audio/chakras"
os.makedirs(output_dir, exist_ok=True)

chakras = [
    {"id": "root", "text": "I am grounded. I am safe. I belong."},
    {"id": "sacral", "text": "I feel. I create. I flow."},
    {"id": "solar", "text": "I act with purpose. I hold my power."},
    {"id": "heart", "text": "I love unconditionally. My heart is open."},
    {"id": "throat", "text": "I speak truth. I express freely."},
    {"id": "thirdeye", "text": "I see clearly. My intuition guides me."},
    {"id": "crown", "text": "I am divine. I am one with all."},
]

# Using the high-quality Shunya signature voice
VOICE = "en-GB-RyanNeural" 
RATE = "-15%" 

async def generate():
    for idx, c in enumerate(chakras):
        filename = os.path.join(output_dir, f"{idx}_{c['id']}.mp3")
        print(f"Generating {filename} with Edge-TTS (Neural - Ryan)...")
        # Exact Shunya cadence
        communicate = edge_tts.Communicate(c['text'], VOICE, rate=RATE)
        await communicate.save(filename)

if __name__ == "__main__":
    asyncio.run(generate())
    print("Ultra-Premium TTS generation complete!")
