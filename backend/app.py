from flask import Flask, request, jsonify
from flask_cors import CORS
import pickle
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
import logging
import os
import sys
import json
import traceback

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)

# Global flag to track if models are loaded
models_loaded = False

def load_models_on_demand():
    """Load ML models when needed"""
    global models_loaded, model, encoders, feature_columns, model_metadata
    
    if not models_loaded:
        logger.info("🔄 Loading ML models on demand...")
        if load_ml_models():
            models_loaded = True
            logger.info("✅ ML models loaded successfully")
        else:
            logger.error("❌ Failed to load ML models")
    
    return models_loaded

# Flask 3.x compatible startup event
@app.before_serving
def startup():
    """Load models when the app starts serving requests"""
    logger.info("🚀 App starting up, loading ML models...")
    load_models_on_demand()
    logger.info("✅ App startup complete")

# Fix CORS configuration to handle preflight requests properly
CORS(app, resources={
    r"/*": {
        "origins": ["https://krishiai-latest.onrender.com", "http://localhost:3000", "http://localhost:5000"],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization", "X-Requested-With"],
        "supports_credentials": True
    }
})

# Add CORS headers to all responses
@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-Requested-With')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    response.headers.add('Access-Control-Allow-Credentials', 'true')
    return response

# Global variables for model and encoders
model = None
encoders = {}
feature_columns = []
model_metadata = {}

def load_ml_models():
    """Load ML models and related components with comprehensive error handling"""
    global model, encoders, feature_columns, model_metadata
    
    try:
        logger.info("Starting ML model loading process...")
        
        # Check if models directory exists
        if not os.path.exists('models'):
            logger.error("Models directory does not exist!")
            logger.error(f"Current working directory: {os.getcwd()}")
            logger.error(f"Directory contents: {os.listdir('.')}")
            return False
        
        logger.info("Models directory found, checking contents...")
        model_files = os.listdir('models')
        logger.info(f"Model files found: {model_files}")
        
        # Load model metadata first
        try:
            metadata_path = 'models/model_metadata.json'
            if os.path.exists(metadata_path):
                with open(metadata_path, 'r') as f:
                    model_metadata = json.load(f)
                logger.info(f"Model metadata loaded successfully: {len(model_metadata)} keys")
            else:
                logger.error(f"Model metadata file not found at: {metadata_path}")
                return False
        except Exception as e:
            logger.error(f"Failed to load model metadata: {e}")
            return False
        
        # Load feature columns
        try:
            feature_path = 'models/feature_columns.json'
            if os.path.exists(feature_path):
                with open(feature_path, 'r') as f:
                    feature_columns = json.load(f)
                logger.info(f"Feature columns loaded successfully: {len(feature_columns)} columns")
            else:
                logger.error(f"Feature columns file not found at: {feature_path}")
                return False
        except Exception as e:
            logger.error(f"Failed to load feature columns: {e}")
            return False
        
        # Load encoders
        try:
            encoders_path = 'models/encoders.pkl'
            if os.path.exists(encoders_path):
                with open(encoders_path, 'rb') as f:
                    encoders = pickle.load(f)
                logger.info(f"Encoders loaded successfully: {len(encoders)} encoders")
            else:
                logger.error(f"Encoders file not found at: {encoders_path}")
                return False
        except Exception as e:
            logger.error(f"Failed to load encoders: {e}")
            return False
        
        # Load the main model
        try:
            model_path = 'models/xgboost_model.pkl'
            if os.path.exists(model_path):
                with open(model_path, 'rb') as f:
                    model = pickle.load(f)
                logger.info("XGBoost model loaded successfully")
            else:
                logger.error(f"Model file not found at: {model_path}")
                return False
        except Exception as e:
            logger.error(f"Failed to load XGBoost model: {e}")
            return False
        
        # Verify all components are loaded
        if model is not None and encoders and feature_columns and model_metadata:
            logger.info("✅ All ML components loaded successfully!")
            logger.info(f"Model type: {type(model)}")
            logger.info(f"Encoders count: {len(encoders)}")
            logger.info(f"Feature columns count: {len(feature_columns)}")
            logger.info(f"Metadata keys: {list(model_metadata.keys())}")
            return True
        else:
            logger.error("❌ Not all components loaded successfully")
            logger.error(f"Model: {model is not None}")
            logger.error(f"Encoders: {bool(encoders)}")
            logger.error(f"Feature columns: {bool(feature_columns)}")
            logger.error(f"Metadata: {bool(model_metadata)}")
            return False
            
    except Exception as e:
        logger.error(f"Critical error during model loading: {e}")
        logger.error(f"Traceback: {traceback.format_exc()}")
        return False

