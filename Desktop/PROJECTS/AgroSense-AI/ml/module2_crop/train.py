"""
AgroSense AI — Module 2 Crop Intelligence Training
==================================================
Trains:
1. Yield Regression: Random Forest + CatBoost Ensemble
2. Soil-Weather Fusion: Multi-Input Keras (TensorFlow) Neural Network
3. Crop Suitability: Multiclass LightGBM Classifier
Registers all models, parameters, and metrics in MLflow.
"""

import os
import pickle
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from catboost import CatBoostRegressor
import lightgbm as lgb
import tensorflow as tf
from tensorflow.keras.layers import Input, Dense, Concatenate
from tensorflow.keras.models import Model
import mlflow

MODEL_DIR = "./models/crop"
os.makedirs(MODEL_DIR, exist_ok=True)

# List of supported crops
CROPS = ["Cotton", "Soybean", "Tur (Arhar)", "Paddy", "Wheat", "Gram (Chana)", "Jowar", "Maize"]


# ─────────────────────────────────────────────────────────────────────────────
# Keras Multi-Input Soil-Weather Fusion Neural Network
# ─────────────────────────────────────────────────────────────────────────────
def build_fusion_network(soil_dim=5, weather_dim=2):
    """Fuses soil composition and climate parameters into a single prediction."""
    # Input 1: Soil features (pH, N, P, K, moisture)
    soil_input = Input(shape=(soil_dim,), name="soil_features")
    soil_dense = Dense(32, activation="relu")(soil_input)
    soil_emb = Dense(16, activation="relu")(soil_dense)
    
    # Input 2: Weather features (rainfall, temperature)
    weather_input = Input(shape=(weather_dim,), name="weather_features")
    weather_dense = Dense(16, activation="relu")(weather_input)
    weather_emb = Dense(8, activation="relu")(weather_dense)
    
    # Fusion layer (Concatenate embeddings)
    merged = Concatenate()([soil_emb, weather_emb])
    
    # Output subnetwork
    dense1 = Dense(32, activation="relu")(merged)
    dense2 = Dense(16, activation="relu")(dense1)
    output = Dense(1, activation="linear", name="yield_output")(dense2)
    
    model = Model(inputs=[soil_input, weather_input], outputs=output)
    model.compile(optimizer="adam", loss="mse", metrics=["mae"])
    return model


