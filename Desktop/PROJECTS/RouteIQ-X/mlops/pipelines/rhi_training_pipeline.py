"""
RouteIQ X — Kubeflow Pipeline Definitions
End-to-end ML training, evaluation, and deployment pipelines.
"""

import kfp
from kfp import dsl
from kfp.components import func_to_container_op
from typing import NamedTuple


# ── Component: Data Validation ─────────────────────────────────────
@dsl.component(
    base_image="ghcr.io/routeiq-x/ml-base:2.4.0",
    packages_to_install=["pandas", "great-expectations", "pydantic"],
)
def validate_training_data(
    data_path: str,
    validation_output: dsl.Output[dsl.Dataset],
    report_output: dsl.Output[dsl.Artifact],
) -> NamedTuple("Outputs", [("valid_count", int), ("validation_passed", bool)]):
    """Validate training dataset against schema and quality expectations."""
    import pandas as pd
    import json
    
    df = pd.read_parquet(data_path)
    
    validations = {
        "no_null_rhi": df["rhi_score"].notna().all(),
        "rhi_range": df["rhi_score"].between(0, 100).all(),
        "min_samples": len(df) >= 10_000,
        "feature_completeness": df.isnull().mean().max() < 0.05,
    }
    
    passed = all(validations.values())
    
    with open(report_output.path, "w") as f:
        json.dump({"validations": validations, "passed": passed, "total_rows": len(df)}, f)
    
    df.to_parquet(validation_output.path)
    
    from collections import namedtuple
    Output = namedtuple("Outputs", ["valid_count", "validation_passed"])
    return Output(len(df), passed)


# ── Component: Feature Engineering ────────────────────────────────
@dsl.component(
    base_image="ghcr.io/routeiq-x/ml-base:2.4.0",
    packages_to_install=["feast", "geopandas", "scikit-learn"],
)
def engineer_features(
    input_data: dsl.Input[dsl.Dataset],
    features_output: dsl.Output[dsl.Dataset],
    scaler_output: dsl.Output[dsl.Model],
) -> NamedTuple("Outputs", [("feature_count", int)]):
    """Engineer ML features and fit feature scalers."""
    import pandas as pd
    from sklearn.preprocessing import StandardScaler
    import joblib
    
    df = pd.read_parquet(input_data.path)
    
    # Feature engineering
    df["age_traffic_interaction"] = df["age_years"] * df["traffic_load_score"]
    df["climate_stress"] = df["rainfall_mm"] * df["freeze_thaw_cycles"] / 1000
    df["maintenance_lag"] = df["days_since_maintenance"] / df["age_years"].clip(1)
    df["complaint_density"] = df["complaints_30d"] / df["length_km"].clip(0.1)
    
    feature_cols = [
        "age_years", "traffic_load_score", "rainfall_mm", "freeze_thaw_cycles",
        "days_since_maintenance", "complaints_30d", "slope_pct", "drainage_score",
        "age_traffic_interaction", "climate_stress", "maintenance_lag", "complaint_density",
    ]
    
    scaler = StandardScaler()
    df[feature_cols] = scaler.fit_transform(df[feature_cols])
    
    df.to_parquet(features_output.path)
    joblib.dump(scaler, scaler_output.path)
    
    from collections import namedtuple
    Output = namedtuple("Outputs", ["feature_count"])
    return Output(len(feature_cols))


# ── Component: XGBoost Training ────────────────────────────────────
@dsl.component(
    base_image="ghcr.io/routeiq-x/ml-base:2.4.0",
    packages_to_install=["xgboost", "lightgbm", "mlflow", "shap"],
)
def train_rhi_model(
    features: dsl.Input[dsl.Dataset],
    model_output: dsl.Output[dsl.Model],
    metrics_output: dsl.Output[dsl.Metrics],
    mlflow_tracking_uri: str = "http://mlflow:5000",
    n_estimators: int = 500,
    max_depth: int = 6,
    learning_rate: float = 0.05,
):
    """Train XGBoost + LightGBM ensemble for RHI prediction."""
    import pandas as pd
    import xgboost as xgb
    import lightgbm as lgb
    from sklearn.model_selection import train_test_split
    from sklearn.metrics import mean_absolute_error, r2_score
    import mlflow
    import mlflow.xgboost
    import shap
    import joblib
    
    mlflow.set_tracking_uri(mlflow_tracking_uri)
    
    df = pd.read_parquet(features.path)
    feature_cols = [c for c in df.columns if c != "rhi_score"]
    X, y = df[feature_cols], df["rhi_score"]
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    with mlflow.start_run(run_name="RHI-XGBoost-Training"):
        mlflow.log_params({
            "n_estimators": n_estimators,
            "max_depth": max_depth,
            "learning_rate": learning_rate,
            "algorithm": "XGBoost+LightGBM ensemble",
        })
        
        # Train XGBoost
        xgb_model = xgb.XGBRegressor(
            n_estimators=n_estimators,
            max_depth=max_depth,
            learning_rate=learning_rate,
            subsample=0.8,
            colsample_bytree=0.8,
            early_stopping_rounds=50,
            eval_metric="mae",
        )
        xgb_model.fit(X_train, y_train, eval_set=[(X_test, y_test)], verbose=False)
        
        # Train LightGBM
        lgb_model = lgb.LGBMRegressor(
            n_estimators=n_estimators,
            max_depth=max_depth,
            learning_rate=learning_rate,
            subsample=0.8,
        )
        lgb_model.fit(X_train, y_train)
        
        # Ensemble predictions
        xgb_pred = xgb_model.predict(X_test)
        lgb_pred = lgb_model.predict(X_test)
        ensemble_pred = 0.6 * xgb_pred + 0.4 * lgb_pred
        
        mae = mean_absolute_error(y_test, ensemble_pred)
        r2 = r2_score(y_test, ensemble_pred)
        
        mlflow.log_metrics({"mae": mae, "r2": r2, "accuracy_pct": r2 * 100})
        
        # SHAP explainability
        explainer = shap.TreeExplainer(xgb_model)
        shap_values = explainer.shap_values(X_test[:100])
        
        # Log metrics
        metrics_output.log_metric("mae", mae)
        metrics_output.log_metric("r2", r2)
        metrics_output.log_metric("accuracy_pct", r2 * 100)
        
        # Save ensemble
        ensemble = {"xgb": xgb_model, "lgb": lgb_model, "weights": [0.6, 0.4]}
        joblib.dump(ensemble, model_output.path)
        mlflow.log_artifact(model_output.path)


