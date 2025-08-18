"""
Script to export your trained XGBoost model and encoders
Run this after training your model to prepare it for the backend API
"""

import pickle
import os
import numpy as np
import pandas as pd
from sklearn.preprocessing import LabelEncoder
import xgboost as xgb
import joblib

def export_model():
    """Export the trained model and encoders"""
    
    # Create models directory
    os.makedirs('models', exist_ok=True)
    
    print("Loading your actual trained XGBoost model...")
    
    # Load your actual trained model from the PKL file
    try:
        model_data = joblib.load('xgboost_market_predictor_fixed.pkl')
        
        # Extract components from the saved model data
        model = model_data['model']
        encoders = model_data['encoders']
        feature_columns = model_data['feature_columns']
        performance_metrics = model_data['performance_metrics']
        training_date = model_data['training_date']
        version = model_data['version']
        available_combinations = model_data['available_combinations']
        
        print("Successfully loaded model:")
        print("   Model Type: XGBoost")
        print("   Training Date: " + training_date)
        print("   Version: " + version)
        print("   R2 Score: {:.4f}".format(performance_metrics['r2']))
        print("   MAE: Rs.{:.2f}".format(performance_metrics['mae']))
        print("   RMSE: Rs.{:.2f}".format(performance_metrics['rmse']))
        print("   MAPE: {:.2f}%".format(performance_metrics['mape']))
        print("   Features: {}".format(len(feature_columns)))
        print("   Available Combinations: {}".format(len(available_combinations)))
        
    except FileNotFoundError:
        print("Model file 'xgboost_market_predictor_fixed.pkl' not found!")
        print("Please make sure the file is in the current directory.")
        return False
    except Exception as e:
        print("Error loading model: {}".format(e))
        return False
    
    # Save the model components for the backend API
    print("Saving model components for backend API...")
    
    # Save the model
    with open('models/market_price_model.pkl', 'wb') as f:
        pickle.dump(model, f)
    
    # Save encoders
    with open('models/encoders.pkl', 'wb') as f:
        pickle.dump(encoders, f)
    
    # Save feature columns
    with open('models/feature_columns.pkl', 'wb') as f:
        pickle.dump(feature_columns, f)
    
    # Save additional metadata
    metadata = {
        'performance_metrics': performance_metrics,
        'training_date': training_date,
        'version': version,
        'available_combinations': available_combinations.to_dict('records') if hasattr(available_combinations, 'to_dict') else available_combinations
    }
    
    with open('models/model_metadata.pkl', 'wb') as f:
        pickle.dump(metadata, f)
    
    print("Model exported successfully!")
    print("Files created:")
    print("   - models/market_price_model.pkl")
    print("   - models/encoders.pkl")
    print("   - models/feature_columns.pkl")
    print("   - models/model_metadata.pkl")
    
    # Test the model
    print("\nTesting model...")
    test_input = {
        'crop': 'Wheat',
        'mandi': 'Barnala',
        'state': 'Punjab',
        'currentPrice': 2200,
        'currentDate': '2025-03-12'
    }
    
    # Create test features
    features = create_test_features(test_input, encoders, feature_columns)
    prediction = model.predict([features])[0]
    
    print("Test prediction for Wheat in Barnala: Rs.{:.2f}".format(prediction))
    
    # Show available combinations
    print("\nAvailable Crop-Mandi Combinations (Top 10):")
    if hasattr(available_combinations, 'head'):
        top_combos = available_combinations.head(10)
        for idx, row in top_combos.iterrows():
            print("   {} @ {}: {} records".format(row['crop'], row['mandi'], row['count']))
    else:
        print("   (Combination data available)")
    
    return True

def create_test_features(input_data, encoders, feature_columns):
    """Create test features for model testing"""
    features = [0] * len(feature_columns)  # Initialize with zeros
    
    # Set basic price features
    current_price = input_data['currentPrice']
    features[0] = current_price  # modal_price
    features[1] = current_price * 0.95  # min_price
    features[2] = current_price * 1.05  # max_price
    
    # Set some basic historical features
    for i in range(3, 8):  # price_lag features
        features[i] = current_price * (0.9 + i * 0.02)
    
    # Set categorical encodings
    if 'crop' in encoders and input_data['crop'] in encoders['crop'].classes_:
        features[feature_columns.index('crop_encoded')] = encoders['crop'].transform([input_data['crop']])[0]
    
    if 'mandi' in encoders and input_data['mandi'] in encoders['mandi'].classes_:
        features[feature_columns.index('mandi_encoded')] = encoders['mandi'].transform([input_data['mandi']])[0]
    
    return features

if __name__ == '__main__':
    success = export_model()
    if success:
        print("\nModel export completed successfully!")
        print("Your real ML model is ready for the backend API!")
    else:
        print("\nModel export failed. Please check the error messages above.")
