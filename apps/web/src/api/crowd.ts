import { apiRequest } from "./client";

export interface CrowdPredictionInput {
  locationId: string;
  locationName: string;
  timestamp: string;
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

export interface CrowdPredictionResult {
  predictedCrowd: number;
  unit: string;
  predictionHorizonHours: number;
  modelVersion: string;
  modelScope: string;
}

export async function predictCrowd(
  input: CrowdPredictionInput,
) {
  const response = await apiRequest<{
    success: boolean;
    prediction: CrowdPredictionResult;
  }>("/crowd/predict", {
    method: "POST",
    body: JSON.stringify(input),
  });

  return response.prediction;
}