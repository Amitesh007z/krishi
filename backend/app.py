import os
import sys
import json
import traceback
import pickle
import logging
from datetime import datetime
from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np # Add missing import for numpy

# Flask 3.x compatibility check
try:
    import flask
    print(f"✅ Flask imported successfully: {flask.__version__}")
except Exception as e:
    print(f"❌ Flask import failed: {e}")
    sys.exit(1)


# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)

# Global flag to track if models are loaded
models_loaded = False

# Correctly configure CORS *before* any routes
# This handles the OPTIONS preflight requests automatically for all routes
CORS(app, resources={
    r"/*": {
        "origins": ["https://krishiai-latest.onrender.com", "http://localhost:3000", "http://localhost:5000"],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization", "X-Requested-With"],
        "supports_credentials": True
    }
})

# Global variables for model and encoders
model = None
encoders = {}
feature_columns = []
model_metadata = {}

def load_models_on_demand():
    """Load ML models when needed"""
    global models_loaded
    
    if not models_loaded:
        logger.info("🔄 Loading ML models on demand...")
        if load_ml_models():
            models_loaded = True
            logger.info("✅ ML models loaded successfully")
        else:
            models_loaded = False
            logger.error("❌ Failed to load ML models")
    
    return models_loaded

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
        
        # Load all components
        components = {
            'metadata': 'models/model_metadata.pkl',
            'feature_columns': 'models/feature_columns.pkl',
            'encoders': 'models/encoders.pkl',
            'model': 'models/market_price_model.pkl'
        }

        for name, path in components.items():
            try:
                if os.path.exists(path):
                    with open(path, 'rb') as f:
                        if name == 'metadata':
                            model_metadata = pickle.load(f)
                        elif name == 'feature_columns':
                            feature_columns = pickle.load(f)
                        elif name == 'encoders':
                            encoders = pickle.load(f)
                        elif name == 'model':
                            model = pickle.load(f)
                    logger.info(f"✅ {name.replace('_', ' ').title()} loaded successfully")
                else:
                    logger.error(f"❌ {name.replace('_', ' ').title()} file not found at: {path}")
                    return False
            except Exception as e:
                logger.error(f"❌ Failed to load {name.replace('_', ' ')}: {e}")
                return False
        
        # Verify all components are loaded
        if model and encoders and feature_columns and model_metadata:
            logger.info("✅ All ML components loaded successfully!")
            return True
        else:
            logger.error("❌ Not all components loaded successfully")
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
                if encoded_data[column] in encoder.classes_:
                    encoded_data[column] = encoder.transform([encoded_data[column]])[0]
                else:
                    # Use most common category for unseen values (the first class)
                    encoded_data[column] = encoder.transform([encoder.classes_[0]])[0]
            except Exception as e:
                logger.warning(f"Encoding error for {column}: {e}")
                encoded_data[column] = 0
    
    return encoded_data

def create_features(input_data):
    """Create all required features for the model"""
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
    # Ensure numpy is imported for these functions
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
    features['variety'] = 'Local'
    features['grade'] = 'FAQ'
    features['district'] = input_data.get('mandi', 'Barnala')
    features['season'] = 'Rabi' if current_date.month in [10, 11, 12, 1, 2, 3] else 'Kharif'
    features['weatherCondition'] = 'Normal'
    
    return features

