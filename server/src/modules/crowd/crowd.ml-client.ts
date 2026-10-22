import type {
  CrowdPredictionMLRequest,
  CrowdPredictionMLResponse,
} from "./crowd.types.js";

const ML_API_BASE_URL = process.env.ML_API_BASE_URL;
const ML_API_KEY = process.env.ML_API_KEY;
const ML_CROWD_ENDPOINT =
  process.env.ML_CROWD_ENDPOINT ??
  "/internal/v1/predictions/crowd/next-hour";

export async function requestCrowdPrediction(
  payload: CrowdPredictionMLRequest,
): Promise<CrowdPredictionMLResponse> {
  if (!ML_API_BASE_URL) {
    throw new Error("ML_API_BASE_URL is not configured");
  }

  if (!ML_API_KEY) {
    throw new Error("ML_API_KEY is not configured");
  }

  const response = await fetch(`${ML_API_BASE_URL}${ML_CROWD_ENDPOINT}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${ML_API_KEY}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorBody = await response.text();

    throw new Error(
      `ML crowd prediction failed with status ${response.status}: ${errorBody}`,
    );
  }

  return (await response.json()) as CrowdPredictionMLResponse;
}