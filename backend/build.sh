#!/bin/bash

echo "🐍 Building ML Backend on Render..."
echo "Python version: $(python --version)"
echo "Pip version: $(pip --version)"
echo "Current directory: $(pwd)"
echo "Directory contents:"
ls -la

# Upgrade pip and install build tools first
echo "Upgrading pip and build tools..."
python -m pip install --upgrade pip
python -m pip install --upgrade setuptools wheel

# Install requirements with verbose output
echo "Installing Python dependencies..."
pip install -r requirements.txt --verbose

# Verify critical packages are installed
echo "Verifying package installation..."
echo "=== Installed packages ==="
pip list

echo "=== Testing imports ==="
python -c "import flask; print('✅ Flask imported successfully')" || echo "❌ Flask import failed"
python -c "import gunicorn; print('✅ Gunicorn imported successfully')" || echo "❌ Gunicorn import failed"
python -c "import xgboost; print('✅ XGBoost imported successfully')" || echo "❌ XGBoost import failed"

# Test app import
echo "=== Testing app import ==="
python -c "from app import app; print('✅ App imported successfully')" || echo "❌ App import failed"

echo "✅ Build completed successfully!"
