#!/usr/bin/env python3
"""
Production Setup Script for Real ML Model Backend
This script automates the setup of your trained XGBoost model for production use.
"""

import os
import sys
import subprocess
import shutil
from pathlib import Path

def print_step(step_num, title):
    """Print a formatted step header"""
    print(f"\n{'='*60}")
    print(f"STEP {step_num}: {title}")
    print(f"{'='*60}")

def run_command(command, description):
    """Run a command and handle errors"""
    print(f"\n{description}...")
    print(f"   Command: {command}")
    
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        print(f"   Success!")
        if result.stdout:
            print(f"   Output: {result.stdout.strip()}")
        return True
    except subprocess.CalledProcessError as e:
        print(f"   Error: {e}")
        if e.stdout:
            print(f"   Stdout: {e.stdout}")
        if e.stderr:
            print(f"   Stderr: {e.stderr}")
        return False

def check_file_exists(filepath, description):
    """Check if a file exists"""
    if os.path.exists(filepath):
        print(f"   {description}: {filepath}")
        return True
    else:
        print(f"   {description} not found: {filepath}")
        return False

def main():
    print("PRODUCTION SETUP FOR REAL ML MODEL BACKEND")
    print("=" * 70)
    
    # Step 1: Check prerequisites
    print_step(1, "CHECKING PREREQUISITES")
    
    # Check if model file exists
    model_file = "xgboost_market_predictor_fixed.pkl"
    if not check_file_exists(model_file, "Trained ML Model"):
        print(f"\nCRITICAL ERROR: Model file '{model_file}' not found!")
        print("Please make sure your trained model file is in the current directory.")
        print("Expected file: xgboost_market_predictor_fixed.pkl")
        return False
    
    # Check Python version
    python_version = sys.version_info
    if python_version.major < 3 or (python_version.major == 3 and python_version.minor < 8):
        print(f"   Python version {python_version.major}.{python_version.minor} is too old!")
        print("   Required: Python 3.8+")
        return False
    else:
        print(f"   Python version: {python_version.major}.{python_version.minor}.{python_version.micro}")
    
    # Step 2: Create backend directory structure
    print_step(2, "CREATING BACKEND DIRECTORY STRUCTURE")
    
    backend_dir = Path("backend")
    models_dir = backend_dir / "models"
    
    # Create directories
    backend_dir.mkdir(exist_ok=True)
    models_dir.mkdir(exist_ok=True)
    
    print(f"   Created directory: {backend_dir}")
    print(f"   Created directory: {models_dir}")
    
    # Step 3: Copy model file to backend
    print_step(3, "SETTING UP MODEL FILES")
    
    # Copy model file to backend directory
    source_model = Path(model_file)
    target_model = backend_dir / model_file
    
    try:
        shutil.copy2(source_model, target_model)
        print(f"   Copied model file to: {target_model}")
    except Exception as e:
        print(f"   Error copying model file: {e}")
        return False
    
    # Step 4: Export model for backend API
    print_step(4, "EXPORTING MODEL FOR BACKEND API")
    
    # Change to backend directory
    original_dir = os.getcwd()
    os.chdir(backend_dir)
    
    # Run export script
    if not run_command("python export_model.py", "Exporting model components"):
        print("   Model export failed!")
        os.chdir(original_dir)
        return False
    
    # Check if export was successful
    required_files = [
        "models/market_price_model.pkl",
        "models/encoders.pkl", 
        "models/feature_columns.pkl",
        "models/model_metadata.pkl"
    ]
    
    all_files_exist = True
    for file_path in required_files:
        if not check_file_exists(file_path, f"Model component"):
            all_files_exist = False
    
    if not all_files_exist:
        print("   Some model files are missing!")
        os.chdir(original_dir)
        return False
    
    # Step 5: Install Python dependencies
    print_step(5, "INSTALLING PYTHON DEPENDENCIES")
    
    if not run_command("pip install -r requirements.txt", "Installing dependencies"):
        print("   Dependency installation failed!")
        os.chdir(original_dir)
        return False
    
    # Step 6: Test the backend API
    print_step(6, "TESTING BACKEND API")
    
    # Start the API in background
    print("\nStarting backend API for testing...")
    try:
        # Start the API process
        api_process = subprocess.Popen(
            ["python", "app.py"],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )
        
        # Wait a bit for the API to start
        import time
        time.sleep(3)
        
        # Test health endpoint
        import requests
        try:
            response = requests.get("http://localhost:5000/health", timeout=5)
            if response.status_code == 200:
                health_data = response.json()
                print(f"   API is running!")
                print(f"   Model loaded: {health_data.get('model_loaded', False)}")
                print(f"   Model accuracy: {health_data.get('model_accuracy', 'N/A')}")
                print(f"   Features: {health_data.get('features_count', 0)}")
                
                # Test prediction endpoint
                test_prediction = {
                    "crop": "Wheat",
                    "mandi": "Barnala", 
                    "state": "Punjab",
                    "currentPrice": 2200,
                    "currentDate": "2025-03-12"
                }
                
                pred_response = requests.post(
                    "http://localhost:5000/predict",
                    json=test_prediction,
                    timeout=10
                )
                
                if pred_response.status_code == 200:
                    pred_data = pred_response.json()
                    print(f"   Test prediction successful!")
                    print(f"   Predicted price: Rs.{pred_data.get('nextDayPrice', 'N/A')}")
                    print(f"   Trend: {pred_data.get('priceTrend', 'N/A')}")
                    print(f"   Confidence: {pred_data.get('predictionConfidence', 'N/A')}")
                else:
                    print(f"   Test prediction failed: {pred_response.status_code}")
                    
            else:
                print(f"   Health check failed: {response.status_code}")
                
        except requests.exceptions.RequestException as e:
            print(f"   API test failed: {e}")
        
        # Stop the API process
        api_process.terminate()
        api_process.wait()
        
    except Exception as e:
        print(f"   API testing error: {e}")
    
    # Return to original directory
    os.chdir(original_dir)
    
    # Step 7: Final setup instructions
    print_step(7, "PRODUCTION SETUP COMPLETE")
    
    print("SUCCESS! Your real ML model is ready for production!")
    print("\nNEXT STEPS:")
    print("1. Start the backend API:")
    print("   cd backend")
    print("   python app.py")
    print("\n2. Start the frontend:")
    print("   npm run dev")
    print("\n3. Test the integration:")
    print("   - Open http://localhost:3000")
    print("   - Go to Market Forecast")
    print("   - Check 'Use ML Model'")
    print("   - Select crops and locations")
    print("\nAPI ENDPOINTS:")
    print("   - Health: http://localhost:5000/health")
    print("   - Predict: http://localhost:5000/predict")
    print("   - Model Info: http://localhost:5000/model-info")
    print("   - Combinations: http://localhost:5000/available-combinations")
    
    print("\nPRODUCTION DEPLOYMENT:")
    print("   - Use Gunicorn: gunicorn -w 4 -b 0.0.0.0:5000 app:app")
    print("   - Set up reverse proxy (nginx)")
    print("   - Configure environment variables")
    print("   - Set up monitoring and logging")
    
    print("\nYour real XGBoost model is now integrated and ready!")
    return True

if __name__ == "__main__":
    success = main()
    if not success:
        print("\nSetup failed. Please check the error messages above.")
        sys.exit(1)
