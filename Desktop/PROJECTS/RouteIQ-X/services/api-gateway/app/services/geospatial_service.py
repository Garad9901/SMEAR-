"""
RouteIQ X — Geospatial Engine Service Proxy Client
Handles outbound HTTP calls to the Geospatial network indexing engine.
"""

import httpx
import structlog
from typing import List, Dict, Any

logger = structlog.get_logger(__name__)

# Geospatial Engine URL inside docker-compose network
GEOSPATIAL_ENGINE_URL = "http://geospatial-engine:8001"

async def get_nearby_segments(lat: float, lng: float, radius_km: float = 3.0) -> List[Dict[str, Any]]:
    """
    Query the Geospatial Engine for clustering/nearby segments.
    """
    logger.info("Proxying geospatial query to geospatial-engine", lat=lat, lng=lng, radius=radius_km)
    
    payload = {
        "segment_ids": [],
        "epsilon_km": radius_km,
        "min_samples": 2
    }
    
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.post(f"{GEOSPATIAL_ENGINE_URL}/cluster/maintenance", json=payload)
            if resp.status_code == 200:
                clusters = resp.json().get("clusters", {})
                # Flatten cluster format to array of segments
                segments = []
                for cluster_name, details in clusters.items():
                    for idx, seg_id in enumerate(details.get("segments", [])):
                        segments.append({
                            "id": seg_id,
                            "cluster_name": cluster_name,
                            "centroid": details.get("centroid"),
                            "savings_pct": details.get("estimated_crew_savings_pct", 15)
                        })
                return segments
            else:
                logger.error("Geospatial engine returned error status", status=resp.status_code, body=resp.text)
                return []
    except Exception as e:
        logger.error("Failed to query Geospatial Engine service", error=str(e))
        return []