def encode_categorical_features(input_data):
    """Encode categorical features using the trained encoders"""
    encoded_data = input_data.copy()
    
    for column, encoder in encoders.items():
        if column in encoded_data:
            try:
                # Handle unseen categories
                if encoded_data[column] in encoder.classes_:
                    encoded_data[column] = encoder.transform([encoded_data[column]])[0]
                else:
                    # Use most common category for unseen values
                    encoded_data[column] = encoder.transform([encoder.classes_[0]])[0]
            except Exception as e:
                logger.warning(f"Encoding error for {column}: {e}")
                encoded_data[column] = 0
    
    return encoded_data

def create_features(input_data):
    """Create all required features for the model - MATCHING YOUR TRAINED MODEL"""
    features = {}
    
    # Basic features from input
    features['modal_price'] = input_data.get('currentPrice', 2000)
    features['min_price'] = input_data.get('currentPrice', 2000) * 0.95
    features['max_price'] = input_data.get('currentPrice', 2000) * 1.05
    
    # Categorical features
    features['crop'] = input_data.get('crop', 'Wheat')
    features['mandi'] = input_data.get('mandi', 'Barnala')
    features['state'] = input_data.get('state', 'Punjab')
    
    # Date features
    current_date = datetime.strptime(input_data.get('currentDate', '2025-03-12'), '%Y-%m-%d')
    features['month'] = current_date.month
    features['day_of_year'] = current_date.timetuple().tm_yday
    features['day_of_week'] = current_date.weekday()
    features['quarter'] = (current_date.month - 1) // 3 + 1
    features['is_weekend'] = 1 if current_date.weekday() >= 5 else 0
    
    # Seasonal features
    features['month_sin'] = np.sin(2 * np.pi * current_date.month / 12)
    features['month_cos'] = np.cos(2 * np.pi * current_date.month / 12)
    features['day_sin'] = np.sin(2 * np.pi * current_date.day / 31)
    features['day_cos'] = np.cos(2 * np.pi * current_date.day / 31)
    features['year_progress'] = current_date.timetuple().tm_yday / 365
    
    # Historical price features (simulated based on current price)
    base_price = features['modal_price']
    features['price_lag_1'] = base_price * 0.98
    features['price_lag_3'] = base_price * 0.96
    features['price_lag_7'] = base_price * 0.94
    features['price_lag_14'] = base_price * 0.92
    features['price_lag_30'] = base_price * 0.90
    
    # Rolling statistics
    features['price_mean_7d'] = base_price * 0.97
    features['price_mean_14d'] = base_price * 0.95
    features['price_mean_30d'] = base_price * 0.93
    features['price_std_7d'] = base_price * 0.05
    features['price_std_14d'] = base_price * 0.06
    features['price_std_30d'] = base_price * 0.07
    features['price_min_7d'] = base_price * 0.92
    features['price_min_14d'] = base_price * 0.90
    features['price_min_30d'] = base_price * 0.88
    features['price_max_7d'] = base_price * 1.02
    features['price_max_14d'] = base_price * 1.04
    features['price_max_30d'] = base_price * 1.06
    
    # Volatility features
    features['price_volatility_7d'] = 0.05
    features['price_volatility_14d'] = 0.06
    features['price_volatility_30d'] = 0.07
    
    # Arrival features (simulated)
    features['arrivals_lag_1'] = 1000
    features['arrivals_lag_7'] = 950
    features['arrivals_lag_14'] = 900
    
    # Market context
    features['state_avg_price'] = base_price * 1.02
    features['crop_avg_price'] = base_price * 1.01
    
    # Momentum features
    features['price_momentum_7d'] = 0.02
    features['price_momentum_30d'] = 0.01
    
    # Interaction features
    features['temp_rainfall_interaction'] = 0.5
    features['humidity_temp_interaction'] = 0.6
    features['fuel_labor_ratio'] = 0.8
    features['fertilizer_inflation_ratio'] = 1.1
    
    # Additional features
    features['variety'] = 'Local'  # Default variety
    features['grade'] = 'FAQ'      # Default grade
    features['district'] = input_data.get('mandi', 'Barnala')
    features['season'] = 'Rabi' if current_date.month in [10, 11, 12, 1, 2, 3] else 'Kharif'
    features['weatherCondition'] = 'Normal'
    
    return features

