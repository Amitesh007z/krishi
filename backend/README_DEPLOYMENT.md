# Deploy ML Backend to Render

## Prerequisites
- GitHub account with your code repository
- Render account (free tier available)

## Step 1: Prepare Your Repository

1. Ensure your backend folder contains:
   - `app.py` (Flask application)
   - `requirements.txt` (Python dependencies)
   - `Dockerfile` (for containerization)
   - `models/` directory with all .pkl files
   - `.dockerignore` (excludes unnecessary files)

2. **IMPORTANT**: Verify model files exist locally:
   ```bash
   cd backend
   python test_models.py
   ```
   Should show all ✅ marks for:
   - market_price_model.pkl
   - encoders.pkl
   - feature_columns.pkl
   - model_metadata.pkl

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
   - **Runtime**: `Docker`
   - **Branch**: `main` (or your default branch)
   - **Region**: Choose closest to your users

4. **Environment Variables** (Optional)
   - `FLASK_ENV`: `production`
   - `PYTHONUNBUFFERED`: `1`

5. **Advanced Settings**
   - **Build Command**: Leave empty (Docker handles this)
   - **Start Command**: Leave empty (Dockerfile CMD handles this)

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

## Troubleshooting

### Common Issues:

1. **Model Loading Failed** ✅ **FIXED**
   - ✅ Updated Dockerfile to explicitly copy models directory first
   - ✅ Fixed .dockerignore to ensure models are included
   - ✅ Added verification steps during Docker build
   - ✅ Models directory is copied before other files

2. **Build Fails**
   - Check requirements.txt for compatibility
   - Ensure Dockerfile is correct
   - Verify all model files are in the models/ directory

3. **Service Unavailable**
   - Check Render logs for errors
   - Verify health check endpoint works
   - Look for model loading errors in logs

4. **CORS Issues**
   - Ensure CORS is properly configured in app.py
   - Check if frontend URL is allowed

### Render Logs:
- Go to your service dashboard
- Click "Logs" tab
- Check for any error messages
- Look for "=== Models directory copied ===" messages

### Expected Docker Build Output:
```
=== Models directory copied ===
drwxr-xr-x 2 root root 4096 Aug 19 20:37 .
drwxr-xr-x 3 root root 4096 Aug 19 20:37 ..
-rw-r--r-- 1 root root 6760 Aug 19 20:37 encoders.pkl
-rw-r--r-- 1 root root 1038 Aug 19 20:37 feature_columns.pkl
-rw-r--r-- 1 root root 906273 Aug 19 20:37 market_price_model.pkl
-rw-r--r-- 1 root root 64495 Aug 19 20:37 model_metadata.pkl
=== Model files found ===
Found: models/encoders.pkl
Found: models/feature_columns.pkl
Found: models/market_price_model.pkl
Found: models/model_metadata.pkl
=== Final verification ===
✅ market_price_model.pkl exists
✅ encoders.pkl exists
✅ feature_columns.pkl exists
✅ model_metadata.pkl exists
=== All model files verified successfully ===
```

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

## Recent Fixes (v2.1)

✅ **Fixed Model Loading Issue**:
- Updated Dockerfile to copy models directory first
- Fixed .dockerignore to ensure models are included
- Added verification steps during Docker build
- Models directory is now explicitly copied before other files

✅ **Enhanced Error Reporting**:
- Added detailed logging during model loading
- Docker build now shows exactly which files are found
- Better error messages for troubleshooting

✅ **Improved Build Process**:
- Models directory copied first for verification
- Step-by-step file copying with verification
- Clear success messages for each step
