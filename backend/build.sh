#!/bin/bash

echo "🐍 Building ML Backend on Render..."

# Upgrade pip and install build tools first
python -m pip install --upgrade pip
python -m pip install --upgrade setuptools wheel

# Install requirements
echo "Installing Python dependencies..."
pip install -r requirements.txt

# Verify gunicorn is installed
echo "Verifying gunicorn installation..."
if python -c "import gunicorn; print('✅ Gunicorn imported successfully')"; then
    echo "✅ Gunicorn is properly installed"
else
    echo "❌ Gunicorn import failed, installing directly..."
    pip install gunicorn==21.2.0
fi

# Show installed packages
echo "Installed packages:"
pip list | grep -E "(gunicorn|flask|xgboost)"

echo "✅ Build completed successfully!"
