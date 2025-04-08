document.getElementById('accept').addEventListener('click', function() {
    document.getElementById('terms-modal').style.display = 'none';
});

// Extended list of example reviews
const exampleReviews = [
    "This app has been incredible for discovering new music! The recommendations are spot on.",
    "The recent update has made the app slower and it crashes frequently. Very frustrating experience.",
    "The app works as expected. Nothing special to mention.",
    "I love how Spotify creates personalized playlists based on my listening habits.",
    "Customer support never responds to my issues. Terrible service!",
    "The interface is clean and intuitive, making navigation a breeze.",
    "Offline mode doesn't work properly, songs disappear from my downloads.",
    "Sound quality is amazing with premium subscription, totally worth the money.",
    "Too many ads on the free version, it ruins the listening experience.",
    "The podcast selection has improved dramatically over the past year.",
    "Can't stand how it keeps suggesting the same artists over and over.",
    "The collaborative playlist feature makes sharing music with friends so easy!",
    "Battery drain is excessive when using this app, needs optimization."
];

// Review history management
const STORAGE_KEY = 'spotify_review_history';
let reviewHistory = [];

// Load review history from local storage
function loadReviewHistory() {
    const savedHistory = localStorage.getItem(STORAGE_KEY);
    if (savedHistory) {
        try {
            reviewHistory = JSON.parse(savedHistory);
        } catch (e) {
            console.error('Error loading review history:', e);
            reviewHistory = [];
        }
    }
}

// Save review history to local storage
function saveReviewHistory() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(reviewHistory));
    } catch (e) {
        console.error('Error saving review history:', e);
    }
}

// Add a review to history
function addReviewToHistory(reviewText, sentiment, confidence) {
    const timestamp = new Date().toISOString();
    const review = {
        text: reviewText,
        sentiment: sentiment,
        confidence: confidence,
        timestamp: timestamp
    };
    
    reviewHistory.unshift(review); // Add to the beginning of array
    
    // Keep only the most recent 50 reviews
    if (reviewHistory.length > 50) {
        reviewHistory = reviewHistory.slice(0, 50);
    }
    
    saveReviewHistory();
    updateHistoryDisplay();
}

// Format date for display
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString();
}

// Update history panel display
function updateHistoryDisplay() {
    const historyList = document.getElementById('review-history-list');
    
    if (reviewHistory.length === 0) {
        historyList.innerHTML = `
            <div class="flex items-center justify-center py-8 text-spotify-grey">
                <span class="material-icons mr-2">history</span>
                No reviews yet
            </div>
        `;
        return;
    }
    
    historyList.innerHTML = '';
    reviewHistory.forEach((review, index) => {
        // Truncate text for display if too long
        const displayText = review.text.length > 100 ? 
            review.text.substring(0, 100) + '...' : 
            review.text;
        
        const historyItem = document.createElement('div');
        historyItem.className = `history-item ${review.sentiment} p-3 mb-2 rounded`;
        historyItem.innerHTML = `
            <div class="flex items-start">
                <div class="mr-3 mt-1">
                    <span class="material-icons ${
                        review.sentiment === 'positive' ? 'text-spotify-green' : 
                        review.sentiment === 'negative' ? 'text-spotify-negative' : 
                        'text-spotify-grey'
                    }">${
                        review.sentiment === 'positive' ? 'sentiment_very_satisfied' : 
                        review.sentiment === 'negative' ? 'sentiment_very_dissatisfied' : 
                        'sentiment_neutral'
                    }</span>
                </div>
                <div class="flex-1">
                    <p class="text-sm mb-1">${displayText}</p>
                    <div class="flex items-center text-xs text-spotify-grey">
                        <span class="mr-2">${formatDate(review.timestamp)}</span>
                        <span>${review.sentiment} (${review.confidence.toFixed(1)}%)</span>
                    </div>
                </div>
                <button class="review-action text-spotify-grey hover:text-white ml-2" 
                        data-action="reuse" data-index="${index}">
                    <span class="material-icons text-sm">refresh</span>
                </button>
            </div>
        `;
        
        // Add event listener for reusing the review
        historyItem.querySelector('[data-action="reuse"]').addEventListener('click', function() {
            const index = parseInt(this.getAttribute('data-index'));
            document.getElementById('review').value = reviewHistory[index].text;
            document.getElementById('suggestion-text').textContent = '';
            // Switch to analysis panel
            showAnalysisPanel();
        });
        
        historyList.appendChild(historyItem);
    });
}

// Clear all review history
function clearReviewHistory() {
    if (confirm('Are you sure you want to clear all your review history?')) {
        reviewHistory = [];
        saveReviewHistory();
        updateHistoryDisplay();
    }
}

// Show the analysis panel
function showAnalysisPanel() {
    document.getElementById('analysis-panel').classList.remove('hidden');
    document.getElementById('history-panel').classList.add('hidden');
    document.getElementById('model-results-panel').classList.add('hidden');
    
    // Update navigation highlight
    document.querySelector('#history-link').classList.remove('text-white');
    document.querySelector('#history-link').classList.add('text-spotify-grey');
    document.querySelector('#model-results').classList.remove('text-white');
    document.querySelector('#model-results').classList.add('text-spotify-grey');
    document.querySelector('#analysis').classList.add('text-white');
    document.querySelector('#analysis').classList.remove('text-spotify-grey');
}

