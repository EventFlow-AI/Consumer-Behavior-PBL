import type {
  CrowdModelFeatures,
  CrowdPredictionMLResponse,
  CrowdPredictionResult,
} from "./crowd.types.js";

export interface EventCrowdState {
  locationId: string;
  locationName: string;
  timestamp: Date;
  temperature: number;
  weatherCondition: string;
  hasIncident: boolean;
  currentCrowd: number;
  towardsRatio: number;
  lag1h: number;
  lag2h: number;
  lag3h: number;
  lag24h: number;
  lag168h: number;
}

export function toMLFeatures(
  state: EventCrowdState,
): CrowdModelFeatures {
  return {
    streetname: state.locationName,
    hour: state.timestamp.getHours(),
    weekday: state.timestamp.toLocaleDateString("en-US", {
      weekday: "long",
    }),
    temperature: state.temperature,
    weather_condition: state.weatherCondition,
    incidents: state.hasIncident ? "incident" : "no_incident",
    n_pedestrians: state.currentCrowd,
    towards_ratio: state.towardsRatio,
    lag_1h: state.lag1h,
    lag_2h: state.lag2h,
    lag_3h: state.lag3h,
    lag_24h: state.lag24h,
    lag_168h: state.lag168h,
  };
}

export function fromMLResponse(
  response: CrowdPredictionMLResponse,
): CrowdPredictionResult {
  return {
    predictedCrowd: response.predicted_pedestrian_count,
    unit: response.unit,
    predictionHorizonHours: response.horizon_hours,
    modelVersion: response.model_version,
    modelScope: response.model_scope,
  };
}