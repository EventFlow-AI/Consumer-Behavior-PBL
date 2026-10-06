"""Train and evaluate the Würzburg pedestrian-flow prototype model.

This script trains the ExtraTrees configuration used in
``notebooks/01_eda_crowd.ipynb``. It is an offline prototype for the
Würzburg pedestrian-flow dataset, not a production Rahat Setu model.
"""

from __future__ import annotations

import json
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import ExtraTreesRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder


BASE_DIR = Path(__file__).resolve().parent.parent
PROCESSED_DIR = BASE_DIR / "datasets" / "processed"
MODELS_DIR = BASE_DIR / "models"
MODEL_PATH = MODELS_DIR / "crowd_model_wuerzburg.joblib"
METADATA_PATH = MODELS_DIR / "crowd_model_metadata.json"

FEATURES = [
    "streetname",
    "hour",
    "weekday",
    "temperature",
    "weather_condition",
    "incidents",
    "n_pedestrians",
    "towards_ratio",
    "lag_1h",
    "lag_2h",
    "lag_3h",
    "lag_24h",
    "lag_168h",
]
TARGET = "n_pedestrians_next_hour"
CATEGORICAL_FEATURES = [
    "streetname",
    "weekday",
    "weather_condition",
    "incidents",
]
NUMERICAL_FEATURES = [
    "hour",
    "temperature",
    "n_pedestrians",
    "towards_ratio",
    "lag_1h",
    "lag_2h",
    "lag_3h",
    "lag_24h",
    "lag_168h",
]
RANDOM_STATE = 42
N_ESTIMATORS = 200
MIN_SAMPLES_LEAF = 2


def load_split(name: str) -> pd.DataFrame:
    """Load a processed split and check its required model columns."""
    path = PROCESSED_DIR / f"{name}.csv"
    if not path.is_file():
        raise FileNotFoundError(
            f"Processed {name}.csv not found at {path}. "
            "Run src/preprocess.py first."
        )

    frame = pd.read_csv(path)
    required = FEATURES + [TARGET]
    missing = [column for column in required if column not in frame.columns]
    if missing:
        raise ValueError(f"{path} is missing required columns: {missing}")
    if frame.empty:
        raise ValueError(f"Processed split is empty: {path}")
    if frame[required].isna().any().any():
        missing_values = frame[required].isna().sum()
        missing_values = missing_values[missing_values > 0].to_dict()
        raise ValueError(f"Missing model values in {path}: {missing_values}")
    return frame


def make_pipeline() -> Pipeline:
    """Build preprocessing and estimator as one serializable pipeline."""
    preprocessor = ColumnTransformer(
        transformers=[
            (
                "categorical",
                OneHotEncoder(handle_unknown="ignore"),
                CATEGORICAL_FEATURES,
            ),
            ("numerical", "passthrough", NUMERICAL_FEATURES),
        ]
    )
    model = ExtraTreesRegressor(
        n_estimators=N_ESTIMATORS,
        random_state=RANDOM_STATE,
        n_jobs=-1,
        min_samples_leaf=MIN_SAMPLES_LEAF,
    )
    return Pipeline(
        steps=[("preprocessor", preprocessor), ("model", model)]
    )


def evaluate(pipeline: Pipeline, frame: pd.DataFrame, label: str) -> dict[str, float]:
    """Predict a split and print its MAE and RMSE."""
    predictions = pipeline.predict(frame[FEATURES])
    actual = frame[TARGET]
    mae = float(mean_absolute_error(actual, predictions))
    rmse = float(np.sqrt(mean_squared_error(actual, predictions)))
    print(f"{label} MAE:  {mae:.2f}")
    print(f"{label} RMSE: {rmse:.2f}")
    return {"mae": mae, "rmse": rmse}


def main() -> None:
    train_df = load_split("train")
    validation_df = load_split("validation")
    test_df = load_split("test")

    # Select the final configuration on validation data only.
    validation_pipeline = make_pipeline()
    validation_pipeline.fit(train_df[FEATURES], train_df[TARGET])
    validation_metrics = evaluate(
        validation_pipeline, validation_df, "Validation"
    )

    # Refit the selected configuration on train + validation. The held-out
    # test split is used only for the final evaluation below.
    train_validation_df = pd.concat(
        [train_df, validation_df], ignore_index=True
    )
    final_pipeline = make_pipeline()
    final_pipeline.fit(
        train_validation_df[FEATURES], train_validation_df[TARGET]
    )
    test_metrics = evaluate(final_pipeline, test_df, "Test")

    MODELS_DIR.mkdir(parents=True, exist_ok=True)
    joblib.dump(final_pipeline, MODEL_PATH)

    metadata = {
        "model_type": "sklearn.ensemble.ExtraTreesRegressor",
        "model_scope": "Würzburg pedestrian-flow prototype; not production-ready for Rahat Setu",
        "target": TARGET,
        "feature_list": FEATURES,
        "validation_mae": validation_metrics["mae"],
        "validation_rmse": validation_metrics["rmse"],
        "test_mae": test_metrics["mae"],
        "test_rmse": test_metrics["rmse"],
        "random_state": RANDOM_STATE,
        "n_estimators": N_ESTIMATORS,
        "training_dataset_description": (
            "Measured hourly pedestrian observations from the Foot Traffic "
            "in Würzburg dataset. Each row represents a street and timestamp; "
            "the target is the measured pedestrian count exactly one hour "
            "later. The final fitted pipeline uses the processed chronological "
            "train and validation splits."
        ),
    }
    METADATA_PATH.write_text(
        json.dumps(metadata, indent=2) + "\n", encoding="utf-8"
    )

    print(f"Saved fitted preprocessing + model pipeline: {MODEL_PATH}")
    print(f"Saved model metadata: {METADATA_PATH}")


if __name__ == "__main__":
    main()