// Show the history panel
function showHistoryPanel() {
    document.getElementById('analysis-panel').classList.add('hidden');
    document.getElementById('history-panel').classList.remove('hidden');
    document.getElementById('model-results-panel').classList.add('hidden');
    
    // Update navigation highlight
    document.querySelector('#history-link').classList.add('text-white');
    document.querySelector('#history-link').classList.remove('text-spotify-grey');
    document.querySelector('#model-results').classList.remove('text-white');
    document.querySelector('#model-results').classList.add('text-spotify-grey');
    document.querySelector('#analysis').classList.remove('text-white');
    document.querySelector('#analysis').classList.add('text-spotify-grey');
    
    updateHistoryDisplay();
}

// Show the model results panel
function showModelResultsPanel() {
    document.getElementById('analysis-panel').classList.add('hidden');
    document.getElementById('history-panel').classList.add('hidden');
    document.getElementById('model-results-panel').classList.remove('hidden');
    
    // Update navigation highlight
    document.querySelector('#history-link').classList.remove('text-white');
    document.querySelector('#history-link').classList.add('text-spotify-grey');
    document.querySelector('#model-results').classList.add('text-white');
    document.querySelector('#model-results').classList.remove('text-spotify-grey');
    document.querySelector('#analysis').classList.remove('text-white');
    document.querySelector('#analysis').classList.add('text-spotify-grey');
}

// Image modal functionality
function setupImageModal() {
    // Get all images that should be clickable to enlarge
    const clickableImages = document.querySelectorAll('#model-results-panel img');
    const imageModal = document.getElementById('image-modal');
    const modalImage = document.getElementById('modal-image');
    const closeButton = document.getElementById('close-image-modal');
    
    // Add click event to each image
    clickableImages.forEach(img => {
        img.classList.add('cursor-pointer', 'hover:opacity-80', 'transition-opacity');
        img.setAttribute('title', 'Click to enlarge');
        
        img.addEventListener('click', function() {
            // Set the modal image source to the clicked image
            modalImage.src = this.src;
            // Show the modal
            imageModal.classList.remove('hidden');
            document.body.style.overflow = 'hidden'; // Prevent scrolling when modal is open
        });
    });
    
    // Close modal when clicking the close button
    closeButton.addEventListener('click', function() {
        imageModal.classList.add('hidden');
        document.body.style.overflow = 'auto'; // Restore scrolling
    });
    
    // Close modal when clicking outside the image
    imageModal.addEventListener('click', function(e) {
        if (e.target === imageModal) {
            imageModal.classList.add('hidden');
            document.body.style.overflow = 'auto'; // Restore scrolling
        }
    });
    
    // Close modal when pressing the Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && !imageModal.classList.contains('hidden')) {
            imageModal.classList.add('hidden');
            document.body.style.overflow = 'auto'; // Restore scrolling
        }
    });
}

// Initialize the image modal functionality when showing the model results panel
const originalShowModelResultsPanel = showModelResultsPanel;
showModelResultsPanel = function() {
    originalShowModelResultsPanel();
    // Setup image modal after the panel is shown
    setTimeout(setupImageModal, 100);
};

// Update all clickable images whenever new content is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initial setup
    if (!document.getElementById('model-results-panel').classList.contains('hidden')) {
        setupImageModal();
    }
});

// Initialize history
loadReviewHistory();

// Event listeners for panels
document.getElementById('history-link').addEventListener('click', function(e) {
    e.preventDefault();
    showHistoryPanel();
});

// Add event listener for Model Results link
document.getElementById('model-results').addEventListener('click', function(e) {
    e.preventDefault();
    showModelResultsPanel();
});

// Add event listener for Sentiment Analysis link - using a more specific selector
document.getElementById('analysis').addEventListener('click', function(e) {
    e.preventDefault();
    showAnalysisPanel();
});

document.getElementById('clear-history').addEventListener('click', clearReviewHistory);

const reviewTextArea = document.getElementById('review');
const suggestionText = document.getElementById('suggestion-text');
let currentSuggestion = '';
let currentIndex = 0;

// Function to get a suggestion based on user input
function getSuggestion(userInput) {
    if (!userInput) return '';
    
    // First try to match with current placeholder as the primary suggestion
    const placeholder = reviewTextArea.getAttribute('placeholder');
    const placeholderMatch = placeholder && placeholder.toLowerCase().startsWith(userInput.toLowerCase()) && 
        placeholder.toLowerCase() !== userInput.toLowerCase();
        
    if (placeholderMatch && placeholder.startsWith("Write your review here...") === false) {
        return placeholder;
    }
    
    // If no match with placeholder, check example reviews as fallback
    const matchingReviews = exampleReviews.filter(review => 
        review.toLowerCase().startsWith(userInput.toLowerCase()) && 
        review.toLowerCase() !== userInput.toLowerCase()
    );
    
    if (matchingReviews.length > 0) {
        // Use a different suggestion each time by cycling through matches
        const suggestion = matchingReviews[currentIndex % matchingReviews.length];
        currentIndex++;
        return suggestion;
    }
    
    return '';
}

