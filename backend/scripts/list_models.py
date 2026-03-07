
import os
from google import genai
from app.core.config import get_settings

def list_models():
    settings = get_settings()
    if not settings.gemini_api_key:
        print("Error: GEMINI_API_KEY not found.")
        return

    client = genai.Client(api_key=settings.gemini_api_key)
    try:
        print(f"Current Dir: {os.getcwd()}")
        print("Attempting to list models...")
        models = list(client.models.list())
        print(f"Found {len(models)} models.")
        with open("scripts/models_list.txt", "w") as f:
            for model in models:
                name = getattr(model, 'name', 'Unknown')
                print(f"Adding model: {name}")
                f.write(f"Model ID: {name}\n")
        print(f"Successfully wrote to scripts/models_list.txt")
    except Exception as e:
        print(f"Error listing models: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    list_models()
