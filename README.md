A full-stack AI-powered content moderation system that analyzes text for toxicity, sentiment, keywords, and language detection using Groq AI.
🌟 Features

🛡️ Toxicity Detection - Identifies harmful or offensive content with severity levels (0-100 score)
😊 Sentiment Analysis - Determines if content is positive, negative, or neutral with confidence scores
🔑 Keyword Extraction - Identifies important words and phrases in the text
🌍 Language Detection - Automatically detects the language of submitted content
📊 Analytics Dashboard - View statistics and trends of analyzed content
📜 History Tracking - Browse and filter past analyses with pagination
⚡ Real-time Processing - Fast AI-powered analysis using Groq API
🔒 Rate Limiting - Built-in protection against API abuse
💾 Idempotency - Prevents duplicate submissions
https://contentguardai-9.onrender.com 
🏗️ Architecture
Tech Stack

frontend:
React 18.3 with Vite
React Router v6 for navigation
Axios for API calls
Custom CSS (no frameworks)
Responsive design

Backend:

Node.js with Express
MongoDB for data persistence
Groq AI for content analysis
Redis for caching (optional)
Rate limiting & idempotency middleware

AI Services:

Groq API for toxicity detection
Groq API for sentiment analysis
Groq API for keyword extraction
Groq API for language detection

Prerequisites

Node.js v18 or higher
MongoDB installed and running
Groq API key (Get it here)
Redis (optional, for caching)