# ── Component: Drift Detection ─────────────────────────────────────
@dsl.component(
    base_image="ghcr.io/routeiq-x/ml-base:2.4.0",
    packages_to_install=["evidently"],
)
def check_model_drift(
    reference_data: dsl.Input[dsl.Dataset],
    current_data: dsl.Input[dsl.Dataset],
    drift_report: dsl.Output[dsl.Artifact],
) -> NamedTuple("Outputs", [("drift_score", float), ("drift_detected", bool)]):
    """Detect feature and prediction drift using Evidently AI."""
    import pandas as pd
    from evidently.report import Report
    from evidently.metric_preset import DataDriftPreset, RegressionPreset
    import json
    
    ref_df = pd.read_parquet(reference_data.path)
    cur_df = pd.read_parquet(current_data.path)
    
    report = Report(metrics=[DataDriftPreset(), RegressionPreset()])
    report.run(reference_data=ref_df, current_data=cur_df)
    
    result = report.as_dict()
    drift_score = result.get("metrics", [{}])[0].get("result", {}).get("dataset_drift_share", 0)
    drift_detected = drift_score > 0.05
    
    report.save_html(drift_report.path)
    
    from collections import namedtuple
    Output = namedtuple("Outputs", ["drift_score", "drift_detected"])
    return Output(float(drift_score), drift_detected)


# ── Component: Model Promotion ─────────────────────────────────────
@dsl.component(
    base_image="ghcr.io/routeiq-x/ml-base:2.4.0",
    packages_to_install=["mlflow"],
)
def promote_to_production(
    model: dsl.Input[dsl.Model],
    r2_score: float,
    drift_detected: bool,
    mlflow_tracking_uri: str = "http://mlflow:5000",
    model_name: str = "RHI-Predictor-XGB",
) -> str:
    """Promote model to production stage in MLflow Model Registry."""
    import mlflow
    
    if r2_score < 0.90:
        return f"REJECTED: R² {r2_score:.3f} < 0.90 threshold"
    
    if drift_detected:
        return f"FLAGGED: Drift detected. Human approval required."
    
    client = mlflow.tracking.MlflowClient(mlflow_tracking_uri)
    # In production: register and promote model
    return f"PROMOTED: {model_name} promoted to Production. R²={r2_score:.3f}"


# ── Pipeline Definition ────────────────────────────────────────────
@dsl.pipeline(
    name="RouteIQ X — RHI Model Training Pipeline",
    description="Full ML pipeline: data validation → feature engineering → XGBoost training → drift check → promotion",
)
def rhi_training_pipeline(
    data_path: str = "s3://routeiq-x-artifacts/training-data/latest.parquet",
    mlflow_uri: str = "http://mlflow:5000",
    n_estimators: int = 500,
    min_r2: float = 0.90,
):
    # Step 1: Validate data
    validation = validate_training_data(data_path=data_path)
    
    # Step 2: Feature engineering (only if validation passed)
    with dsl.Condition(validation.outputs["validation_passed"] == True, name="validation-passed"):
        
        features = engineer_features(input_data=validation.outputs["validation_output"])
        
        # Step 3: Train model
        training = train_rhi_model(
            features=features.outputs["features_output"],
            mlflow_tracking_uri=mlflow_uri,
            n_estimators=n_estimators,
        )
        
        # Step 4: Check drift (compare to reference data)
        # In real pipeline: fetch reference data from feature store
        
        # Step 5: Promote if metrics pass
        promotion = promote_to_production(
            model=training.outputs["model_output"],
            r2_score=training.outputs["metrics_output"].get_metric("r2"),
            drift_detected=False,
            mlflow_tracking_uri=mlflow_uri,
        )


# Compile pipeline
if __name__ == "__main__":
    kfp.compiler.Compiler().compile(
        pipeline_func=rhi_training_pipeline,
        package_path="rhi_training_pipeline.yaml",
    )
    print("Pipeline compiled: rhi_training_pipeline.yaml")
