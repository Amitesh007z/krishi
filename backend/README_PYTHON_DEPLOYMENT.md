# Deploy ML Backend to Render (Python - No Docker)

## Prerequisites
- GitHub account with your code repository
- Render account (free tier available)

## Step 1: Prepare Your Repository

1. Ensure your backend folder contains:
   - `app.py` (Flask application)
   - `requirements.txt` (Python dependencies)
   - `runtime.txt` (Python version specification)
   - `models/` directory with all .pkl files

2. **IMPORTANT**: Verify model files exist locally:
   ```bash
   cd backend
   python test_models.py
   ```

3. Commit and push all changes to GitHub

## Step 2: Deploy on Render

1. **Sign up/Login to Render**
   - Go to [render.com](https://render.com)
   - Sign up with GitHub

2. **Create New Web Service**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select the repository containing your backend

3. **Configure the Service**
   - **Name**: `agri-ml-backend` (or your preferred name)
   - **Root Directory**: `backend` (since your app is in the backend folder)
   - **Runtime**: `Python 3`
   - **Branch**: `main` (or your default branch)
   - **Region**: Choose closest to your users

4. **Build & Deploy Settings**
   - **Build Command**: `chmod +x build.sh && ./build.sh`
   - **Start Command**: `gunicorn app:app --bind 0.0.0.0:$PORT`

5. **Environment Variables** (Optional)
   - `FLASK_ENV`: `production`
   - `PYTHONUNBUFFERED`: `1`

6. **Click "Create Web Service"**

## Step 3: Wait for Deployment

- Render will automatically build and deploy your service
- First deployment may take 5-10 minutes
- You'll get a URL like: `https://your-app-name.onrender.com`

## Step 4: Test Your Deployment

1. **Health Check**: Visit `https://your-app-name.onrender.com/health`
2. **Model Info**: Visit `https://your-app-name.onrender.com/model-info`
3. **Test Prediction**: Send POST request to `https://your-app-name.onrender.com/predict`

## Step 5: Update Frontend Configuration

Update your frontend to use the deployed backend URL:

```typescript
// In lib/api.ts, update the ML backend URL
const ML_BACKEND_URL = process.env.NEXT_PUBLIC_ML_BACKEND_URL || 'https://your-app-name.onrender.com'

// Update the fetch calls
const response = await fetch(`${ML_BACKEND_URL}/predict`, {
  // ... rest of the code
})
```

## Advantages of Python Deployment (vs Docker)

✅ **Simpler**: No Docker complexity
✅ **Faster**: Direct Python execution
✅ **More Reliable**: Fewer build issues
✅ **Easier Debugging**: Standard Python errors
✅ **Better Logs**: Clear Python stack traces

## Troubleshooting

### Common Issues:

1. **Model Loading Failed**
   - Check if all .pkl files are in the models/ directory
   - Verify file paths in app.py
   - Check Render logs for Python errors

2. **Build Fails**
   - Check requirements.txt for compatibility
   - Ensure Python version is compatible (3.11)
   - Check for missing dependencies

3. **Service Unavailable**
   - Check Render logs for errors
   - Verify health check endpoint works
   - Look for Python import errors

4. **CORS Issues**
   - Ensure CORS is properly configured in app.py
   - Check if frontend URL is allowed

### Render Logs:
- Go to your service dashboard
- Click "Logs" tab
- Check for any Python errors
- Look for import or file not found errors

## Environment Variables for Frontend

Add to your frontend `.env.local`:
```
NEXT_PUBLIC_ML_BACKEND_URL=https://your-app-name.onrender.com
```

## Cost Considerations

- **Free Tier**: 750 hours/month, auto-sleeps after 15 minutes of inactivity
- **Paid Plans**: Start at $7/month for always-on service
- **Custom Domain**: Available on paid plans

## Monitoring

- Render provides built-in monitoring
- Check "Metrics" tab for performance data
- Set up alerts for downtime

## Auto-Deploy

- Render automatically redeploys when you push to your main branch
- You can disable this in settings if needed

## Why Python Deployment is Better

🚀 **No Docker Complexity**: 
- No Dockerfile issues
- No .dockerignore problems
- No container build failures

🔧 **Easier Debugging**:
- Standard Python error messages
- Clear import error traces
- Better logging output

⚡ **Faster Deployment**:
- Direct Python execution
- No container build time
- Immediate error feedback

📁 **File Access**:
- Direct file system access
- No copy/volume mounting issues
- Models directory accessible immediately

## Python Version Compatibility

✅ **Python 3.11**: Fully compatible with all ML packages
✅ **Python 3.10**: Compatible with most packages
✅ **Python 3.9**: Compatible with all packages
❌ **Python 3.13**: Not yet compatible with XGBoost/scikit-learn

## Build Process

The build script (`build.sh`) will:
1. Upgrade pip to latest version
2. Install setuptools and wheel for building
3. Install all Python dependencies
4. Ensure compatibility with Python 3.11