def predict_market_price(input_data):
    """Make prediction using the trained XGBoost model"""
    try:
        features = create_features(input_data)
        encoded_features = encode_categorical_features(features)
        
        # Create feature vector in the correct order
        feature_vector = []
        for col in feature_columns:
            feature_vector.append(encoded_features.get(col, 0)) # Use .get with a default value
        
        prediction = float(model.predict([feature_vector])[0])
        mape = model_metadata.get('performance_metrics', {}).get('mape', 12.54)
        uncertainty = float(prediction * (mape / 100))
        confidence = 0.95
        margin = 1.96 * uncertainty
        
        current_price = float(input_data.get('currentPrice', 2000))
        price_change = float(prediction - current_price)
        
        if current_price > 0:
            price_change_pct = float((price_change / current_price) * 100)
        else:
            price_change_pct = 0.0
        
        if price_change_pct > 2:
            trend, action, reasoning = 'rising', 'hold', f"Strong rising trend detected (+{price_change_pct:.1f}%). Hold for better prices."
        elif price_change_pct < -2:
            trend, action, reasoning = 'falling', 'sell_now', f"Falling trend detected ({price_change_pct:.1f}%). Consider selling to avoid losses."
        else:
            trend, action, reasoning = 'stable', 'hold', f"Market conditions are stable ({price_change_pct:+.1f}%). Monitor for opportunities."
        
        volatility = float(uncertainty / prediction)
        if volatility < 0.05: risk_level = 'low'
        elif volatility < 0.10: risk_level = 'medium'
        else: risk_level = 'high'
        
        expected_gain = float(price_change * 0.8) if action in ['hold', 'store'] else 0.0
        
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

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
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
        # Force model loading if not already loaded on a health check
        if not models_loaded:
            load_models_on_demand()
            # Recalculate status after attempting to load
            health_status['model_loaded'] = model is not None
            health_status['encoders_loaded'] = len(encoders) > 0 if encoders else False
            health_status['feature_columns_loaded'] = len(feature_columns) > 0 if feature_columns else False
            health_status['metadata_loaded'] = len(model_metadata) > 0 if model_metadata else False
            if models_loaded:
                health_status['status'] = 'healthy'
                health_status['message'] = 'ML Backend is running, models loaded'
            else:
                health_status['status'] = 'degraded'
                health_status['message'] = 'ML Backend running but models failed to load'
        return jsonify(health_status)
    except Exception as e:
        logger.error(f"Health check error: {e}")
        return jsonify({
            'status': 'unhealthy',
            'error': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500

@app.route('/predict', methods=['POST'])
def predict():
    """Handle POST requests for prediction"""
    if not models_loaded:
        logger.warning("Models not loaded at prediction time. Attempting on-demand load...")
        if not load_models_on_demand():
            return jsonify({
                'error': 'ML models not available. Please try again later.',
                'status': 'model_not_loaded'
            }), 503
    
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        # Use your custom prediction function
        result = predict_market_price(data)
        
        return jsonify(result)
        
    except Exception as e:
        logger.error(f"Prediction error: {e}")
        return jsonify({'error': f'Prediction failed: {str(e)}'}), 500


@app.route('/model-info', methods=['GET'])
def model_info():
    """Get model information"""
    if not models_loaded:
        logger.warning("Models not loaded at model-info time. Attempting on-demand load...")
        if not load_models_on_demand():
            return jsonify({
                'error': 'ML models not available. Please try again later.',
                'status': 'model_not_loaded'
            }), 503
    
    try:
        if not model or not model_metadata or not feature_columns:
            return jsonify({'error': 'ML model or components not fully loaded'}), 500
        
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
    if not models_loaded:
        logger.warning("Models not loaded at combinations time. Attempting on-demand load...")
        if not load_models_on_demand():
            return jsonify({
                'error': 'ML models not available. Please try again later.',
                'status': 'model_not_loaded'
            }), 503

    try:
        combinations = model_metadata.get('available_combinations', [])
        return jsonify({
            'combinations': combinations,
            'total_count': len(combinations)
        })
    except Exception as e:
        logger.error(f"Available combinations error: {e}")
        return jsonify({'error': f'Failed to get combinations: {str(e)}'}), 500

@app.route('/debug', methods=['GET'])
def debug_info():
    """Debug endpoint to check model loading status"""
    try:
        debug_info_dict = {
            'model_loaded': model is not None,
            'encoders_loaded': len(encoders) > 0 if encoders else False,
            'feature_columns_loaded': len(feature_columns) > 0 if feature_columns else False,
            'metadata_loaded': len(model_metadata) > 0 if model_metadata else False,
            'current_directory': os.getcwd(),
            'models_directory_exists': os.path.exists('models'),
            'python_version': f"{sys.version_info.major}.{sys.version_info.minor}.{sys.version_info.micro}"
        }
        
        if os.path.exists('models'):
             debug_info_dict['models_directory_contents'] = os.listdir('models')
        else:
             debug_info_dict['models_directory_contents'] = []

        if model_metadata:
            debug_info_dict['metadata_keys'] = list(model_metadata.keys())
            debug_info_dict['performance_metrics'] = model_metadata.get('performance_metrics', {})
        
        return jsonify(debug_info_dict)
    except Exception as e:
        logger.error(f"Debug info error: {e}")
        return jsonify({'error': f'Failed to get debug info: {str(e)}'}), 500


@app.route('/')
def root():
    """Root endpoint for API info"""
    return jsonify({
        'message': 'ML Market Prediction API',
        'status': 'running',
        'models_loaded': models_loaded,
        'timestamp': datetime.now().isoformat()
    })

@app.route('/ping')
def ping():
    """Simple ping endpoint for health checks"""
    return jsonify({
        'message': 'pong',
        'status': 'ok',
        'timestamp': datetime.now().isoformat()
    })


if __name__ == '__main__':
    # Initial model load on startup
    if load_ml_models():
        logger.info("Starting ML Market Prediction API...")
        port = int(os.environ.get('PORT', 5000))
        debug = os.environ.get('FLASK_ENV') == 'development'
        app.run(host='0.0.0.0', port=port, debug=debug)
    else:
        logger.error("Failed to load model. API cannot start.")
        # It's better to start the app but in a degraded state
        port = int(os.environ.get('PORT', 5000))
        debug = os.environ.get('FLASK_ENV') == 'development'
        app.run(host='0.0.0.0', port=port, debug=debug)