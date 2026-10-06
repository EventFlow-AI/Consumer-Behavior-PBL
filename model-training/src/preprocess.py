"""
Preprocess the real Würzburg pedestrian-flow dataset for EventFlow AI.

Pipeline:
1. Load raw data.
2. Construct timestamps.
3. Create a valid one-hour-ahead target.
4. Create historical lag features from measured observations.
5. Create directional features.
6. Split chronologically without target leakage.
7. Save processed datasets.
"""

from pathlib import Path

import numpy as np
import pandas as pd


# --------------------------------------------------
# Paths
# --------------------------------------------------

BASE_DIR = Path(__file__).resolve().parent.parent

RAW_FILE = BASE_DIR / "datasets" / "raw" / "train.csv"
PROCESSED_DIR = BASE_DIR / "datasets" / "processed"


# --------------------------------------------------
# Configuration
# --------------------------------------------------

TRAIN_RATIO = 0.70
VALIDATION_RATIO = 0.15


# --------------------------------------------------
# Load raw data
# --------------------------------------------------

def load_data() -> pd.DataFrame:
    """Load raw data and construct a datetime column."""

    df = pd.read_csv(RAW_FILE)

    df["datetime"] = (
        pd.to_datetime(df["date"])
        + pd.to_timedelta(df["hour"], unit="h")
    )

    df = df.sort_values(
        ["streetname", "datetime"]
    ).reset_index(drop=True)

    return df


# --------------------------------------------------
# Create one-hour-ahead target
# --------------------------------------------------

def create_target(df: pd.DataFrame) -> pd.DataFrame:
    """
    Create n_pedestrians_next_hour.

    The target exists only when an actual observation
    exactly one hour later exists and that observation
    is measured.
    """

    result = df.copy()

    # The timestamp whose pedestrian count we want to predict.
    result["target_datetime"] = (
        result["datetime"] + pd.Timedelta(hours=1)
    )

    # Only measured observations may be used as targets.
    future = df[
        df["collection_type"] == "measured"
    ][
        ["streetname", "datetime", "n_pedestrians"]
    ].copy()

    future = future.rename(
        columns={
            "datetime": "target_datetime",
            "n_pedestrians": "n_pedestrians_next_hour",
        }
    )

    result = result.merge(
        future,
        on=["streetname", "target_datetime"],
        how="left",
    )

    # Current observation must also be measured.
    result = result[
        (result["collection_type"] == "measured")
        & result["n_pedestrians_next_hour"].notna()
    ].copy()

    result["n_pedestrians_next_hour"] = (
        result["n_pedestrians_next_hour"].astype(int)
    )

    return result


# --------------------------------------------------
# Historical lag features
# --------------------------------------------------

def add_lag_features(
    df: pd.DataFrame,
    raw_df: pd.DataFrame,
) -> pd.DataFrame:
    """
    Add historical pedestrian-count features.

    Historical values come from the original measured
    observations, not from the target-filtered dataset.
    """

    result = df.copy()

    measured = raw_df[
        raw_df["collection_type"] == "measured"
    ][
        ["streetname", "datetime", "n_pedestrians"]
    ].copy()

    for hours in [1, 2, 3, 24, 168]:

        lookup = measured.rename(
            columns={
                "datetime": "history_datetime",
                "n_pedestrians": f"lag_{hours}h",
            }
        )

        result["history_datetime"] = (
            result["datetime"]
            - pd.Timedelta(hours=hours)
        )

        result = result.merge(
            lookup,
            left_on=["streetname", "history_datetime"],
            right_on=["streetname", "history_datetime"],
            how="left",
        )

        result = result.drop(
            columns=["history_datetime"]
        )

    return result


# --------------------------------------------------
# Directional feature
# --------------------------------------------------

def add_direction_features(
    df: pd.DataFrame,
) -> pd.DataFrame:
    """Create useful directional features."""

    result = df.copy()

    result["towards_ratio"] = np.where(
        result["n_pedestrians"] > 0,
        result["n_pedestrians_towards"]
        / result["n_pedestrians"],
        0.0,
    )

    return result


# --------------------------------------------------
# Select ML features
# --------------------------------------------------

def select_features(
    df: pd.DataFrame,
) -> pd.DataFrame:
    """Select the columns used by the prediction model."""

    columns = [
        "datetime",
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
        "target_datetime",
        "n_pedestrians_next_hour",
    ]

    return df[columns].copy()


# --------------------------------------------------
# Chronological split
# --------------------------------------------------

def chronological_split(
    df: pd.DataFrame,
) -> tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame]:
    """
    Split into chronological train/validation/test sets.

    Targets are required to remain inside the same split,
    preventing future-target leakage across boundaries.
    """

    timestamps = np.sort(
        df["datetime"].unique()
    )

    train_end_index = int(
        len(timestamps) * TRAIN_RATIO
    )

    validation_end_index = int(
        len(timestamps)
        * (TRAIN_RATIO + VALIDATION_RATIO)
    )

    train_cutoff = timestamps[train_end_index]
    validation_cutoff = timestamps[validation_end_index]

    train = df[
        (df["datetime"] < train_cutoff)
        & (df["target_datetime"] < train_cutoff)
    ].copy()

    validation = df[
        (df["datetime"] >= train_cutoff)
        & (df["datetime"] < validation_cutoff)
        & (df["target_datetime"] < validation_cutoff)
    ].copy()

    test = df[
        df["datetime"] >= validation_cutoff
    ].copy()

    return train, validation, test


# --------------------------------------------------
# Main pipeline
# --------------------------------------------------

def main() -> None:

    print("Loading raw data...")
    raw_df = load_data()

    print(f"Raw rows: {len(raw_df):,}")

    print("Creating one-hour-ahead target...")
    df = create_target(raw_df)

    print(
        f"Rows after target creation: {len(df):,}"
    )

    print("Creating historical lag features...")
    df = add_lag_features(df, raw_df)

    print("Creating directional features...")
    df = add_direction_features(df)

    df = select_features(df)

    required_lags = [
        "lag_1h",
        "lag_2h",
        "lag_3h",
        "lag_24h",
        "lag_168h",
    ]

    before_lag_filter = len(df)

    df = df.dropna(
        subset=required_lags
    ).reset_index(drop=True)

    removed = before_lag_filter - len(df)

    print(
        f"Rows removed because of missing lag history: {removed:,}"
    )

    print(
        f"Rows ready for splitting: {len(df):,}"
    )

    train, validation, test = chronological_split(df)

    PROCESSED_DIR.mkdir(
        parents=True,
        exist_ok=True,
    )

    train.to_csv(
        PROCESSED_DIR / "train.csv",
        index=False,
    )

    validation.to_csv(
        PROCESSED_DIR / "validation.csv",
        index=False,
    )

    test.to_csv(
        PROCESSED_DIR / "test.csv",
        index=False,
    )

    print("\nProcessed datasets:")
    print(f"Train:      {len(train):,} rows")
    print(f"Validation: {len(validation):,} rows")
    print(f"Test:       {len(test):,} rows")

    print("\nDate ranges:")

    print(
        "Train:",
        train["datetime"].min(),
        "→",
        train["datetime"].max(),
    )

    print(
        "Validation:",
        validation["datetime"].min(),
        "→",
        validation["datetime"].max(),
    )

    print(
        "Test:",
        test["datetime"].min(),
        "→",
        test["datetime"].max(),
    )

    print("\nMissing values:")
    print(df.isna().sum())


if __name__ == "__main__":
    main()