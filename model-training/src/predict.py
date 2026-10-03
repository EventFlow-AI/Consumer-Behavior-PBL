"""
Prediction and inference helpers for Rahat Setu crowd & queue forecasting.
"""

def estimate_queue_wait_time(queue_length: int, processing_rate_per_min: float = 3.0) -> int:
    """
    Heuristic / model estimate for queue waiting time in minutes.
    """
    if processing_rate_per_min <= 0:
        return 0
    return round(queue_length / processing_rate_per_min)


def calculate_crowd_density(occupancy: int, capacity: int) -> str:
    """
    Classify crowd density into LOW, MODERATE, HIGH, CRITICAL.
    """
    if capacity <= 0:
        return "UNKNOWN"
    ratio = occupancy / capacity
    if ratio < 0.4:
        return "LOW"
    elif ratio < 0.7:
        return "MODERATE"
    elif ratio < 0.9:
        return "HIGH"
    else:
        return "CRITICAL"
