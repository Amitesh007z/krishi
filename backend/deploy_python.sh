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
echo "   git commit -m 'Fix gunicorn installation for Render'"
echo "   git push"
echo ""
echo "2. Go to [render.com](https://render.com) and:"
echo "   - Sign up/Login with GitHub"
echo "   - Click 'New +' → 'Web Service'"
echo "   - Connect your repository"
echo "   - Set Root Directory to: backend"
echo "   - Set Runtime to: Python 3 (NOT Docker!)"
echo "   - Set Build Command to: chmod +x build.sh && ./build.sh"
echo "   - Set Start Command to one of these options:"
echo "     Option 1: gunicorn app:app --bind 0.0.0.0:\$PORT"
echo "     Option 2: python -m gunicorn app:app --bind 0.0.0.0:\$PORT"
echo "     Option 3: python start.py (if gunicorn fails)"
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
echo "🐍 Python Version: 3.11 (compatible with all ML packages)"
echo "📦 Build Script: build.sh (verifies gunicorn installation)"
echo "🚀 Start Options: Multiple gunicorn commands + fallback start.py"
echo ""
echo "🔧 If gunicorn fails, the build script will:"
echo "   - Install gunicorn directly if import fails"
echo "   - Show all installed packages for debugging"
echo "   - Provide fallback start options"
echo ""
echo "🚀 Your backend will now work 24/7 on Render!"