def predict_market_price(input_data):
    """Make prediction using the trained XGBoost model"""
    try:
        # Create features
        features = create_features(input_data)
        
        # Encode categorical features
        encoded_features = encode_categorical_features(features)
        
        # Create feature vector in the correct order
        feature_vector = []
        for col in feature_columns:
            if col in encoded_features:
                feature_vector.append(encoded_features[col])
            else:
                feature_vector.append(0)  # Default value for missing features
        
        # Make prediction
        prediction = float(model.predict([feature_vector])[0])
        
        # Get model performance metrics for confidence calculation
        mape = model_metadata.get('performance_metrics', {}).get('mape', 12.54)
        uncertainty = float(prediction * (mape / 100))  # Convert MAPE to uncertainty
        
        # Calculate confidence interval
        confidence = 0.95
        margin = 1.96 * uncertainty  # 95% confidence interval
        
        # Determine trend and action
        current_price = float(input_data.get('currentPrice', 2000))
        price_change = float(prediction - current_price)
        
        # Prevent division by zero
        if current_price > 0:
            price_change_pct = float((price_change / current_price) * 100)
        else:
            price_change_pct = 0.0
        
        if price_change_pct > 2:
            trend = 'rising'
            action = 'hold'
            reasoning = f"Strong rising trend detected (+{price_change_pct:.1f}%). Hold for better prices."
        elif price_change_pct < -2:
            trend = 'falling'
            action = 'sell_now'
            reasoning = f"Falling trend detected ({price_change_pct:.1f}%). Consider selling to avoid losses."
        else:
            trend = 'stable'
            action = 'hold'
            reasoning = f"Market conditions are stable ({price_change_pct:+.1f}%). Monitor for opportunities."
        
        # Calculate risk level based on volatility
        volatility = float(uncertainty / prediction)
        if volatility < 0.05:
            risk_level = 'low'
        elif volatility < 0.10:
            risk_level = 'medium'
        else:
            risk_level = 'high'
        
        # Calculate expected gain
        if action in ['hold', 'store']:
            expected_gain = float(price_change * 0.8)  # Conservative estimate
        else:
            expected_gain = 0.0
        
        # Get model accuracy safely
        r2_score = model_metadata.get('performance_metrics', {}).get('r2', 0.8953)
        model_accuracy = f"{r2_score * 100:.2f}%" if r2_score is not None else "89.53%"
        
        return {
            'nextDayPrice': float(round(prediction, 2)),
            'nextWeekPrice': float(round(prediction * (1 + price_change_pct/100 * 0.5), 2)),
            'nextMonthPrice': float(round(prediction * (1 + price_change_pct/100), 2)),
            'predictionConfidence': float(confidence),
            'priceRange': {
                'min': float(round(prediction - margin, 2)),
                'max': float(round(prediction + margin, 2)),
                'confidence': float(confidence)
            },
            'priceTrend': trend,
            'trendStrength': float(abs(price_change_pct) / 100),
            'volatilityIndex': float(volatility),
            'action': action,
            'reasoning': reasoning,
            'expectedGain': float(round(expected_gain, 2)),
            'riskLevel': risk_level,
            'modelVersion': model_metadata.get('version', '2.0_fixed'),
            'trainingDate': model_metadata.get('training_date', '2025-03-12'),
            'lastUpdated': datetime.now().isoformat(),
            'modelAccuracy': model_accuracy,
            'mae': float(model_metadata.get('performance_metrics', {}).get('mae', 256.39)),
            'rmse': float(model_metadata.get('performance_metrics', {}).get('rmse', 446.96)),
            'mape': float(model_metadata.get('performance_metrics', {}).get('mape', 12.54))
        }
        
    except Exception as e:
        logger.error(f"Prediction error: {e}")
        raise Exception(f"ML prediction failed: {e}")

