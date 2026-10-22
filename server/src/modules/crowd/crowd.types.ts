export interface CrowdModelFeatures {
  streetname: string;
  hour: number;
  weekday: string;
  temperature: number;
  weather_condition: string;
  incidents: string;
  n_pedestrians: number;
  towards_ratio: number;
  lag_1h: number;
  lag_2h: number;
  lag_3h: number;
  lag_24h: number;
  lag_168h: number;
}

export interface CrowdPredictionMLRequest {
  features: CrowdModelFeatures;
}

export interface CrowdPredictionMLResponse {
  predicted_pedestrian_count: number;
  unit: "pedestrians/hour";
  horizon_hours: 1;
  model_version: string;
  model_scope: string;
}

export interface CrowdPredictionResult {
  predictedCrowd: number;
  unit: string;
  predictionHorizonHours: number;
  modelVersion: string;
  modelScope: string;
}