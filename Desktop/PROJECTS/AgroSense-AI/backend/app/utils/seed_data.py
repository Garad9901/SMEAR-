"""
AgroSense AI — Database Seeding Script
=======================================
Seeds 11 districts, test users for all tiers,
daily historical weather observations (2020-2026),
historical crop yields, and pre-computed risk indexes.
"""

import asyncio
import json
import random
import uuid
from datetime import date, datetime, timedelta, timezone

import numpy as np
from sqlalchemy import select, delete, insert, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import AsyncSessionLocal, engine, Base
from app.core.security import get_password_hash
from app.models.district import District
from app.models.user import User
from app.models.rainfall import RainfallObservation, RainfallForecast
from app.models.crop import CropYieldRecord, CropRecommendation
from app.models.risk import RiskIndex, AlertRecord

# ─────────────────────────────────────────────────────────────────────────────
# Static District Configuration
# ─────────────────────────────────────────────────────────────────────────────
DISTRICT_DEFS = {
    "Nagpur":     {"lat": 21.1458, "lng": 79.0882, "code": "NGP", "hq": "Nagpur", "climate": "Sub-tropical", "rain": 1100.0, "pop": 4653570, "agri_pct": 58.5},
    "Amravati":   {"lat": 20.9333, "lng": 77.7500, "code": "AMR", "hq": "Amravati", "climate": "Tropical Wet-Dry", "rain": 820.0, "pop": 2888445, "agri_pct": 65.2},
    "Wardha":     {"lat": 20.7453, "lng": 78.6022, "code": "WRD", "hq": "Wardha", "climate": "Tropical Wet-Dry", "rain": 880.0, "pop": 1300774, "agri_pct": 68.0},
    "Yavatmal":   {"lat": 20.3888, "lng": 78.1204, "code": "YTM", "hq": "Yavatmal", "climate": "Semi-arid", "rain": 900.0, "pop": 2772348, "agri_pct": 72.1},
    "Akola":      {"lat": 20.7100, "lng": 77.0000, "code": "AKL", "hq": "Akola", "climate": "Semi-arid", "rain": 760.0, "pop": 1813906, "agri_pct": 70.5},
    "Buldhana":   {"lat": 20.5292, "lng": 76.1847, "code": "BUL", "hq": "Buldhana", "climate": "Semi-arid", "rain": 720.0, "pop": 2586258, "agri_pct": 67.8},
    "Washim":     {"lat": 20.1059, "lng": 77.1339, "code": "WSH", "hq": "Washim", "climate": "Semi-arid", "rain": 780.0, "pop": 1197160, "agri_pct": 64.0},
    "Chandrapur": {"lat": 19.9615, "lng": 79.2961, "code": "CHD", "hq": "Chandrapur", "climate": "Sub-tropical", "rain": 1200.0, "pop": 2204307, "agri_pct": 52.4},
    "Gadchiroli": {"lat": 20.1809, "lng": 80.0060, "code": "GCH", "hq": "Gadchiroli", "climate": "Tropical Wet-Dry", "rain": 1500.0, "pop": 1072942, "agri_pct": 32.8},
    "Gondia":     {"lat": 21.4600, "lng": 80.1900, "code": "GND", "hq": "Gondia", "climate": "Tropical Wet-Dry", "rain": 1300.0, "pop": 1322507, "agri_pct": 45.6},
    "Bhandara":   {"lat": 21.1662, "lng": 79.6514, "code": "BHD", "hq": "Bhandara", "climate": "Tropical Wet-Dry", "rain": 1250.0, "pop": 1200334, "agri_pct": 59.0},
}

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

