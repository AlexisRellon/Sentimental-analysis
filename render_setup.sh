#!/bin/bash

# This script ensures Git LFS files are properly pulled during Render deployment

echo "Starting setup script for Git LFS files..."

# Check if Git LFS is installed
if ! command -v git-lfs &> /dev/null; then
    echo "Git LFS not found, installing..."
    curl -s https://packagecloud.io/install/repositories/github/git-lfs/script.deb.sh | sudo bash
    sudo apt-get install git-lfs
else
    echo "Git LFS is already installed"
fi

# Initialize Git LFS
echo "Initializing Git LFS..."
git lfs install

# Pull LFS files
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