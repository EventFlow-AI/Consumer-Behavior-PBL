"""Inference helpers for the Würzburg crowd-prediction prototype.

This module is framework-independent and is not a Rahat Setu live predictor.
Run it directly for a one-row offline smoke test using the real, processed
Würzburg test split:

    python src/predict.py
"""

from __future__ import annotations

import json
import math
from functools import lru_cache
from numbers import Real
from pathlib import Path
from typing import Any, Mapping

import joblib
import numpy as np
import pandas as pd


BASE_DIR = Path(__file__).resolve().parent.parent
MODELS_DIR = BASE_DIR / "models"
MODEL_PATH = MODELS_DIR / "crowd_model_wuerzburg.joblib"
METADATA_PATH = MODELS_DIR / "crowd_model_metadata.json"
PROCESSED_TEST_PATH = BASE_DIR / "datasets" / "processed" / "test.csv"
TARGET = "n_pedestrians_next_hour"
CATEGORICAL_FEATURES = {
    "streetname",
    "weekday",
    "weather_condition",
    "incidents",
}
NUMERICAL_FEATURES = {
    "hour",
    "temperature",
    "n_pedestrians",
    "towards_ratio",
    "lag_1h",
    "lag_2h",
    "lag_3h",
    "lag_24h",
    "lag_168h",
}
NON_NEGATIVE_FEATURES = {
    "n_pedestrians",
    "lag_1h",
    "lag_2h",
    "lag_3h",
    "lag_24h",
    "lag_168h",
}


