"""
AgroSense AI — Districts Endpoints
=====================================
Metadata and spatial data for the 11 Vidarbha districts.
"""

from typing import List

import structlog
from fastapi import APIRouter, HTTPException, Path
from sqlalchemy import select

from app.api.v1.deps import DBSession
from app.core.config import settings
from app.models.district import District

logger = structlog.get_logger(__name__)
router = APIRouter()

# ─── Static district data (used when DB not seeded yet) ──────────────────────
DISTRICT_DATA = {
    "Nagpur":     {"lat": 21.1458, "lng": 79.0882, "code": "NGP", "hq": "Nagpur"},
    "Amravati":   {"lat": 20.9333, "lng": 77.7500, "code": "AMR", "hq": "Amravati"},
    "Wardha":     {"lat": 20.7453, "lng": 78.6022, "code": "WRD", "hq": "Wardha"},
    "Yavatmal":   {"lat": 20.3888, "lng": 78.1204, "code": "YTM", "hq": "Yavatmal"},
    "Akola":      {"lat": 20.7100, "lng": 77.0000, "code": "AKL", "hq": "Akola"},
    "Buldhana":   {"lat": 20.5292, "lng": 76.1847, "code": "BUL", "hq": "Buldhana"},
    "Washim":     {"lat": 20.1059, "lng": 77.1339, "code": "WSH", "hq": "Washim"},
    "Chandrapur": {"lat": 19.9615, "lng": 79.2961, "code": "CHD", "hq": "Chandrapur"},
    "Gadchiroli": {"lat": 20.1809, "lng": 80.0060, "code": "GCH", "hq": "Gadchiroli"},
    "Gondia":     {"lat": 21.4600, "lng": 80.1900, "code": "GND", "hq": "Gondia"},
    "Bhandara":   {"lat": 21.1662, "lng": 79.6514, "code": "BHD", "hq": "Bhandara"},
}

# GNN adjacency graph for Vidarbha (spatial neighbors)
ADJACENCY = {
    "Nagpur":     ["Wardha", "Bhandara", "Chandrapur", "Gondia"],
    "Amravati":   ["Wardha", "Akola", "Yavatmal", "Washim", "Buldhana"],
    "Wardha":     ["Nagpur", "Amravati", "Yavatmal", "Chandrapur"],
    "Yavatmal":   ["Wardha", "Amravati", "Washim", "Chandrapur"],
    "Akola":      ["Amravati", "Buldhana", "Washim"],
    "Buldhana":   ["Akola", "Amravati", "Washim"],
    "Washim":     ["Akola", "Buldhana", "Amravati", "Yavatmal"],
    "Chandrapur": ["Wardha", "Yavatmal", "Nagpur", "Gadchiroli"],
    "Gadchiroli": ["Chandrapur", "Gondia"],
    "Gondia":     ["Bhandara", "Nagpur", "Gadchiroli"],
    "Bhandara":   ["Nagpur", "Gondia"],
}


@router.get(
    "/",
    summary="List all 11 Vidarbha districts",
)
async def list_districts():
    """Return metadata for all 11 Vidarbha districts."""
    districts = []
    for name, info in DISTRICT_DATA.items():
        districts.append({
            "name": name,
            "code": info["code"],
            "headquarters": info["hq"],
            "latitude": info["lat"],
            "longitude": info["lng"],
            "division": "Vidarbha",
            "state": "Maharashtra",
            "adjacent_districts": ADJACENCY.get(name, []),
        })
    return {"total": len(districts), "districts": districts}


@router.get(
    "/{district_name}",
    summary="Get metadata for a specific district",
)
async def get_district(
    district_name: str = Path(..., description="District name"),
):
    """Return metadata for a single Vidarbha district."""
    if district_name not in DISTRICT_DATA:
        raise HTTPException(status_code=404, detail=f"District '{district_name}' not found.")
    info = DISTRICT_DATA[district_name]
    return {
        "name": district_name,
        "code": info["code"],
        "headquarters": info["hq"],
        "latitude": info["lat"],
        "longitude": info["lng"],
        "division": "Vidarbha",
        "state": "Maharashtra",
        "adjacent_districts": ADJACENCY.get(district_name, []),
        "primary_crops": _get_primary_crops(district_name),
    }


@router.get(
    "/adjacency/graph",
    summary="Get district adjacency graph for GNN",
    description="Returns edge list for the district adjacency graph used in flood GNN.",
)
async def get_adjacency_graph():
    """GNN adjacency edge list for all 11 districts."""
    edges = []
    for src, neighbors in ADJACENCY.items():
        for dst in neighbors:
            if {"source": dst, "target": src} not in edges:
                edges.append({"source": src, "target": dst})
    return {
        "nodes": list(DISTRICT_DATA.keys()),
        "edges": edges,
        "edge_count": len(edges),
    }


def _get_primary_crops(district: str) -> List[str]:
    """Return primary crops for a district."""
    crop_map = {
        "Nagpur":     ["Orange", "Cotton", "Soybean", "Wheat"],
        "Amravati":   ["Cotton", "Soybean", "Tur", "Jowar"],
        "Wardha":     ["Cotton", "Soybean", "Wheat", "Gram"],
        "Yavatmal":   ["Cotton", "Soybean", "Tur"],
        "Akola":      ["Cotton", "Soybean", "Jowar", "Gram"],
        "Buldhana":   ["Cotton", "Soybean", "Jowar"],
        "Washim":     ["Cotton", "Soybean", "Tur"],
        "Chandrapur": ["Paddy", "Jowar", "Cotton", "Teak"],
        "Gadchiroli": ["Paddy", "Teak", "Bamboo"],
        "Gondia":     ["Paddy", "Wheat", "Gram"],
        "Bhandara":   ["Paddy", "Wheat"],
    }
    return crop_map.get(district, [])
