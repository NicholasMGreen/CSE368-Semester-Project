import requests
import sys

def check_ollama():
    try:
        response = requests.get("http://127.0.0.1:11434/api/tags")
        if response.status_code == 200:
            models = [m['name'] for m in response.json().get('models', [])]
            if "llama3.2:3b" in models or "llama3.2:latest" in models:
                print("✅ Ollama is running and llama3.2:3b is available.")
                return True
            else:
                print("❌ Ollama is running, but llama3.2:3b is NOT found.")
                print(f"Available models: {', '.join(models) if models else 'None'}")
                print("Run: ollama pull llama3.2:3b")
                return False
        else:
            print(f"❌ Ollama returned status code {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ Ollama is not running. Please start Ollama first.")
        return False

if __name__ == "__main__":
    if check_ollama():
        sys.exit(0)
    else:
        sys.exit(1)