// Update suggestion as user types
reviewTextArea.addEventListener('input', function() {
    const userInput = this.value;
    currentSuggestion = getSuggestion(userInput);
    
    if (currentSuggestion) {
        // Display only the part of the suggestion that hasn't been typed yet
        const displaySuggestion = userInput + currentSuggestion.substring(userInput.length);
        suggestionText.textContent = displaySuggestion;
    } else {
        suggestionText.textContent = '';
    }
});

// Fix Tab key handling to properly autocomplete suggestion
reviewTextArea.addEventListener('keydown', function(e) {
    // Tab key for suggestion completion - prevent default behavior first
    if (e.key === 'Tab') {
        e.preventDefault(); // This prevents the focus change
        
        if (currentSuggestion) {
            this.value = currentSuggestion;
            suggestionText.textContent = '';
            currentSuggestion = '';
        }
        return false;
    }
    // Enter key for form submission (only if not creating a new line in the textarea)
    else if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        document.getElementById('analyze').click();
        return false;
    }
});

// Focus handler to show a suggestion immediately
reviewTextArea.addEventListener('focus', function() {
    if (!this.value) {
        const randomExample = exampleReviews[Math.floor(Math.random() * exampleReviews.length)];
        this.setAttribute('placeholder', randomExample);
    }
});

// Reset suggestion on blur
reviewTextArea.addEventListener('blur', function() {
    // Only hide suggestion, keep the placeholder
    suggestionText.textContent = '';
});

document.getElementById('analyze').addEventListener('click', async function() {
    const reviewText = document.getElementById('review').value;
    if (!reviewText) {
        alert('Please enter a review to analyze.');
        return;
    }
    
    // Show loading indicator
    document.getElementById('loading').classList.remove('hidden');
    document.getElementById('analyze').disabled = true;
    document.getElementById('result').classList.add('hidden');
    
    try {
        // Call the sentiment analysis API
        const response = await fetch('http://localhost:5000/analyze', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text: reviewText }),
        });
        
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        
        const result = await response.json();
        displayResult(result, reviewText);
        
        // Add this review to history
        addReviewToHistory(reviewText, result.sentiment, result.confidence);
    } catch (error) {
        console.error('Error:', error);
        alert('Error analyzing review. Please try again or check if the sentiment analysis server is running.');
    } finally {
        // Hide loading indicator
        document.getElementById('loading').classList.add('hidden');
        document.getElementById('analyze').disabled = false;
    }
});

function displayResult(result, originalText) {
    const sentimentIcon = document.getElementById('sentiment-icon');
    const sentimentText = document.getElementById('sentiment-text');
    const confidenceValue = document.getElementById('confidence-value');
    const confidenceBar = document.getElementById('confidence-bar');
    const sentimentExplanation = document.getElementById('sentiment-explanation');
    const resultDiv = document.getElementById('result');
    
    // Set sentiment icon and colors
    let iconHTML = '';
    let barColor = '';
    
    // Clear any previous sentiment class
    sentimentIcon.classList.remove('bg-spotify-green', 'bg-spotify-grey', 'bg-spotify-negative');
    
    // Add the appropriate sentiment class and icon
    if (result.sentiment === 'positive') {
        iconHTML = '<span class="material-icons text-white">sentiment_very_satisfied</span>';
        barColor = '#1DB954'; // spotify-green
        sentimentIcon.classList.add('bg-spotify-green');
    } else if (result.sentiment === 'neutral') {
        iconHTML = '<span class="material-icons text-white">sentiment_neutral</span>';
        barColor = '#B3B3B3'; // spotify-grey
        sentimentIcon.classList.add('bg-spotify-grey');
    } else {
        iconHTML = '<span class="material-icons text-white">sentiment_very_dissatisfied</span>';
        barColor = '#E91429'; // spotify-negative
        sentimentIcon.classList.add('bg-spotify-negative');
    }
    
    // Update the elements
    sentimentIcon.innerHTML = iconHTML;
    sentimentText.textContent = `${result.sentiment.charAt(0).toUpperCase() + result.sentiment.slice(1)} Sentiment`;
    confidenceValue.textContent = result.confidence.toFixed(1);
    confidenceBar.style.width = `${result.confidence}%`;
    confidenceBar.style.backgroundColor = barColor;
    
    // Generate explanation
    let explanation;
    if (result.confidence > 90) {
        explanation = `This review strongly expresses a ${result.sentiment} sentiment toward Spotify.`;
    } else if (result.confidence > 70) {
        explanation = `This review likely expresses a ${result.sentiment} sentiment toward Spotify.`;
    } else {
        explanation = `This review may express a ${result.sentiment} sentiment toward Spotify, but with lower confidence.`;
    }
    
    sentimentExplanation.textContent = explanation;
    
    // Show the result
    resultDiv.classList.remove('hidden');
}