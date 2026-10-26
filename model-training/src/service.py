"""Internal FastAPI service for the Würzburg crowd-prediction prototype.

Start from the ``model-training`` directory with:

    export ML_API_KEY="<your-local-secret>"
    uvicorn src.service:app --host 127.0.0.1 --port 8001 --workers 1

Send protected requests with ``Authorization: Bearer $ML_API_KEY``.

This service serves the saved Würzburg model only. It does not represent live
Rahat Setu event or sensor data.
"""

from __future__ import annotations

import hmac
import json
import logging
import os
from contextlib import asynccontextmanager
from pathlib import Path
from typing import Annotated, Literal

from fastapi import Depends, FastAPI, Header, HTTPException, Request
from pydantic import BaseModel, ConfigDict, Field, field_validator

from .predict import load_model, predict_next_hour
from .queue_predict import load_queue_model, predict_queue_wait


logger = logging.getLogger("eventflow.ml_service")
BASE_DIR = Path(__file__).resolve().parent.parent
METADATA_PATH = BASE_DIR / "models" / "crowd_model_metadata.json"
MODEL_VERSION = "wuerzburg-prototype-v1"
MODEL_SCOPE_FALLBACK = "Würzburg pedestrian-flow prototype"
QUEUE_MODEL_VERSION = "queue-wait-hgb-v1"
QUEUE_MODEL_SCOPE = (
    "US airport checkpoint waiting-time prototype; not trained on Rahat Setu event data"
)


class CrowdModelFeatures(BaseModel):
    """The exact 13-feature contract expected by the saved model."""

    model_config = ConfigDict(
        extra="forbid",
        str_strip_whitespace=True,
        allow_inf_nan=False,
    )

    streetname: str = Field(min_length=1)
    hour: int = Field(ge=0, le=23)
    weekday: str = Field(min_length=1)
    temperature: float
    weather_condition: str = Field(min_length=1)
    incidents: str = Field(min_length=1)
    n_pedestrians: float = Field(ge=0)
    towards_ratio: float = Field(ge=0, le=1)
    lag_1h: float = Field(ge=0)
    lag_2h: float = Field(ge=0)
    lag_3h: float = Field(ge=0)
    lag_24h: float = Field(ge=0)
    lag_168h: float = Field(ge=0)


class CrowdPredictionRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    model_version: str = MODEL_VERSION
    features: CrowdModelFeatures

    @field_validator("model_version")
    @classmethod
    def validate_model_version(cls, value: str) -> str:
        if value != MODEL_VERSION:
            raise ValueError(f"Only model_version '{MODEL_VERSION}' is available")
        return value


class QueueModelFeatures(BaseModel):
    """The exact 23-feature contract expected by the saved queue model."""

    model_config = ConfigDict(
        extra="forbid",
        str_strip_whitespace=True,
        allow_inf_nan=False,
    )

    airport: str = Field(min_length=1)
    terminal: str = Field(min_length=1)
    queue_type: str = Field(min_length=1)
    day_of_week: int = Field(strict=True, ge=0, le=6)
    hour_of_day: int = Field(strict=True, ge=0, le=23)
    avg_wait: float = Field(ge=0)
    p50_wait: float = Field(ge=0)
    p75_wait: float = Field(ge=0)
    p95_wait: float = Field(ge=0)
    max_wait: float = Field(ge=0)
    n_samples: int = Field(strict=True, ge=1)
    avg_wait_lag_1h: float | None = Field(default=None, ge=0)
    avg_wait_lag_2h: float | None = Field(default=None, ge=0)
    avg_wait_lag_3h: float | None = Field(default=None, ge=0)
    avg_wait_lag_24h: float | None = Field(default=None, ge=0)
    avg_wait_lag_168h: float | None = Field(default=None, ge=0)
    avg_wait_mean_last3h: float | None = Field(default=None, ge=0)
    avg_wait_change_1h: float | None = None
    avg_wait_change_3h: float | None = None
    target_hour_sin: float = Field(ge=-1, le=1)
    target_hour_cos: float = Field(ge=-1, le=1)
    target_day_sin: float = Field(ge=-1, le=1)
    target_day_cos: float = Field(ge=-1, le=1)


class QueuePredictionRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    model_version: str = QUEUE_MODEL_VERSION
    features: QueueModelFeatures

    @field_validator("model_version")
    @classmethod
    def validate_model_version(cls, value: str) -> str:
        if value != QUEUE_MODEL_VERSION:
            raise ValueError(f"Only model_version '{QUEUE_MODEL_VERSION}' is available")
        return value


def require_ml_api_key(
    authorization: str | None = Header(default=None, alias="Authorization"),
) -> None:
    """Require a bearer token for internal prediction requests."""
    expected_key = os.environ.get("ML_API_KEY")
    if not expected_key:
        raise HTTPException(
            status_code=503,
            detail="ML_API_KEY is not configured on the inference service",
        )

    scheme, separator, provided_key = (authorization or "").partition(" ")
    if (
        not separator
        or scheme.lower() != "bearer"
        or not provided_key
        or not hmac.compare_digest(provided_key, expected_key)
    ):
        raise HTTPException(
            status_code=401,
            detail="Missing or invalid bearer token",
            headers={"WWW-Authenticate": "Bearer"},
        )


