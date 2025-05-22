import os
import gdown
import sys

def download_models():
    # Create the directory if it doesn't exist
    model_dir = "distilbert-model_trained"
    os.makedirs(model_dir, exist_ok=True)

    # File IDs from Google Drive links
    files = {
        "tokenizer.pkl": "1YThQYMb6rlF-M3GO2pt1ZJ5kwKcUz2UZ",
        "sentiment_model.pkl": "1R8OTkH_MlsIKCy-km0hHvZQPx-iiZRRE"
    }

    for file_name, file_id in files.items():
        output_path = os.path.join(model_dir, file_name)
        if not os.path.exists(output_path):
            print(f"Downloading {file_name}...")
            url = f"https://drive.google.com/uc?id={file_id}"
            gdown.download(url, output_path, quiet=False)
            print(f"Downloaded {file_name} successfully!")
        else:
            print(f"{file_name} already exists, skipping download.")

if __name__ == "__main__":
    try:
        download_models()
    except Exception as e:
        print(f"Error downloading models: {str(e)}")
        sys.exit(1)