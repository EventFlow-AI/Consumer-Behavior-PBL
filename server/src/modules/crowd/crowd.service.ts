import { requestCrowdPrediction } from "./crowd.ml-client.js";
import {
  fromMLResponse,
  toMLFeatures,
  type EventCrowdState,
} from "./crowd.adapter.js";
import type { CrowdPredictionResult } from "./crowd.types.js";

export async function predictCrowd(
  state: EventCrowdState,
): Promise<CrowdPredictionResult> {
  const features = toMLFeatures(state);

  const mlResponse = await requestCrowdPrediction({
    features,
  });

  return fromMLResponse(mlResponse);
}