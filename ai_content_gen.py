import random

def generate_eclipse_prompt():
    """Generates a hyper-realistic AI prompt for the Karan Aujla / ECLIPSE Tee."""
    
    settings = [
        "a minimalist industrial studio with dramatic shadows and golden rim lighting",
        "a high-end rooftop in Mumbai at twilight with city lights blurred in the background",
        "a vintage Punjabi haveli courtyard with ancient stone walls and soft morning sunlight",
        "a modern underground concrete parking lot with neon orange and white light strips",
        "a sleek designer apartment with floor-to-ceiling windows and luxury furniture"
    ]
    
    models = [
        "a charismatic Indian male model with a sharp jawline and short faded hair",
        "a stylish Punjabi youth with a modern urban aesthetic and cool attitude",
        "a tall, lean Indian fashion model with a premium streetwear vibe",
        "a confident Indian influencer with subtle tattoos and a rugged look"
    ]
    
    poses = [
        "standing with a confident relaxed posture, hands in pockets",
        "sitting on a designer chair, looking away from the camera thoughtfully",
        "walking towards the camera with a slight motion blur on the feet",
        "leaning against a concrete wall, dramatic side-profile lighting"
    ]
    
    # The Core Product Description
    product = (
        "wearing a premium oversized heavyweight black cotton t-shirt. "
        "The t-shirt has 'ECLIPSE' written in bold minimalist typography on the chest. "
        "The fabric looks thick (180 GSM), high-quality, and pre-shrunk. "
        "The fit is a perfect modern drop-shoulder oversized cut."
    )
    
    camera_specs = (
        "8k resolution, shot on Sony A7R IV, 85mm lens, f/1.8, highly detailed fabric texture, "
        "cinematic lighting, hyper-realistic, fashion photography, vogue style."
    )

    prompt = f"{random.choice(models)}, {random.choice(poses)}, {product} Setting: {random.choice(settings)}. {camera_specs}"
    return prompt

if __name__ == "__main__":
    print("-" * 30)
    print("ECLIPSE AI LOOKBOOK GENERATOR")
    print("-" * 30)
    for i in range(3):
        print(f"\nPROMPT {i+1}:\n{generate_eclipse_prompt()}")
    print("\n" + "-" * 30)
    print("Copy these into Midjourney, Pika, or Runway to generate your visuals!")