@lru_cache(maxsize=1)
def _load_metadata() -> dict[str, Any]:
    """Read model metadata once and use it as the inference feature contract."""
    if not METADATA_PATH.is_file():
        raise FileNotFoundError(f"Model metadata not found: {METADATA_PATH}")
    try:
        metadata = json.loads(METADATA_PATH.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        raise RuntimeError(f"Could not read model metadata: {exc}") from exc

    features = metadata.get("feature_list")
    if not isinstance(features, list) or not features or not all(
        isinstance(feature, str) for feature in features
    ):
        raise RuntimeError("Model metadata has no valid feature_list")
    if len(set(features)) != len(features):
        raise RuntimeError("Model metadata feature_list contains duplicates")
    if set(features) != CATEGORICAL_FEATURES | NUMERICAL_FEATURES:
        raise RuntimeError(
            "Model metadata feature_list does not match the supported "
            "Würzburg model input contract"
        )
    return metadata


@lru_cache(maxsize=1)
def load_model() -> Any:
    """Load the fitted sklearn preprocessing-and-model pipeline."""
    _load_metadata()  # Fail early if the saved contract is missing or invalid.
    if not MODEL_PATH.is_file():
        raise FileNotFoundError(f"Trained model not found: {MODEL_PATH}")
    try:
        pipeline = joblib.load(MODEL_PATH)
    except Exception as exc:
        raise RuntimeError(f"Could not load trained model: {exc}") from exc

    if not callable(getattr(pipeline, "predict", None)):
        raise RuntimeError(f"Saved model has no predict method: {MODEL_PATH}")

    fitted_features = getattr(pipeline, "feature_names_in_", None)
    expected_features = _load_metadata()["feature_list"]
    if fitted_features is not None and list(fitted_features) != expected_features:
        raise RuntimeError(
            "Saved model feature order does not match crowd_model_metadata.json"
        )
    return pipeline


def _normalise_and_validate_input(
    input_features: Mapping[str, Any],
) -> dict[str, Any]:
    """Check the exact field set, types, and basic value constraints."""
    if not isinstance(input_features, Mapping):
        raise ValueError("Prediction input must be a mapping of feature names to values")

    expected = _load_metadata()["feature_list"]
    received = set(input_features)
    missing = [feature for feature in expected if feature not in received]
    extra = sorted(str(feature) for feature in received - set(expected))
    if missing or extra:
        problems = []
        if missing:
            problems.append(f"missing required fields: {', '.join(missing)}")
        if extra:
            problems.append(f"unexpected fields: {', '.join(extra)}")
        raise ValueError("Invalid prediction input; " + "; ".join(problems))

    cleaned: dict[str, Any] = {}
    invalid: list[str] = []
    for feature in expected:
        value = input_features[feature]
        if isinstance(value, np.generic):
            value = value.item()

        if value is None or (isinstance(value, float) and not math.isfinite(value)):
            invalid.append(f"{feature} must not be null, NaN, or infinite")
            continue

        if feature in CATEGORICAL_FEATURES:
            if not isinstance(value, str) or not value.strip():
                invalid.append(f"{feature} must be a non-empty string")
                continue
            cleaned[feature] = value
            continue

        if feature not in NUMERICAL_FEATURES:
            invalid.append(f"{feature} is not a supported model feature")
            continue
        if isinstance(value, bool) or not isinstance(value, Real):
            invalid.append(f"{feature} must be a number")
            continue
        if not math.isfinite(float(value)):
            invalid.append(f"{feature} must be finite")
            continue
        numeric_value = float(value)
        if feature == "hour" and (
            not numeric_value.is_integer() or not 0 <= numeric_value <= 23
        ):
            invalid.append("hour must be an integer from 0 through 23")
            continue
        if feature in NON_NEGATIVE_FEATURES and numeric_value < 0:
            invalid.append(f"{feature} must be non-negative")
            continue
        if feature == "towards_ratio" and not 0 <= numeric_value <= 1:
            invalid.append("towards_ratio must be between 0 and 1")
            continue
        cleaned[feature] = numeric_value

    if invalid:
        raise ValueError("Invalid prediction input: " + "; ".join(invalid))
    return cleaned


def predict_next_hour(input_features: Mapping[str, Any]) -> float:
    """Return the predicted next-hour pedestrian count.

    ``input_features`` must contain exactly the fields in the saved model's
    metadata ``feature_list``. The returned value is a floating-point count,
    consistent with the sklearn regression output.
    """
    validated = _normalise_and_validate_input(input_features)
    feature_order = _load_metadata()["feature_list"]
    model_input = pd.DataFrame([validated], columns=feature_order)
    prediction = load_model().predict(model_input)
    predicted_count = float(prediction[0])
    if not math.isfinite(predicted_count):
        raise RuntimeError("The trained model returned a non-finite prediction")
    return predicted_count


def run_offline_wuerzburg_test() -> dict[str, float]:
    """Smoke-test the saved model with one real processed test-set row."""
    if not PROCESSED_TEST_PATH.is_file():
        raise FileNotFoundError(
            "Processed Würzburg test data not found: "
            f"{PROCESSED_TEST_PATH}. Run src/preprocess.py first."
        )
    test_df = pd.read_csv(PROCESSED_TEST_PATH, nrows=1)
    required = _load_metadata()["feature_list"] + [TARGET]
    missing = [column for column in required if column not in test_df.columns]
    if missing:
        raise ValueError(
            f"Processed test row is missing required columns: {', '.join(missing)}"
        )
    if test_df.empty:
        raise ValueError("Processed Würzburg test dataset has no rows")

    row = test_df.iloc[0]
    features = {feature: row[feature] for feature in _load_metadata()["feature_list"]}
    actual = float(row[TARGET])
    predicted = predict_next_hour(features)
    result = {"actual_next_hour_count": actual, "predicted_next_hour_count": predicted}

    print("OFFLINE WÜRZBURG MODEL TEST (not a Rahat Setu live prediction)")
    print(f"Source row: {PROCESSED_TEST_PATH}")
    print(f"Actual next-hour pedestrian count:    {actual:.2f}")
    print(f"Predicted next-hour pedestrian count: {predicted:.2f}")
    return result


if __name__ == "__main__":
    run_offline_wuerzburg_test()


def estimate_queue_wait_time(
    queue_length: int,
    processing_rate_per_min: float = 3.0,
) -> int:
    """Return the existing simple queue-wait estimate in minutes."""
    if processing_rate_per_min <= 0:
        return 0
    return round(queue_length / processing_rate_per_min)


def calculate_crowd_density(occupancy: int, capacity: int) -> str:
    """Classify occupancy relative to capacity using the existing thresholds."""
    if capacity <= 0:
        return "UNKNOWN"
    ratio = occupancy / capacity
    if ratio < 0.4:
        return "LOW"
    if ratio < 0.7:
        return "MODERATE"
    if ratio < 0.9:
        return "HIGH"
    return "CRITICAL"
