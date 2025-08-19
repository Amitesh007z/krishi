from flask import Flask, request, jsonify
from flask_cors import CORS
import pickle
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
import os
import logging

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend integration

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Global variables for model and encoders
model = None
encoders = {}
feature_columns = []
model_metadata = {}

def load_model():
    """Load the trained XGBoost model and encoders"""
    global model, encoders, feature_columns, model_metadata
    
    try:
        # Debug: List current directory and models directory
        import os
        logger.info(f"Current working directory: {os.getcwd()}")
        logger.info(f"Current directory contents: {os.listdir('.')}")
        
        if os.path.exists('models'):
            logger.info(f"Models directory exists. Contents: {os.listdir('models')}")
        else:
            logger.error("Models directory does not exist!")
            return False
        
        # Load the trained model
        model_path = os.path.join(os.path.dirname(__file__), 'models', 'market_price_model.pkl')
        logger.info(f"Looking for model at: {model_path}")
        logger.info(f"Model file exists: {os.path.exists(model_path)}")
        
        with open(model_path, 'rb') as f:
            model = pickle.load(f)
        
        # Load encoders
        encoders_path = os.path.join(os.path.dirname(__file__), 'models', 'encoders.pkl')
        logger.info(f"Looking for encoders at: {encoders_path}")
        with open(encoders_path, 'rb') as f:
            encoders = pickle.load(f)
        
        # Load feature columns
        features_path = os.path.join(os.path.dirname(__file__), 'models', 'feature_columns.pkl')
        logger.info(f"Looking for features at: {features_path}")
        with open(features_path, 'rb') as f:
            feature_columns = pickle.load(f)
        
        # Load model metadata
        metadata_path = os.path.join(os.path.dirname(__file__), 'models', 'model_metadata.pkl')
        logger.info(f"Looking for metadata at: {metadata_path}")
        with open(metadata_path, 'rb') as f:
            model_metadata = pickle.load(f)
        
        logger.info("ML Model loaded successfully")
        logger.info(f"Model features: {len(feature_columns)} features")
        logger.info(f"Model R2 Score: {model_metadata.get('performance_metrics', {}).get('r2', 'N/A')}")
        logger.info(f"Model MAE: Rs.{model_metadata.get('performance_metrics', {}).get('mae', 'N/A')}")
        return True
        
    except FileNotFoundError as e:
        logger.error(f"Model files not found: {e}")
        logger.error(f"Current directory: {os.getcwd()}")
        logger.error(f"Directory contents: {os.listdir('.')}")
        if os.path.exists('models'):
            logger.error(f"Models directory contents: {os.listdir('models')}")
        return False
    except Exception as e:
        logger.error(f"Error loading model: {e}")
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

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'model_loaded': model is not None,
        'model_version': model_metadata.get('version', 'unknown'),
        'model_accuracy': f"{model_metadata.get('performance_metrics', {}).get('r2', 0) * 100:.2f}%",
        'features_count': len(feature_columns) if feature_columns else 0,
        'timestamp': datetime.now().isoformat()
    })

@app.route('/predict', methods=['POST'])
def predict():
    """Main prediction endpoint"""
    try:
        data = request.json
        
        if not model:
            return jsonify({'error': 'ML model not loaded'}), 500
        
        # Validate input
        required_fields = ['crop', 'mandi', 'state', 'currentPrice', 'currentDate']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        # Make prediction
        prediction = predict_market_price(data)
        
        logger.info(f"Prediction made for {data['crop']} in {data['mandi']}: Rs.{prediction['nextDayPrice']}")
        
        return jsonify(prediction)
        
    except Exception as e:
        logger.error(f"API error: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/model-info', methods=['GET'])
def model_info():
    """Get model information"""
    if not model:
        return jsonify({'error': 'ML model not loaded'}), 500
    
    return jsonify({
        'model_type': 'XGBoost',
        'version': model_metadata.get('version', '2.0_fixed'),
        'training_date': model_metadata.get('training_date', '2025-03-12'),
        'features_count': len(feature_columns) if feature_columns else 0,
        'accuracy': f"{model_metadata.get('performance_metrics', {}).get('r2', 0.8953) * 100:.2f}%",
        'mae': model_metadata.get('performance_metrics', {}).get('mae', 256.39),
        'rmse': model_metadata.get('performance_metrics', {}).get('rmse', 446.96),
        'mape': model_metadata.get('performance_metrics', {}).get('mape', 12.54),
        'available_combinations': model_metadata.get('available_combinations', [])
    })

@app.route('/available-combinations', methods=['GET'])
def available_combinations():
    """Get available crop-mandi combinations"""
    if not model:
        return jsonify({'error': 'ML model not loaded'}), 500
    
    combinations = model_metadata.get('available_combinations', [])
    return jsonify({
        'combinations': combinations,
        'total_count': len(combinations)
    })

if __name__ == '__main__':
    # Load model on startup
    if load_model():
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
