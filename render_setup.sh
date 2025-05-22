#!/bin/bash

echo "Starting setup script..."

# Install Python dependencies
echo "Installing Python dependencies..."
pip install -r requirements.txt

# Run the download script to fetch model files
echo "Downloading model files..."
python download_models.py

echo "Setup completed!"
echo "Pulling LFS files..."
git lfs pull

# Verify model files exist
if [ -f "./distilbert-model_trained/sentiment_model.pkl" ] && [ -f "./distilbert-model_trained/tokenizer.pkl" ]; then
    echo "Model files successfully retrieved!"
    ls -la ./distilbert-model_trained/
else
    echo "ERROR: Model files not found after LFS pull. Please check your Git LFS configuration."
    ls -la ./distilbert-model_trained/
fi

echo "Setup script completed."