class CrowdPredictionResponse(BaseModel):
    predicted_pedestrian_count: float
    unit: Literal["pedestrians/hour"] = "pedestrians/hour"
    horizon_hours: Literal[1] = 1
    model_version: str
    model_scope: str


class QueuePredictionResponse(BaseModel):
    predicted_wait_minutes: float
    unit: Literal["minutes"] = "minutes"
    horizon_hours: Literal[1] = 1
    model_version: str
    model_scope: Literal["US airport checkpoint waiting-time prototype; not trained on Rahat Setu event data"] = QUEUE_MODEL_SCOPE


class HealthResponse(BaseModel):
    status: Literal["ready", "not_ready"]
    model_loaded: bool
    model_version: str
    model_scope: str
    queue_model_loaded: bool = False
    detail: str | None = None


def _load_model_metadata() -> dict[str, object]:
    if not METADATA_PATH.is_file():
        raise FileNotFoundError(f"Model metadata not found: {METADATA_PATH}")
    with METADATA_PATH.open(encoding="utf-8") as metadata_file:
        metadata = json.load(metadata_file)
    if not isinstance(metadata, dict):
        raise ValueError("Model metadata must contain a JSON object")
    if not isinstance(metadata.get("feature_list"), list):
        raise ValueError("Model metadata does not contain a valid feature_list")
    scope = metadata.get("model_scope")
    if not isinstance(scope, str) or not scope.strip():
        raise ValueError("Model metadata does not contain a valid model_scope")
    return metadata


@asynccontextmanager
async def lifespan(application: FastAPI):
    """Load the model and metadata once when this service process starts."""
    application.state.model = None
    application.state.model_loaded = False
    application.state.model_scope = MODEL_SCOPE_FALLBACK
    application.state.load_error = None
    application.state.queue_model = None
    application.state.queue_model_loaded = False

    try:
        metadata = _load_model_metadata()
        # predict.load_model is cached, so the request helper reuses this model.
        application.state.model = load_model()
        application.state.model_scope = str(metadata["model_scope"])
        application.state.model_loaded = True
        logger.info("Loaded model %s (%s)", MODEL_VERSION, application.state.model_scope)
    except Exception as exc:
        application.state.load_error = str(exc)
        logger.exception("Würzburg prototype model failed to load")

    try:
        application.state.queue_model = load_queue_model()
        application.state.queue_model_loaded = True
        logger.info("Loaded queue model %s", QUEUE_MODEL_VERSION)
    except Exception:
        logger.exception("Queue waiting-time model failed to load")

    yield

    application.state.model = None
    application.state.model_loaded = False
    application.state.queue_model = None
    application.state.queue_model_loaded = False


app = FastAPI(
    title="Würzburg Crowd Prediction Service",
    description=(
        "Internal inference API for the Würzburg pedestrian-flow prototype. "
        "This is not a Rahat Setu live event prediction service."
    ),
    version=MODEL_VERSION,
    lifespan=lifespan,
)


@app.get("/health", response_model=HealthResponse)
async def health(request: Request) -> HealthResponse:
    """Report readiness, including whether the saved model loaded."""
    loaded = request.app.state.model_loaded
    return HealthResponse(
        status="ready" if loaded else "not_ready",
        model_loaded=loaded,
        model_version=MODEL_VERSION,
        model_scope=request.app.state.model_scope,
        queue_model_loaded=request.app.state.queue_model_loaded,
        detail=None if loaded else request.app.state.load_error,
    )


@app.post(
    "/internal/v1/predictions/crowd/next-hour",
    response_model=CrowdPredictionResponse,
    dependencies=[Depends(require_ml_api_key)],
)
async def predict_crowd_next_hour(
    payload: CrowdPredictionRequest,
    request: Request,
) -> CrowdPredictionResponse:
    """Predict the next-hour count from one complete model feature record."""
    if not request.app.state.model_loaded:
        raise HTTPException(
            status_code=503,
            detail="Würzburg prototype model is not ready",
        )

    try:
        count = predict_next_hour(payload.features.model_dump())
    except (ValueError, TypeError) as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    except Exception as exc:
        logger.exception("Crowd inference failed")
        raise HTTPException(status_code=500, detail="Crowd inference failed") from exc

    return CrowdPredictionResponse(
        predicted_pedestrian_count=count,
        model_version=MODEL_VERSION,
        model_scope=request.app.state.model_scope,
    )


@app.post(
    "/internal/v1/predictions/queue/next-hour",
    response_model=QueuePredictionResponse,
    dependencies=[Depends(require_ml_api_key)],
)
async def predict_queue_next_hour(payload: QueuePredictionRequest, request: Request) -> QueuePredictionResponse:
    """Predict checkpoint waiting time for the next hour."""
    if not request.app.state.queue_model_loaded:
        raise HTTPException(status_code=503, detail="Queue waiting-time model is not ready")

    try:
        prediction = predict_queue_wait(payload.features.model_dump())
    except (ValueError, TypeError) as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    except Exception as exc:
        logger.exception("Queue inference failed")
        raise HTTPException(status_code=500, detail="Queue inference failed") from exc

    return QueuePredictionResponse(
        predicted_wait_minutes=prediction["predicted_wait_minutes"],
        unit=prediction["unit"],
        horizon_hours=prediction["horizon_hours"],
        model_version=prediction["model_version"],
        model_scope=prediction["model_scope"],
    )