CROP_MAP = {
    "Nagpur":     ["Cotton", "Soybean", "Wheat", "Maize"],
    "Amravati":   ["Cotton", "Soybean", "Tur (Arhar)", "Jowar"],
    "Wardha":     ["Cotton", "Soybean", "Wheat", "Gram (Chana)"],
    "Yavatmal":   ["Cotton", "Soybean", "Tur (Arhar)"],
    "Akola":      ["Cotton", "Soybean", "Jowar", "Gram (Chana)"],
    "Buldhana":   ["Cotton", "Soybean", "Jowar"],
    "Washim":     ["Cotton", "Soybean", "Tur (Arhar)"],
    "Chandrapur": ["Paddy", "Jowar", "Cotton"],
    "Gadchiroli": ["Paddy", "Maize"],
    "Gondia":     ["Paddy", "Wheat", "Gram (Chana)"],
    "Bhandara":   ["Paddy", "Wheat"],
}

SOILS = ["black_cotton", "red", "alluvial", "laterite"]


async def seed():
    print("🌾 Starting AgroSense AI Database Seeder...")
    
    async with AsyncSessionLocal() as session:
        # 1. Clean existing tables
        print("🧹 Cleaning existing data...")
        await session.execute(delete(AlertRecord))
        await session.execute(delete(RiskIndex))
        await session.execute(delete(CropRecommendation))
        await session.execute(delete(CropYieldRecord))
        await session.execute(delete(RainfallForecast))
        await session.execute(delete(RainfallObservation))
        await session.execute(delete(User))
        await session.execute(delete(District))
        await session.commit()
        
        # 2. Seed Districts
        print("🗺️ Seeding districts...")
        district_instances = {}
        for name, info in DISTRICT_DEFS.items():
            lat, lng = info["lat"], info["lng"]
            # Construct a clean 4-point multipolygon around the coordinates to mock spatial geometries
            geom_wkt = f"MULTIPOLYGON((({lng-0.15} {lat-0.15}, {lng+0.15} {lat-0.15}, {lng+0.15} {lat+0.15}, {lng-0.15} {lat+0.15}, {lng-0.15} {lat-0.15})))"
            
            db_district = District(
                name=name,
                code=info["code"],
                headquarters=info["hq"],
                division="Vidarbha",
                state="Maharashtra",
                latitude=lat,
                longitude=lng,
                area_sq_km=float(random.randint(5000, 15000)),
                population=info["pop"],
                agricultural_land_pct=info["agri_pct"],
                primary_crops=",".join(CROP_MAP[name]),
                climate_zone=info["climate"],
                avg_annual_rainfall_mm=info["rain"],
                adjacent_district_ids=json.dumps(ADJACENCY[name]),
                geometry=func.ST_GeomFromText(geom_wkt, 4326)
            )
            session.add(db_district)
            district_instances[name] = db_district
        
        await session.flush()  # Populates IDs
        
        # 3. Seed Users for Tiers
        print("🔑 Seeding test user accounts...")
        hashed_password = get_password_hash("secure123")
        
        users_to_seed = [
            User(
                email="admin@agrosense.ai",
                full_name="AgroSense Admin",
                phone_number="+919876543210",
                hashed_password=hashed_password,
                role="admin",
                subscription_tier="government",
                subscription_active=True,
                preferred_district="Nagpur",
                is_superuser=True,
                is_verified=True,
            ),
            User(
                email="farmer@example.com",
                full_name="Ramesh Patil (Farmer)",
                phone_number="+919888877777",
                hashed_password=hashed_password,
                role="farmer",
                subscription_tier="farmer",
                subscription_active=True,
                preferred_district="Amravati",
                is_verified=True,
            ),
            User(
                email="agribusiness@example.com",
                full_name="Vidarbha Agro Ltd.",
                phone_number="+919666655555",
                hashed_password=hashed_password,
                role="agribusiness",
                subscription_tier="agribusiness",
                subscription_active=True,
                preferred_district="Yavatmal",
                is_verified=True,
            ),
            User(
                email="insurance@example.com",
                full_name="Maha Crop Insurance",
                phone_number="+919444433333",
                hashed_password=hashed_password,
                role="insurance",
                subscription_tier="insurance",
                subscription_active=True,
                preferred_district="Akola",
                is_verified=True,
            ),
            User(
                email="government@example.com",
                full_name="Maharashtra Agri Dept.",
                phone_number="+919222211111",
                hashed_password=hashed_password,
                role="government",
                subscription_tier="government",
                subscription_active=True,
                preferred_district="Chandrapur",
                is_verified=True,
            ),
            User(
                email="free@example.com",
                full_name="Sanjay Rao (Free User)",
                phone_number="+919111111111",
                hashed_password=hashed_password,
                role="farmer",
                subscription_tier="free",
                subscription_active=False,
                preferred_district="Wardha",
                is_verified=True,
            ),
        ]
        
        session.add_all(users_to_seed)
        await session.flush()

        # 4. Seed Weather Observations (2020 to 2026)
        print("🌦️ Generating daily climate database (2020-2026)...")
        start_date = date(2020, 1, 1)
        end_date = date(2026, 5, 28)
        delta_days = (end_date - start_date).days + 1
        
        # We will bulk insert observations using SQL core to be extremely fast!
        observations_data = []
        for name, district_model in district_instances.items():
            base_rain = DISTRICT_DEFS[name]["rain"]
            avg_daily_rain = base_rain / 120.0  # Approx spread across monsoon days
            
            for d_idx in range(delta_days):
                curr_date = start_date + timedelta(days=d_idx)
                month = curr_date.month
                day = curr_date.day
                year = curr_date.year
                day_of_year = curr_date.timetuple().tm_yday
                
                # Model realistic seasonal parameters
                # Monsoon: June to September
                is_monsoon = 6 <= month <= 9
                is_winter = month in [10, 11, 12, 1]
                is_summer = month in [2, 3, 4, 5]
                
                # Temperature
                if is_monsoon:
                    t_max = random.uniform(28, 34)
                    t_min = random.uniform(22, 25)
                    humidity = random.uniform(70, 95)
                    wind = random.uniform(8, 20)
                    # 40% chance of rain on any day in monsoon
                    rainfall = random.choices(
                        [0.0, random.exponential(scale=avg_daily_rain * 1.5)], 
                        weights=[0.60, 0.40]
                    )[0]
                elif is_winter:
                    t_max = random.uniform(25, 30)
                    t_min = random.uniform(12, 17)
                    humidity = random.uniform(40, 65)
                    wind = random.uniform(5, 12)
                    # Occasional light winter rain
                    rainfall = random.choices(
                        [0.0, random.uniform(0.5, 5.0)],
                        weights=[0.97, 0.03]
                    )[0]
                else:  # summer
                    t_max = random.uniform(36, 46)  # Vidarbha summers are notoriously hot!
                    t_min = random.uniform(24, 30)
                    humidity = random.uniform(15, 35)
                    wind = random.uniform(10, 22)
                    # Rarely rains in summer
                    rainfall = random.choices(
                        [0.0, random.uniform(1.0, 10.0)],
                        weights=[0.99, 0.01]
                    )[0]
                
                t_avg = (t_max + t_min) / 2.0
                
                # Derived features
                lag_1 = random.uniform(0.0, 10.0) if is_monsoon else 0.0
                lag_7 = random.uniform(0.0, 10.0) if is_monsoon else 0.0
                roll_7 = random.uniform(1.0, 15.0) if is_monsoon else 0.0
                roll_14 = random.uniform(2.0, 20.0) if is_monsoon else 0.0
                roll_std = random.uniform(0.5, 5.0) if is_monsoon else 0.0
                
                # IMD category
                if rainfall == 0.0:
                    rain_cat = "no_rain"
                elif rainfall < 2.5:
                    rain_cat = "light"
                elif rainfall < 15.6:
                    rain_cat = "moderate"
                elif rainfall < 64.5:
                    rain_cat = "heavy"
                elif rainfall < 115.6:
                    rain_cat = "very_heavy"
                else:
                    rain_cat = "extreme"
                
                obs_dict = {
                    "district_id": district_model.id,
                    "observation_date": curr_date,
                    "year": year,
                    "month": month,
                    "day": day,
                    "day_of_year": day_of_year,
                    "rainfall_mm": round(rainfall, 2),
                    "temperature_max_c": round(t_max, 1),
                    "temperature_min_c": round(t_min, 1),
                    "temperature_avg_c": round(t_avg, 1),
                    "humidity_pct": round(humidity, 1),
                    "wind_speed_kmh": round(wind, 1),
                    "pressure_hpa": round(random.uniform(995, 1015), 1),
                    "solar_radiation": round(random.uniform(12, 25), 2),
                    "evapotranspiration": round(random.uniform(2, 8), 2),
                    "lag_1_rainfall": round(lag_1, 2),
                    "lag_7_rainfall": round(lag_7, 2),
                    "rolling_mean_7d": round(roll_7, 2),
                    "rolling_mean_14d": round(roll_14, 2),
                    "rolling_std_7d": round(roll_std, 2),
                    "month_sin": round(np.sin(2 * np.pi * month / 12), 4),
                    "month_cos": round(np.cos(2 * np.pi * month / 12), 4),
                    "rain_category": rain_cat,
                    "data_source": "IMD",
                    "quality_flag": "good",
                    "created_at": datetime.now(timezone.utc)
                }
                observations_data.append(obs_dict)
                
        # Bulk insert in chunks of 5000 to prevent memory blowup and db timeouts
        print(f"📊 Seeding {len(observations_data)} daily climate records...")
        chunk_size = 5000
        for i in range(0, len(observations_data), chunk_size):
            chunk = observations_data[i : i + chunk_size]
            await session.execute(insert(RainfallObservation), chunk)
            await session.commit()
            print(f"   ↳ Seeded {min(i + chunk_size, len(observations_data))} / {len(observations_data)}")

        # 5. Seed Crop Yield Records (2020-2025)
        print("🌾 Seeding crop yield history (2020-2025)...")
        yields_data = []
        for name, district_model in district_instances.items():
            primary_crops = CROP_MAP[name]
            
            for crop in primary_crops:
                # Decide crop season
                if crop in ["Cotton", "Soybean", "Tur (Arhar)", "Jowar", "Paddy", "Maize"]:
                    seasons = ["kharif"]
                elif crop in ["Wheat", "Gram (Chana)"]:
                    seasons = ["rabi"]
                else:
                    seasons = ["zaid"]
                
                for yr in range(2020, 2026):
                    for season in seasons:
                        # Yield in kg/ha
                        if crop == "Cotton":
                            base_yield = random.uniform(400, 700)  # rainfed yields in Vidarbha are low
                        elif crop == "Soybean":
                            base_yield = random.uniform(1000, 1600)
                        elif crop == "Tur (Arhar)":
                            base_yield = random.uniform(800, 1200)
                        elif crop == "Paddy":
                            base_yield = random.uniform(1800, 2600)
                        elif crop == "Wheat":
                            base_yield = random.uniform(1500, 2400)
                        elif crop == "Gram (Chana)":
                            base_yield = random.uniform(900, 1400)
                        else:
                            base_yield = random.uniform(1000, 1800)
                        
                        # Add weather dependency
                        climate_factor = random.uniform(0.85, 1.15)
                        actual_yield = round(base_yield * climate_factor, 1)
                        area = random.uniform(10000, 80000)
                        prod = round((actual_yield * area) / 1000.0, 1)
                        
                        soil_type = random.choice(SOILS)
                        
                        yields_data.append({
                            "district_id": district_model.id,
                            "crop_name": crop,
                            "crop_variety": "BT Hybrid" if crop == "Cotton" else "Improved",
                            "season": season,
                            "year": yr,
                            "actual_yield_kg_per_ha": actual_yield,
                            "area_ha": round(area, 1),
                            "production_tonnes": prod,
                            "soil_type": soil_type,
                            "soil_ph": round(random.uniform(6.2, 7.8), 2),
                            "soil_nitrogen": round(random.uniform(120, 280), 1),
                            "soil_phosphorus": round(random.uniform(15, 45), 1),
                            "soil_potassium": round(random.uniform(220, 480), 1),
                            "soil_moisture_pct": round(random.uniform(15.0, 45.0), 2),
                            "season_rainfall_mm": round(random.uniform(400, 1200) if season == "kharif" else random.uniform(30, 150), 1),
                            "avg_temperature_c": round(random.uniform(25.0, 31.0), 1),
                            "predicted_yield_kg_per_ha": round(actual_yield * random.uniform(0.95, 1.05), 1),
                            "prediction_model": "rf_catboost_ensemble",
                            "prediction_confidence": round(random.uniform(85, 96), 2),
                            "shap_values_json": json.dumps([
                                {"feature": "season_rainfall_mm", "val": random.uniform(-50, 80)},
                                {"feature": "soil_nitrogen", "val": random.uniform(-30, 60)},
                                {"feature": "avg_temperature_c", "val": random.uniform(-40, 20)}
                            ]),
                            "data_source": "state_agriculture_dept",
                            "created_at": datetime.now(timezone.utc)
                        })
                        
        session.add_all([CropYieldRecord(**yd) for yd in yields_data])
        await session.commit()

        # 6. Seed Risk Indexes (Recent History)
        print("⚠️ Seeding drought & flood risk indexes...")
        risk_data = []
        today = date.today()
        for name, district_model in district_instances.items():
            # Seed risks for the last 5 days
            for offset in range(5):
                idx_date = today - timedelta(days=offset)
                
                # Drought score (higher is dry)
                d_score = random.uniform(10, 85)
                if d_score < 30:
                    d_cat = "normal"
                elif d_score < 50:
                    d_cat = "mild"
                elif d_score < 70:
                    d_cat = "moderate"
                else:
                    d_cat = "severe"
                    
                # Flood probability
                f_prob = random.uniform(0.01, 0.88)
                if f_prob < 0.2:
                    f_cat = "low"
                elif f_prob < 0.5:
                    f_cat = "moderate"
                elif f_prob < 0.75:
                    f_cat = "high"
                else:
                    f_cat = "very_high"
                
                # Composite risk
                comp_score = (d_score + (f_prob * 100)) / 2.0
                if comp_score < 30:
                    risk_lvl = "low"
                elif comp_score < 55:
                    risk_lvl = "medium"
                elif comp_score < 75:
                    risk_lvl = "high"
                else:
                    risk_lvl = "critical"
                    
                risk_data.append(RiskIndex(
                    district_id=district_model.id,
                    index_date=idx_date,
                    drought_score=round(d_score, 1),
                    drought_category=d_cat,
                    spi_30d=round(random.uniform(-2.0, 1.5), 2),
                    spi_90d=round(random.uniform(-2.2, 1.2), 2),
                    anomaly_score=round(random.uniform(0.1, 0.9), 2),
                    autoencoder_loss=round(random.uniform(0.001, 0.05), 4),
                    flood_probability=round(f_prob, 2),
                    flood_category=f_cat,
                    gnn_node_risk=round(f_prob * random.uniform(0.9, 1.1), 2),
                    upstream_risk_propagated=round(f_prob * random.uniform(0.5, 0.9), 2),
                    composite_risk_score=round(comp_score, 1),
                    risk_level=risk_lvl,
                    model_version="1.0.0",
                    weights_json=json.dumps({"drought": 0.5, "flood": 0.5})
                ))
        
        session.add_all(risk_data)
        await session.commit()
        
        print("🎉 Database seeding complete! Successfully seeded:")
        print(f"   - {len(district_instances)} Vidarbha Districts")
        print(f"   - {len(users_to_seed)} User Profiles")
        print(f"   - {len(observations_data)} Daily Climate Records")
        print(f"   - {len(yields_data)} Historical Yield Records")
        print(f"   - {len(risk_data)} Regional Risk Indices")


if __name__ == "__main__":
    asyncio.run(seed())
