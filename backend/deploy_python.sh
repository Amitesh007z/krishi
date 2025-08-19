#!/bin/bash

echo "🐍 Deploying ML Backend to Render (Python - No Docker)..."
echo ""

# Check if we're in the right directory
if [ ! -f "app.py" ] || [ ! -d "models" ]; then
    echo "❌ Error: Please run this script from the backend directory"
    echo "   Current directory: $(pwd)"
    exit 1
fi

# Verify model files exist
echo "🔍 Verifying model files..."
if python test_models.py; then
    echo "✅ All model files verified successfully!"
else
    echo "❌ Model files verification failed!"
    exit 1
fi

echo ""
echo "📋 Next steps for Python deployment on Render:"
echo ""
echo "1. Push your code to GitHub:"
echo "   git add ."
echo "   git commit -m 'Switch to Python deployment for Render'"
echo "   git push"
echo ""
echo "2. Go to [render.com](https://render.com) and:"
echo "   - Sign up/Login with GitHub"
echo "   - Click 'New +' → 'Web Service'"
echo "   - Connect your repository"
echo "   - Set Root Directory to: backend"
echo "   - Set Runtime to: Python 3 (NOT Docker!)"
echo "   - Set Build Command to: pip install -r requirements.txt"
echo "   - Set Start Command to: gunicorn app:app --bind 0.0.0.0:\$PORT"
echo "   - Click 'Create Web Service'"
echo ""
echo "3. Wait for deployment (5-10 minutes)"
echo ""
echo "4. Test your deployment:"
echo "   - Health: https://your-app-name.onrender.com/health"
echo "   - Model Info: https://your-app-name.onrender.com/model-info"
echo ""
echo "5. Update frontend .env.local:"
echo "   NEXT_PUBLIC_ML_BACKEND_URL=https://your-app-name.onrender.com"
echo ""
echo "🎯 Advantages of Python deployment:"
echo "   ✅ No Docker complexity"
echo "   ✅ Faster deployment"
echo "   ✅ Easier debugging"
echo "   ✅ Direct file access"
echo "   ✅ More reliable"
echo ""
echo "🚀 Your backend will now work 24/7 on Render!"
