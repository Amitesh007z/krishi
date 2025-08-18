#!/bin/bash

# 🚀 Production Deployment Script for AI Farming Assistant

echo "🚀 Starting production deployment..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ Node.js and npm are available"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed successfully"

# Run linting
echo "🔍 Running linting..."
npm run lint

if [ $? -ne 0 ]; then
    echo "⚠️  Linting found issues, but continuing with deployment..."
fi

# Build the application
echo "🏗️  Building the application..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed"
    exit 1
fi

echo "✅ Application built successfully"

# Test Ollama connection (optional)
echo "🧠 Testing Ollama connection..."
npm run test:ollama

if [ $? -ne 0 ]; then
    echo "⚠️  Ollama is not running. Users will need to install Ollama for AI features."
    echo "💡 Users can download Ollama from: https://ollama.ai/download"
fi

# Start the application
echo "🚀 Starting the application..."
echo "📱 Your AI Farming Assistant is now running!"
echo "🌐 Access it at: http://localhost:3000"
echo ""
echo "📋 Next steps for users:"
echo "   1. Visit the application"
echo "   2. Click 'Setup AI' to install Ollama"
echo "   3. Follow the setup wizard"
echo "   4. Start asking farming questions!"
echo ""
echo "🔧 For developers:"
echo "   - Check logs: tail -f logs/app.log"
echo "   - Monitor: npm run test:ollama"
echo "   - Stop: Ctrl+C"

# Start the application
npm start
