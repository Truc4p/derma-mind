#!/bin/bash

echo "🚀 Setting up AI Dermatologist..."

# Navigate to backend
cd backend

# Install dependencies
echo "📦 Installing backend dependencies..."
npm install

# Seed the knowledge base
echo "🧠 Seeding dermatology knowledge base..."
npm run seed:knowledge

echo "✅ Setup complete!"
echo ""
echo "To start the application:"
echo "1. Backend: cd backend && npm start"
echo "2. Frontend: cd frontend && npm run dev"
echo ""
echo "The AI Dermatologist will be available at: http://localhost:5175/ai-dermatologist"
