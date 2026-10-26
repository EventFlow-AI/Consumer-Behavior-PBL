"""Inference helpers for the queue waiting-time prototype.

This model predicts the average waiting time one hour ahead
for an airport checkpoint. It is not trained on Rahat Setu data.
"""

from __future__ import annotations

import json
from functools import lru_cache
from pathlib import Path
from typing import Any, Mapping

import joblib
import numpy as np
import pandas as pd


BASE_DIR = Path(__file__).resolve().parents[1]

MODEL_PATH = BASE_DIR / "models" / "queue_wait_hgb_v1.joblib"
METADATA_PATH = BASE_DIR / "models" / "queue_wait_hgb_v1_metadata.json"

OPTIONAL_MISSING_FEATURES = {
    "avg_wait_lag_1h",
    "avg_wait_lag_2h",
    "avg_wait_lag_3h",
    "avg_wait_lag_24h",
    "avg_wait_lag_168h",
    "avg_wait_mean_last3h",
    "avg_wait_change_1h",
    "avg_wait_change_3h",
}

NONNEGATIVE_WAIT_FEATURES = {
    "avg_wait",
    "p50_wait",
    "p75_wait",
    "p95_wait",
    "max_wait",
    "avg_wait_lag_1h",
    "avg_wait_lag_2h",
    "avg_wait_lag_3h",
    "avg_wait_lag_24h",
    "avg_wait_lag_168h",
    "avg_wait_mean_last3h",
}


@lru_cache(maxsize=1)
def _load_artifacts():
    """Load the trained pipeline and metadata once per process."""

    if not MODEL_PATH.is_file():
        raise FileNotFoundError(
            f"Queue model not found: {MODEL_PATH}"
        )

    if not METADATA_PATH.is_file():
        raise FileNotFoundError(
            f"Queue model metadata not found: {METADATA_PATH}"
        )

    model = joblib.load(MODEL_PATH)

    with METADATA_PATH.open("r", encoding="utf-8") as file:
        metadata = json.load(file)

    features = metadata.get("features")
    categorical = metadata.get("categorical_features")
    numeric = metadata.get("numeric_features")

    if not all(isinstance(value, list) for value in
               (features, categorical, numeric)):
        raise RuntimeError("Invalid queue model metadata.")

    if len(features) != len(set(features)):
        raise RuntimeError("Duplicate features in model metadata.")

    if set(features) != set(categorical + numeric):
        raise RuntimeError(
            "Feature metadata does not match categorical/numeric columns."
        )

    return model, metadata


def load_queue_model():
    """Return the cached trained pipeline."""

    return _load_artifacts()[0]


def _prepare_features(
    input_features: Mapping[str, Any],
    metadata: dict,
) -> pd.DataFrame:
    """Validate and order an input feature mapping."""

    if not isinstance(input_features, Mapping):
        raise TypeError("input_features must be a mapping.")

    expected = metadata["features"]
    categorical = set(metadata["categorical_features"])
    numeric = set(metadata["numeric_features"])

    missing = sorted(set(expected) - set(input_features))
    extra = sorted(set(input_features) - set(expected))

    if missing:
        raise ValueError(f"Missing required features: {missing}")

    if extra:
        raise ValueError(f"Unexpected features: {extra}")

    row = {}

    for name in expected:
        value = input_features[name]

        if value is None or (
            isinstance(value, (float, np.floating))
            and np.isnan(value)
        ):
            if name not in OPTIONAL_MISSING_FEATURES:
                raise ValueError(
                    f"Feature '{name}' cannot be missing."
                )
            row[name] = np.nan
            continue

        if name in categorical:
            if not isinstance(value, str) or not value.strip():
                raise ValueError(
                    f"Feature '{name}' must be a non-empty string."
                )

            row[name] = value.strip()
            continue

        if name not in numeric:
            raise RuntimeError(
                f"Feature '{name}' has no declared data type."
            )

        try:
            number = float(value)
        except (TypeError, ValueError) as exc:
            raise ValueError(
                f"Feature '{name}' must be numeric."
            ) from exc

        if not np.isfinite(number):
            raise ValueError(
                f"Feature '{name}' must be finite or an allowed missing value."
            )

        if name == "day_of_week":
            if not number.is_integer() or not 0 <= number <= 6:
                raise ValueError(
                    "day_of_week must be an integer from 0 to 6."
                )

        elif name in {"hour_of_day", "target_hour"}:
            if not number.is_integer() or not 0 <= number <= 23:
                raise ValueError(
                    f"{name} must be an integer from 0 to 23."
                )

        elif name == "target_day_of_week":
            if not number.is_integer() or not 0 <= number <= 6:
                raise ValueError(
                    "target_day_of_week must be an integer from 0 to 6."
                )

        elif name == "n_samples":
            if not number.is_integer() or number < 1:
                raise ValueError("n_samples must be a positive integer.")

        if name in NONNEGATIVE_WAIT_FEATURES and number < 0:
            raise ValueError(
                f"Feature '{name}' cannot be negative."
            )

        if name.endswith("_sin") or name.endswith("_cos"):
            if not -1.000001 <= number <= 1.000001:
                raise ValueError(
                    f"Feature '{name}' must be between -1 and 1."
                )

        row[name] = number

    return pd.DataFrame([row], columns=expected)


def predict_queue_wait(
    input_features: Mapping[str, Any],
) -> dict[str, Any]:
    """Predict checkpoint average wait one hour ahead.

    Historical lag and trend fields may be NaN where history is
    unavailable. The fitted preprocessing pipeline imputes them.
    """

    model, metadata = _load_artifacts()

    model_input = _prepare_features(input_features, metadata)
    prediction = float(model.predict(model_input)[0])

    if not np.isfinite(prediction):
        raise RuntimeError("Queue model returned a non-finite prediction.")

    # Waiting time cannot be negative.
    prediction = max(0.0, prediction)

    return {
        "predicted_wait_minutes": round(prediction, 2),
        "unit": "minutes",
        "horizon_hours": 1,
        "model_version": metadata["model_version"],
        "model_scope": metadata["model_scope"],
    }


if __name__ == "__main__":
    print("Queue inference module is ready.")
    print(f"Model: {MODEL_PATH}")
    print(f"Metadata: {METADATA_PATH}")

    loaded_model = load_queue_model()
    print(f"Pipeline loaded: {type(loaded_model).__name__}")