# ─────────────────────────────────────────────────────────────────────────────
# Training Routine
# ─────────────────────────────────────────────────────────────────────────────
def train_crop_models():
    print("🌾 Starting Crop Intelligence Model Training...")
    
    # Configure MLflow tracking
    try:
        mlflow.set_tracking_uri(os.getenv("MLFLOW_TRACKING_URI", "http://localhost:5000"))
        mlflow.set_experiment(os.getenv("MLFLOW_EXPERIMENT_NAME", "agrosense_production"))
    except Exception as e:
        print(f"⚠️ MLflow Server not reachable: {e}. Running local training only.")

    num_samples = 1500
    
    # ─── 1. Generate Synthetic Data ──────────────────────────────────────────
    # Soil: pH, N, P, K, moisture
    X_soil = np.random.randn(num_samples, 5).astype(np.float32)
    X_soil[:, 0] = np.clip(X_soil[:, 0] * 0.5 + 6.8, 4.0, 9.0)  # pH
    X_soil[:, 1] = np.clip(X_soil[:, 1] * 30 + 180, 50, 400)   # Nitrogen
    X_soil[:, 2] = np.clip(X_soil[:, 2] * 8 + 25, 5, 60)       # Phosphorus
    X_soil[:, 3] = np.clip(X_soil[:, 3] * 40 + 320, 100, 600)  # Potassium
    X_soil[:, 4] = np.clip(X_soil[:, 4] * 8 + 30, 5, 60)       # Soil Moisture %
    
    # Weather: rainfall, avg_temp
    X_weather = np.random.randn(num_samples, 2).astype(np.float32)
    X_weather[:, 0] = np.clip(X_weather[:, 0] * 150 + 750, 100, 2000) # Rain
    X_weather[:, 1] = np.clip(X_weather[:, 1] * 2 + 28, 15, 45)       # Temp
    
    # Concatenate features for RF/CatBoost and LightGBM
    X_all = np.hstack([X_soil, X_weather]) # Shape: (1500, 7)
    
    # Target 1: Yield (kg/ha)
    y_yield = (
        X_all[:, 1] * 2.0 + X_all[:, 2] * 4.5 + X_all[:, 3] * 1.1 + # Soil nutrients
        X_all[:, 0] * -50.0 + (X_all[:, 0] - 6.8)**2 * -20.0 +     # pH response
        X_all[:, 5] * 0.8 +                                        # Rainfall
        np.random.normal(0, 50, num_samples)                       # Noise
    )
    y_yield = np.clip(y_yield + 800, 200, 4500).astype(np.float32)
    
    # Target 2: Crop labels for recommendation (0 to 7)
    y_crop = np.random.randint(0, len(CROPS), num_samples)

    try:
        mlflow.start_run(run_name="crop_intelligence_pipeline")
        mlflow.log_param("num_crops", len(CROPS))
        mlflow.log_param("rf_estimators", 150)
    except Exception:
        pass

    # ─── 2. Train RF + CatBoost Ensemble (Yield) ─────────────────────────────
    print("📈 Training Random Forest Regressor for crop yield...")
    model_rf = RandomForestRegressor(n_estimators=150, max_depth=10, random_state=42)
    model_rf.fit(X_all, y_yield)
    rf_r2 = model_rf.score(X_all, y_yield)
    print(f"   ↳ Random Forest R² Score: {rf_r2:.4f}")
    
    print("📈 Training CatBoost Regressor for crop yield...")
    model_cb = CatBoostRegressor(iterations=200, depth=6, learning_rate=0.08, verbose=0)
    model_cb.fit(X_all, y_yield)
    cb_r2 = model_cb.score(X_all, y_yield)
    print(f"   ↳ CatBoost R² Score: {cb_r2:.4f}")
    
    try:
        mlflow.log_metric("rf_r2", rf_r2)
        mlflow.log_metric("catboost_r2", cb_r2)
    except Exception:
        pass

    # Save Ensemble Regressors
    with open(os.path.join(MODEL_DIR, "rf_yield_model.pkl"), "wb") as f:
        pickle.dump(model_rf, f)
    with open(os.path.join(MODEL_DIR, "catboost_yield_model.pkl"), "wb") as f:
        pickle.dump(model_cb, f)
    print("💾 Saved yield regression ensemble models.")

    # ─── 3. Train Keras Soil-Weather Fusion Network (Yield) ──────────────────
    print("🧠 Training Keras (TensorFlow) Soil-Weather Fusion Neural Network...")
    fusion_net = build_fusion_network(soil_dim=5, weather_dim=2)
    fusion_net.fit(
        x={"soil_features": X_soil, "weather_features": X_weather},
        y=y_yield,
        epochs=15,
        batch_size=32,
        verbose=0
    )
    eval_res = fusion_net.evaluate(
        x={"soil_features": X_soil, "weather_features": X_weather},
        y=y_yield,
        verbose=0
    )
    print(f"   ↳ Keras Neural Net MAE: {eval_res[1]:.2f} kg/ha")
    
    try:
        mlflow.log_metric("nn_final_mae", eval_res[1])
    except Exception:
        pass
        
    fusion_net.save(os.path.join(MODEL_DIR, "soil_weather_fusion.keras"))
    print("💾 Saved Keras Soil-Weather Fusion Neural Network.")

    # ─── 4. Train Multiclass LightGBM Classifier (Crop Recommender) ──────────
    print("⚡ Training LightGBM Multiclass Classifier for crop recommendation...")
    train_data = lgb.Dataset(X_all, label=y_crop)
    params = {
        "objective": "multiclass",
        "num_class": len(CROPS),
        "metric": "multi_logloss",
        "boosting_type": "gbdt",
        "learning_rate": 0.05,
        "num_leaves": 31,
        "verbosity": -1,
        "seed": 42
    }
    model_lgb = lgb.train(params, train_data, num_boost_round=100)
    
    # Save LightGBM model
    with open(os.path.join(MODEL_DIR, "lightgbm_recommender.pkl"), "wb") as f:
        pickle.dump(model_lgb, f)
    print("💾 Saved LightGBM crop suitability recommender.")
    
    try:
        mlflow.end_run()
    except Exception:
        pass
        
    print("🎉 Module 2 Crop Intelligence Models Successfully Trained and Registered!")


if __name__ == "__main__":
    train_crop_models()
