import sentiment_api

# Make sure the model is loaded before the application starts serving requests
sentiment_api.load_model()

# This app variable is what Gunicorn will look for
app = sentiment_api.app