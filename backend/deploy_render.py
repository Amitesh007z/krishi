#!/usr/bin/env python3
"""
Smart deployment script for Render
Handles different Python versions and ensures compatibility
"""
import sys
import subprocess
import os

def run_command(cmd, description):
    """Run a command and handle errors"""
    print(f"🔄 {description}...")
    try:
        result = subprocess.run(cmd, shell=True, check=True, capture_output=True, text=True)
        print(f"✅ {description} completed successfully")
        if result.stdout:
            print(result.stdout)
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ {description} failed:")
        print(f"Error: {e}")
        if e.stdout:
            print(f"STDOUT: {e.stdout}")
        if e.stderr:
            print(f"STDERR: {e.stderr}")
        return False

def main():
    print("🚀 Smart ML Backend Deployment for Render")
    print("=" * 50)
    
    # Check Python version
    python_version = sys.version_info
    print(f"🐍 Python version: {python_version.major}.{python_version.minor}.{python_version.micro}")
    
    # Determine which requirements file to use
    if python_version.major == 3 and python_version.minor >= 13:
        requirements_file = "requirements.txt"  # Python 3.13+ compatible
        print("📦 Using Python 3.13+ compatible requirements")
    else:
        requirements_file = "requirements-dev.txt"  # Stable versions
        print("📦 Using stable development requirements")
    
    # Upgrade pip and build tools
    if not run_command("python -m pip install --upgrade pip", "Upgrading pip"):
        return False
    
    if not run_command("python -m pip install --upgrade setuptools wheel", "Upgrading build tools"):
        return False
    
    # Install requirements
    if not run_command(f"pip install -r {requirements_file}", f"Installing requirements from {requirements_file}"):
        return False
    
    # Verify critical packages
    print("🔍 Verifying package installation...")
    packages_to_test = [
        ("flask", "Flask"),
        ("gunicorn", "Gunicorn"),
        ("xgboost", "XGBoost"),
        ("sklearn", "Scikit-learn"),
        ("pandas", "Pandas"),
        ("numpy", "NumPy")
    ]
    
    all_packages_ok = True
    for import_name, display_name in packages_to_test:
        try:
            __import__(import_name)
            print(f"✅ {display_name} imported successfully")
        except ImportError as e:
            print(f"❌ {display_name} import failed: {e}")
            all_packages_ok = False
    
    # Test app import
    print("🔍 Testing app import...")
    try:
        from app import app
        print("✅ App imported successfully")
    except Exception as e:
        print(f"❌ App import failed: {e}")
        all_packages_ok = False
    
    # Show installed packages
    print("📦 Installed packages:")
    try:
        result = subprocess.run("pip list", shell=True, capture_output=True, text=True)
        print(result.stdout)
    except Exception as e:
        print(f"Could not list packages: {e}")
    
    if all_packages_ok:
        print("🎉 All packages verified successfully!")
        print("🚀 Your backend is ready to start!")
        return True
    else:
        print("❌ Some packages failed verification")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
