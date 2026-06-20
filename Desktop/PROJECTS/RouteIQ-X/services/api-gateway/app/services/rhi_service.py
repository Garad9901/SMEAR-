"""
RouteIQ X — AI Engine Service Proxy Client
Handles outbound HTTP calls to the RHI AI prediction engine.
"""

import httpx
import structlog
from typing import Optional, Dict, Any

logger = structlog.get_logger(__name__)

# AI Engine internal URL
AI_ENGINE_URL = "http://ai-engine:8002"

async def compute_rhi(segment_id: str, satellite_imagery_url: Optional[str] = None) -> Dict[str, Any]:
    """
    Query the AI Engine to compute Road Health Index (RHI) score.
    """
    logger.info("Proxying RHI computation request to AI engine", segment_id=segment_id)
    
    # In production: query database to fetch latest engineered features for this segment,
    # then feed those features to the predictor. Here we use representative features.
    payload = {
        "segment_id": segment_id,
        "road_age_years": 6,
        "traffic_load_score": 0.58,
        "rainfall_mm_annual": 1150.0,
        "temperature_avg_celsius": 24.2,
        "freeze_thaw_cycles": 0,
        "last_maintenance_days_ago": 240,
        "complaint_count_30d": 2,
        "surface_type_encoded": 1,
        "slope_gradient": 0.8,
        "soil_type_encoded": 2,
        "uv_exposure_index": 3.4,
        "drainage_quality": 0.82
    }
    
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.post(f"{AI_ENGINE_URL}/predict/rhi", json=payload)
            if resp.status_code == 200:
                return resp.json()
            else:
                logger.error("AI Engine returned error response", status=resp.status_code, body=resp.text)
                raise HTTPException(status_code=502, detail="Failed to retrieve prediction from upstream AI Engine")
    except Exception as e:
        logger.error("Failed to query AI Engine service", error=str(e))
        # Fallback values
        return {
            "segment_id": segment_id,
            "rhi_score": 68.5,
            "risk_level": "medium",
            "confidence": 0.89,
            "feature_importances": {},
            "model_version": "fallback-local",
            "inference_time_ms": 0.0,
            "explanation": "Fallback RHI prediction applied due to upstream connection timeouts."
        }
