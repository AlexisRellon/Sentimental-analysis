import os
import sys

# Check for required packages and provide installation instructions if missing
required_packages = {
    "torch": "torch",
    "transformers": "transformers",
    "nltk": "nltk",
    "emoji": "emoji",
    "flask": "flask",
    "flask_cors": "flask-cors",
    "joblib": "joblib"
}

missing_packages = []
for package, pip_name in required_packages.items():
    try:
        __import__(package)
    except ImportError:
        missing_packages.append(pip_name)

if missing_packages:
    print("ERROR: Missing required packages. Please install them using the following command:")
    print(f"pip install {' '.join(missing_packages)}")
    print("\nIf you're using a virtual environment, make sure it's activated before running pip install.")
    sys.exit(1)

# Import the required packages
import re
import torch
import emoji
import nltk
import joblib
from flask import Flask, request, jsonify
from flask_cors import CORS
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize

# Download necessary NLTK data
try:
    nltk.data.find('corpora/stopwords')
    nltk.data.find('tokenizers/punkt')
except:
    print("Downloading required NLTK data...")
    nltk.download('stopwords')
    nltk.download('punkt')
    nltk.download('punkt_tab')

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Define paths to model components using joblib-serialized files
MODEL_PATH = './distilbert-model_trained/sentiment_model.pkl'
TOKENIZER_PATH = './distilbert-model_trained/tokenizer.pkl'

# Define global variables for model and tokenizer
model = None
tokenizer = None

# Always use CPU device since CUDA is not available
device = torch.device("cpu")
print(f"Using device: {device}")

# Define sentiment mapping
sentiment_map = {0: "negative", 1: "neutral", 2: "positive"}

def load_model():
    """Load the sentiment analysis model and tokenizer using joblib with CPU compatibility"""
    global model, tokenizer
    
    # Load tokenizer and model from the saved pickle files
    try:
        print("Loading model and tokenizer from .pkl files...")
        print(f"MODEL_PATH: {MODEL_PATH}")
        print(f"TOKENIZER_PATH: {TOKENIZER_PATH}")
        
        if not os.path.exists(MODEL_PATH):
            print(f"Error: Model file not found at {MODEL_PATH}")
            return False
            
        if not os.path.exists(TOKENIZER_PATH):
            print(f"Error: Tokenizer file not found at {TOKENIZER_PATH}")
            return False
        
        # Custom pickle load function to handle CUDA tensors
        def cpu_unpickler(filename):
            try:
                # First try direct loading with CPU map_location
                return joblib.load(filename, map_location=device)
            except:
                try:
                    # If that fails, try this alternate approach
                    import pickle
                    import io
                    
                    class CPUUnpickler(pickle.Unpickler):
                        def find_class(self, module, name):
                            if module == 'torch.storage' and name == '_load_from_bytes':
                                return lambda b: torch.load(io.BytesIO(b), map_location='cpu')
                            else:
                                return super().find_class(module, name)
                    
                    with open(filename, 'rb') as f:
                        return CPUUnpickler(f).load()
                except Exception as e:
                    print(f"Error during custom unpickling: {e}")
                    return None
                
        # Try to load the tokenizer
        tokenizer = joblib.load(TOKENIZER_PATH)
        
        # Try multiple methods to load the model with CPU compatibility
        try:
            # Method 1: Load with joblib and directly map to CPU
            model = joblib.load(MODEL_PATH, mmap_mode='r')
        except:
            try:
                # Method 2: Use torch's specialized loading with map_location
                with open(MODEL_PATH, 'rb') as f:
                    model = torch.load(f, map_location=torch.device('cpu'))
            except:
                try:
                    # Method 3: Use custom CPU unpickler
                    model = cpu_unpickler(MODEL_PATH)
                    if model is None:
                        raise ValueError("Failed to load model with custom unpickler")
                except Exception as e:
                    print(f"All model loading methods failed. Final error: {e}")
                    return False
        
        # Ensure the model is on CPU
        model.to(device)
        model.eval()
        print("Model and tokenizer successfully loaded on CPU!")
        return True
        
    except Exception as e:
        print(f"Error loading model: {e}")
        return False

def preprocess_text(text):
    """Preprocess the text using the same pipeline as during training"""
    if not text:  # Handle empty text
        return ""
    
    # Convert to lowercase
    text = text.lower()
    # Handle emojis - convert to text representation
    text = emoji.demojize(text)
    # Remove URLs
    text = re.sub(r'http\S+|www\S+|https\S+', '', text, flags=re.MULTILINE)
    # Remove mentions and hashtags
    text = re.sub(r'\@\w+|\#\w+', '', text)
    # Remove special characters but preserve emoji text representations
    text = re.sub(r'[^\w\s\:\_\-]', '', text)
    # Normalize whitespace
    text = re.sub(r'\s+', ' ', text).strip()
    
    # Tokenize
    tokens = word_tokenize(text)
    # Remove stopwords but keep negation words which are important for sentiment
    stop_words = set(stopwords.words('english')) - {'no', 'not', 'nor', 'neither', 'never', 'none'}
    filtered_tokens = [word for word in tokens if word.isalnum() and word not in stop_words]
    
    return ' '.join(filtered_tokens)

@app.route('/analyze', methods=['POST'])
def analyze_sentiment():
    """Analyze the sentiment of the provided text"""
    if not request.json or 'text' not in request.json:
        return jsonify({'error': 'No text provided'}), 400
    
    review_text = request.json['text']
    
    # Preprocess the text
    processed_text = preprocess_text(review_text)
    
    if not processed_text or len(processed_text) < 5:
        return jsonify({
            'sentiment': 'neutral', 
            'confidence': 0,
            'message': 'Text too short for accurate analysis'
        })
    
    # Tokenize the text
    inputs = tokenizer(
        processed_text,
        return_tensors="pt",
        truncation=True,
        padding="max_length",
        max_length=128
    ).to(device)
    
    # Predict the sentiment
    with torch.no_grad():
        outputs = model(**inputs)
    
    # Get prediction and confidence
    probs = torch.nn.functional.softmax(outputs.logits, dim=1)
    prediction = torch.argmax(outputs.logits, dim=1).item()
    confidence = probs[0][prediction].item() * 100
    
    return jsonify({
        'sentiment': sentiment_map[prediction],
        'confidence': confidence,
        'processed_text': processed_text
    })

if __name__ == '__main__':
    # Load the model when the application starts
    if load_model():
        print(f"Starting server at http://localhost:5000/analyze")
        app.run(debug=True, port=5000)
    else:
        print("Failed to load model. Application will not start.")
        print("\nTROUBLESHOOTING:")
        print("1. Ensure all required packages are installed with: pip install torch transformers nltk emoji flask flask-cors joblib")
        print("2. Verify the model and tokenizer paths are correct")
        print("3. Check that the model files exist in the specified location")
        print("4. If the model was saved on a CUDA device, make sure to use map_location=torch.device('cpu') when loading")