@app.route('/health', methods=['GET', 'OPTIONS'])
def health_check():
    """Health check endpoint with CORS support"""
    if request.method == 'OPTIONS':
        # Handle CORS preflight request
        response = jsonify({'status': 'ok'})
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-Requested-With')
        response.headers.add('Access-Control-Allow-Methods', 'GET,OPTIONS')
        response.headers.add('Access-Control-Allow-Credentials', 'true')
        return response
    
    # Handle actual GET request
    try:
        health_status = {
            'status': 'healthy',
            'message': 'ML Backend is running',
            'timestamp': datetime.now().isoformat(),
            'model_loaded': model is not None,
            'encoders_loaded': len(encoders) > 0 if encoders else False,
            'feature_columns_loaded': len(feature_columns) > 0 if feature_columns else False,
            'metadata_loaded': len(model_metadata) > 0 if model_metadata else False
        }
        return jsonify(health_status)
    except Exception as e:
        logger.error(f"Health check error: {e}")
        return jsonify({
            'status': 'unhealthy',
            'error': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500

@app.route('/predict', methods=['POST', 'OPTIONS'])
def predict():
    """Handle both POST requests and OPTIONS preflight requests"""
    if request.method == 'OPTIONS':
        # Handle CORS preflight request
        response = jsonify({'status': 'ok'})
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-Requested-With')
        response.headers.add('Access-Control-Allow-Methods', 'POST,OPTIONS')
        response.headers.add('Access-Control-Allow-Credentials', 'true')
        return response
    
    # Check if models are loaded
    if not model or not encoders or not feature_columns or not model_metadata:
        logger.error("❌ ML models not loaded. Attempting to reload...")
        if not load_models_on_demand():
            logger.error("❌ Failed to reload ML models")
            return jsonify({
                'error': 'ML models not available. Please try again later.',
                'status': 'model_not_loaded'
            }), 503
        else:
            logger.info("✅ ML models reloaded successfully")
    
    # Handle actual POST request
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        # Extract input data
        crop = data.get('crop', '').lower()
        location = data.get('location', '').lower()
        current_price = float(data.get('currentPrice', 0))
        
        if not crop or not location:
            return jsonify({'error': 'Crop and location are required'}), 400
        
        # Generate prediction (simplified for now)
        prediction = {
            'action': 'store' if current_price < 2000 else 'sell_now',
            'confidence': 0.7,
            'reasoning': f'Price analysis for {crop} in {location}',
            'expectedGain': int(current_price * 0.1),
            'riskFactors': ['Market volatility', 'Seasonal changes'],
            'nextDayPrice': current_price * 1.02,
            'nextWeekPrice': current_price * 1.05,
            'nextMonthPrice': current_price * 1.08,
            'priceTrend': 'rising',
            'trendStrength': 0.6,
            'riskLevel': 'medium'
        }
        
        return jsonify(prediction)
        
    except Exception as e:
        logger.error(f"Prediction error: {e}")
        return jsonify({'error': f'Prediction failed: {str(e)}'}), 500

@app.route('/model-info', methods=['GET', 'OPTIONS'])
def model_info():
    """Get model information with CORS support"""
    if request.method == 'OPTIONS':
        # Handle CORS preflight request
        response = jsonify({'status': 'ok'})
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-Requested-With')
        response.headers.add('Access-Control-Allow-Methods', 'GET,OPTIONS')
        response.headers.add('Access-Control-Allow-Credentials', 'true')
        return response
    
    # Check if models are loaded
    if not model or not encoders or not feature_columns or not model_metadata:
        logger.error("❌ ML models not loaded. Attempting to reload...")
        if not load_models_on_demand():
            logger.error("❌ Failed to reload ML models")
            return jsonify({
                'error': 'ML models not available. Please try again later.',
                'status': 'model_not_loaded'
            }), 503
        else:
            logger.info("✅ ML models reloaded successfully")
    
    # Handle actual GET request
    try:
        if not model:
            return jsonify({'error': 'ML model not loaded'}), 500
        
        if not model_metadata:
            return jsonify({'error': 'Model metadata not loaded'}), 500
        
        if not feature_columns:
            return jsonify({'error': 'Feature columns not loaded'}), 500
        
        return jsonify({
            'model_type': 'XGBoost',
            'version': model_metadata.get('version', '2.0_fixed'),
            'training_date': model_metadata.get('training_date', '2025-03-12'),
            'features_count': len(feature_columns) if feature_columns else 0,
            'accuracy': f"{model_metadata.get('performance_metrics', {}).get('r2', 0.85) * 100:.2f}%",
            'mae': model_metadata.get('performance_metrics', {}).get('mae', 250),
            'rmse': model_metadata.get('performance_metrics', {}).get('rmse', 450),
            'status': 'loaded'
        })
    except Exception as e:
        logger.error(f"Model info error: {e}")
        return jsonify({'error': f'Failed to get model info: {str(e)}'}), 500

@app.route('/available-combinations', methods=['GET'])
def available_combinations():
    """Get available crop-mandi combinations"""
    try:
        if not model:
            return jsonify({'error': 'ML model not loaded'}), 500
        
        if not model_metadata:
            return jsonify({'error': 'Model metadata not loaded'}), 500
        
        combinations = model_metadata.get('available_combinations', [])
        return jsonify({
            'combinations': combinations,
            'total_count': len(combinations)
        })
    except Exception as e:
        logger.error(f"Available combinations error: {e}")
        return jsonify({'error': f'Failed to get combinations: {str(e)}'}), 500

@app.route('/debug', methods=['GET', 'OPTIONS'])
def debug_info():
    """Debug endpoint to check model loading status with CORS support"""
    if request.method == 'OPTIONS':
        # Handle CORS preflight request
        response = jsonify({'status': 'ok'})
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-Requested-With')
        response.headers.add('Access-Control-Allow-Methods', 'GET,OPTIONS')
        response.headers.add('Access-Control-Allow-Credentials', 'true')
        return response
    
    # Handle actual GET request
    try:
        debug_info = {
            'model_loaded': model is not None,
            'encoders_loaded': len(encoders) > 0 if encoders else False,
            'feature_columns_loaded': len(feature_columns) > 0 if feature_columns else False,
            'metadata_loaded': len(model_metadata) > 0 if model_metadata else False,
            'current_directory': os.getcwd(),
            'models_directory_exists': os.path.exists('models'),
            'models_directory_contents': os.listdir('models') if os.path.exists('models') else [],
            'python_version': f"{sys.version_info.major}.{sys.version_info.minor}.{sys.version_info.micro}"
        }
        
        if model_metadata:
            debug_info['metadata_keys'] = list(model_metadata.keys())
            debug_info['performance_metrics'] = model_metadata.get('performance_metrics', {})
        
        return jsonify(debug_info)
    except Exception as e:
        logger.error(f"Debug info error: {e}")
        return jsonify({'error': f'Failed to get debug info: {str(e)}'}), 500

if __name__ == '__main__':
    # Load model on startup
    if load_ml_models():
        logger.info("Starting ML Market Prediction API...")
        logger.info(f"Model loaded with {len(feature_columns)} features")
        logger.info(f"Model accuracy: {model_metadata.get('performance_metrics', {}).get('r2', 0) * 100:.2f}%")
        
        # Get port from environment variable (Render sets PORT)
        port = int(os.environ.get('PORT', 5000))
        debug = os.environ.get('FLASK_ENV') == 'development'
        
        app.run(host='0.0.0.0', port=port, debug=debug)
    else:
        logger.error("Failed to load model. API cannot start.")
        exit(1)

# For production deployment (Render), load models when app starts
@app.route('/')
def root():
    """Root endpoint that triggers model loading"""
    load_models_on_demand()
    return jsonify({
        'message': 'ML Market Prediction API',
        'status': 'running',
        'models_loaded': models_loaded,
        'timestamp': datetime.now().isoformat()
    })
