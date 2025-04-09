# Sentimentify - Spotify Review Sentiment Analyzer

![Sentimentify Screenshot](https://your-screenshot-url.com)

## 📊 Overview

Sentimentify is an AI-powered sentiment analysis application designed to analyze Spotify user reviews. Using a fine-tuned DistilBERT transformer model, it classifies reviews as positive, neutral, or negative while providing confidence scores and visualizations.

## ✨ Features

- **Real-time sentiment analysis** of user-entered reviews
- **Interactive UI** with Spotify-inspired design
- **Review history** tracking with persistence
- **Detailed model metrics** and performance visualizations
- **Auto-suggestion** for text input
- **Mobile-responsive** design

## 🧠 Model Performance

The DistilBERT model powering Sentimentify achieves:
- 86.17% validation accuracy
- 0.8622 F1 score
- Balanced performance across sentiment classes

## 🛠️ Tech Stack

- **Frontend**: HTML, CSS, JavaScript, Tailwind CSS
- **Backend**: Python, Flask
- **ML Model**: DistilBERT (PyTorch), Transformers, NLTK
- **Deployment**: GitHub Pages (frontend), Cloud provider (backend)

## 🚀 Deployment Guide

### Prerequisites
- Python 3.8+
- Node.js (optional, for local development)
- Git

### Frontend Deployment (GitHub Pages)
1. Fork or clone this repository
2. Enable GitHub Pages in your repository settings:
   - Go to Settings > Pages
   - Select the main branch as source
   - Save

### Backend Deployment (e.g., Render)
1. Create a `requirements.txt` file in your repository (already included): torch transformers nltk emoji flask flask-cors joblib gunicorn
2. Create a free account on [Render](https://render.com/)
3. Create a new Web Service and link to your GitHub repo
4. Configure the service:
- Build command: `pip install -r requirements.txt`
- Start command: `gunicorn sentiment_api:app`
- Environment variables: Add any necessary API keys
5. Deploy the service

### Connect Frontend to Backend
1. Update the API endpoint in `script.js`:
```javascript
// Change from local to deployed URL
const response = await fetch('https://your-backend-name.onrender.com/analyze', {
    // ...
});
```

## 🧪 Local Development
1. Clone the repository
```powershell
git clone https://github.com/yourusername/sentimentify.git
cd sentimentify
```

2. Initialize Virtual Environment and Install backend dependencies
```powershell
python -m venv venv_sentimental
.\venv_sentimental\Scripts\activate
pip install -r requirements.txt
```

3. Run the Flask API
```powershell
python sentiment_api.py
```

4. Open index.html in your browser or use a local server
```powershell
# Using Python's built-in server
python -m http.server
```

## 📚 Model Details
Base Model: DistilBERT (distilbert-base-uncased)
Parameters: 66M
Layers: 6 transformer blocks
Embedding Size: 768
Training: 10 epochs (early stopping at epoch 9)
Performance: 86.17% validation accuracy, 0.8622 F1 score

## 🤝 Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

📄 License
This project is licensed under the MIT License - see the LICENSE file for details. ```
