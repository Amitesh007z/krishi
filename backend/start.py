#!/usr/bin/env python3
"""
Alternative start script for the Flask app
Can be used if gunicorn has issues on Render
"""
import os
from app import app

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('FLASK_ENV') == 'development'
    
    print(f"🚀 Starting ML Backend on port {port}")
    print(f"🔧 Debug mode: {debug}")
    print(f"🌐 Access at: http://localhost:{port}")
    
    app.run(host='0.0.0.0', port=port, debug=debug)
