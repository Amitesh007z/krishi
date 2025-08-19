#!/bin/bash

echo "🐍 Building ML Backend on Render..."

# Upgrade pip and install build tools first
python -m pip install --upgrade pip
python -m pip install --upgrade setuptools wheel

# Install requirements
echo "Installing Python dependencies..."
pip install -r requirements.txt

echo "✅ Build completed successfully!"
