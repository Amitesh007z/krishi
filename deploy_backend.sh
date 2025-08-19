#!/bin/bash

echo "🚀 Agri ML Backend Deployment Helper"
echo "====================================="

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "❌ Git repository not found. Please initialize git first:"
    echo "   git init"
    echo "   git add ."
    echo "   git commit -m 'Initial commit'"
    echo "   git remote add origin <your-github-repo-url>"
    echo "   git push -u origin main"
    exit 1
fi

# Check if backend files exist
if [ ! -f "backend/app.py" ]; then
    echo "❌ Backend files not found. Please ensure backend/ directory exists with all files."
    exit 1
fi

echo "✅ Backend files found"
echo "✅ Git repository initialized"

# Check for model files
if [ ! -f "backend/models/market_price_model.pkl" ]; then
    echo "⚠️  Warning: Model files not found in backend/models/"
    echo "   Make sure all .pkl files are in the models directory"
fi

echo ""
echo "📋 Next Steps:"
echo "1. Push your code to GitHub:"
echo "   git add ."
echo "   git commit -m 'Prepare for Render deployment'"
echo "   git push"
echo ""
echo "2. Deploy on Render:"
echo "   - Go to https://render.com"
echo "   - Sign up/Login with GitHub"
echo "   - Click 'New +' → 'Web Service'"
echo "   - Connect your repository"
echo "   - Set Root Directory to: backend"
echo "   - Set Runtime to: Docker"
echo "   - Click 'Create Web Service'"
echo ""
echo "3. After deployment, update your frontend .env.local:"
echo "   NEXT_PUBLIC_ML_BACKEND_URL=https://your-app-name.onrender.com"
echo ""
echo "4. Test your deployment:"
echo "   - Health: https://your-app-name.onrender.com/health"
echo "   - Model Info: https://your-app-name.onrender.com/model-info"
echo ""
echo "📖 Full deployment guide: backend/README_DEPLOYMENT.md"
echo ""
echo "🎯 Your backend is ready for deployment!"
