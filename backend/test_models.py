#!/usr/bin/env python3
"""
Test script to verify model files exist and can be loaded
"""
import os
import pickle
import sys

def test_model_files():
    """Test if all required model files exist and can be loaded"""
    print("🔍 Testing model files...")
    
    # Check current directory
    print(f"Current directory: {os.getcwd()}")
    print(f"Directory contents: {os.listdir('.')}")
    
    # Check if models directory exists
    if not os.path.exists('models'):
        print("❌ Models directory not found!")
        return False
    
    print(f"✅ Models directory found")
    print(f"Models directory contents: {os.listdir('models')}")
    
    # Required model files
    required_files = [
        'models/market_price_model.pkl',
        'models/encoders.pkl', 
        'models/feature_columns.pkl',
        'models/model_metadata.pkl'
    ]
    
    # Check if all files exist
    for file_path in required_files:
        if os.path.exists(file_path):
            print(f"✅ {file_path} exists")
            # Try to load the file
            try:
                with open(file_path, 'rb') as f:
                    data = pickle.load(f)
                print(f"✅ {file_path} can be loaded (size: {len(str(data))} chars)")
            except Exception as e:
                print(f"❌ {file_path} cannot be loaded: {e}")
                return False
        else:
            print(f"❌ {file_path} not found!")
            return False
    
    print("🎉 All model files exist and can be loaded!")
    return True

if __name__ == "__main__":
    success = test_model_files()
    sys.exit(0 if success else 1)
