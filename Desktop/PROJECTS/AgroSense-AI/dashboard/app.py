"""
AgroSense AI — Spatial Crop-Climate Intelligence Dashboard
==========================================================
Premium, high-fidelity Streamlit UI utilizing:
- Injected glassmorphic dark-mode CSS aesthetics.
- Google Fonts & HSL-tailored climate color schemes.
- Folium choropleth GIS district map.
- Interactive Plotly rainfall and SHAP charts.
- Twilio SMS Alert dispatch & subscription upgrade simulators.
"""

import datetime
import json
import os
import random
import requests
import streamlit as st
import pandas as pd
import numpy as np
import plotly.graph_objects as go
import plotly.express as px
from streamlit_folium import folium_static
import folium

# ─────────────────────────────────────────────────────────────────────────────
# PAGE CONFIGURATION & VISUAL THEMING
# ─────────────────────────────────────────────────────────────────────────────
st.set_page_config(
    page_title="AgroSense AI — Vidarbha Command Center",
    page_icon="🌾",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom Injected Premium Styling (Glassmorphism, Sleek Dark Mode, Typography)
st.markdown("""
<style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
    
    /* Core backgrounds and typography */
    html, body, [class*="css"] {
        font-family: 'Inter', sans-serif;
        color: #e2e8f0;
    }
    .stApp {
        background: linear-gradient(135deg, #090d16 0%, #032010 100%);
        background-attachment: fixed;
    }
    
    /* Header styling */
    h1, h2, h3, h4, h5, h6 {
        font-family: 'Inter', sans-serif;
        font-weight: 600 !important;
        letter-spacing: -0.025em;
        background: linear-gradient(90deg, #10b981 0%, #3b82f6 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
    }
    
    /* Sidebar styling */
    section[data-testid="stSidebar"] {
        background-color: rgba(9, 15, 28, 0.85) !important;
        backdrop-filter: blur(10px);
        border-right: 1px solid rgba(16, 185, 129, 0.2);
    }
    
    /* Premium Glassmorphic Cards */
    div.glass-card {
        background: rgba(30, 41, 59, 0.45);
        backdrop-filter: blur(12px);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 16px;
        padding: 24px;
        margin-bottom: 20px;
        box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.3);
        transition: transform 0.2s ease, border-color 0.2s ease;
    }
    div.glass-card:hover {
        transform: translateY(-2px);
        border-color: rgba(16, 185, 129, 0.35);
    }
    
    /* Button custom aesthetics */
    .stButton>button {
        background: linear-gradient(90deg, #059669 0%, #1d4ed8 100%) !important;
        color: white !important;
        border: none !important;
        border-radius: 8px !important;
        padding: 10px 24px !important;
        font-weight: 600 !important;
        transition: all 0.3s ease !important;
        box-shadow: 0 4px 15px rgba(16, 185, 129, 0.25) !important;
    }
    .stButton>button:hover {
        transform: scale(1.02) !important;
        box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4) !important;
    }
    
    /* Input widgets */
    .stTextInput>div>div>input, .stSelectbox>div>div>div {
        background-color: rgba(15, 23, 42, 0.6) !important;
        border: 1px solid rgba(255, 255, 255, 0.15) !important;
        border-radius: 8px !important;
        color: white !important;
    }
    
    /* Metric cards customization */
    [data-testid="stMetricValue"] {
        font-size: 28px !important;
        font-weight: 700 !important;
        color: #10b981 !important;
    }
    
    /* Custom Badge/Tag */
    .premium-badge {
        background: linear-gradient(45deg, #f59e0b, #d97706);
        color: #0f172a;
        font-weight: 700;
        padding: 4px 10px;
        border-radius: 20px;
        font-size: 11px;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        display: inline-block;
    }
</style>
""", unsafe_allow_html=True)

# ─────────────────────────────────────────────────────────────────────────────
# CONFIG & STATE MANAGEMENT
# ─────────────────────────────────────────────────────────────────────────────
API_BASE_URL = os.getenv("API_BASE_URL", "http://localhost:8000")

# Setup default session states
if "auth_token" not in st.session_state:
    st.session_state.auth_token = None
if "user_email" not in st.session_state:
    st.session_state.user_email = "guest@example.com"
if "user_tier" not in st.session_state:
    st.session_state.user_tier = "agribusiness"  # Default premium access for demonstration
if "selected_district" not in st.session_state:
    st.session_state.selected_district = "Nagpur"

DISTRICTS = [
    "Nagpur", "Amravati", "Wardha", "Yavatmal", "Akola",
    "Buldhana", "Washim", "Chandrapur", "Gadchiroli", "Gondia", "Bhandara"
]

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

# Helper to fetch with token
def api_request(method, endpoint, json_data=None, params=None):
    headers = {}
    if st.session_state.auth_token:
        headers["Authorization"] = f"Bearer {st.session_state.auth_token}"
    
    url = f"{API_BASE_URL}{endpoint}"
    try:
        if method == "GET":
            return requests.get(url, headers=headers, params=params, timeout=5)
        elif method == "POST":
            return requests.post(url, headers=headers, json=json_data, timeout=5)
    except Exception:
        return None

# ─────────────────────────────────────────────────────────────────────────────
# SIDEBAR CONTROL PANEL & USER AUTH
# ─────────────────────────────────────────────────────────────────────────────
with st.sidebar:
    st.markdown("""
    <div style='text-align: center; margin-bottom: 25px;'>
        <h2 style='margin: 0; color: #10b981; font-size: 26px;'>🌾 AgroSense AI</h2>
        <p style='color: #94a3b8; font-size: 12px; margin-top: 5px;'>Vidarbha Crop-Climate Command Center</p>
    </div>
    """, unsafe_allow_html=True)
    
    st.markdown("<hr style='border: 1px solid rgba(255,255,255,0.08); margin: 15px 0;'>", unsafe_allow_html=True)
    
    # Selected Tier Showcase
    tier_colors = {
        "free": "background: rgba(148, 163, 184, 0.2); color: #94a3b8;",
        "farmer": "background: rgba(16, 185, 129, 0.2); color: #10b981;",
        "agribusiness": "background: rgba(59, 130, 246, 0.2); color: #3b82f6;",
        "insurance": "background: rgba(168, 85, 247, 0.2); color: #a855f7;",
        "government": "background: rgba(245, 158, 11, 0.2); color: #f59e0b;"
    }
    color_style = tier_colors.get(st.session_state.user_tier, "background: rgba(255,255,255,0.1);")
    st.markdown(f"""
    <div style='border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 15px; margin-bottom: 20px; background: rgba(15,23,42,0.4);'>
        <p style='margin: 0; font-size: 11px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em;'>Active Session Profile</p>
        <h4 style='margin: 5px 0 0 0; color: white; font-size: 16px;'>{st.session_state.user_email}</h4>
        <span style='margin-top: 8px; display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: 10px; font-weight: 700; text-transform: uppercase; {color_style}'>
            Tier: {st.session_state.user_tier}
        </span>
    </div>
    """, unsafe_allow_html=True)
    
    st.markdown("### 🗺️ Target Focus")
    st.session_state.selected_district = st.selectbox(
        "Select Vidarbha District:",
        DISTRICTS,
        index=DISTRICTS.index(st.session_state.selected_district)
    )
    
    st.markdown("<hr style='border: 1px solid rgba(255,255,255,0.08); margin: 20px 0;'>", unsafe_allow_html=True)
    
    # Mock Quick Login buttons for testing
    st.markdown("### 🔑 Quick Profile Switcher")
    c1, c2 = st.columns(2)
    with c1:
        if st.button("🚜 Farmer Mode", key="sw_farmer"):
            st.session_state.user_tier = "farmer"
            st.session_state.user_email = "farmer@example.com"
            st.rerun()
        if st.button("🏢 B2B Corp", key="sw_agri"):
            st.session_state.user_tier = "agribusiness"
            st.session_state.user_email = "agribusiness@example.com"
            st.rerun()
    with c2:
        if st.button("🛡️ Insurance", key="sw_ins"):
            st.session_state.user_tier = "insurance"
            st.session_state.user_email = "insurance@example.com"
            st.rerun()
        if st.button("🏛️ Government", key="sw_gov"):
            st.session_state.user_tier = "government"
            st.session_state.user_email = "government@example.com"
            st.rerun()

# ─────────────────────────────────────────────────────────────────────────────
# CORE DASHBOARD INTERFACE
# ─────────────────────────────────────────────────────────────────────────────
st.markdown(f"""
<div style='margin-bottom: 25px;'>
    <h1 style='margin: 0; font-size: 38px;'>🌾 AgroSense AI Command Center</h1>
    <p style='color: #94a3b8; font-size: 16px; margin: 5px 0 0 0;'>
        Production-Ready Crop-Climate Intelligence Platform for Vidarbha, Maharashtra
    </p>
</div>
""", unsafe_allow_html=True)

# Main Navigation Tabs
tab_gis, tab_rainfall, tab_crop, tab_alerts, tab_subscriptions = st.tabs([
    "🌍 Spatial Risk GIS Center",
    "🌦️ Rainfall Forecasting",
    "🌾 Crop Yield & Suitability",
    "🚨 Twilio Alert Simulator",
    "💳 Subscriptions & Upgrades"
])

# ─────────────────────────────────────────────────────────────────────────────
# TAB 1: SPATIAL RISK GIS CENTER
# ─────────────────────────────────────────────────────────────────────────────
with tab_gis:
    st.markdown("<div class='glass-card'>", unsafe_allow_html=True)
    st.subheader("🌍 Vidarbha Multi-Hazard Risk Monitor")
    st.write("Dynamic choropleth visualization of composite drought + GNN-flood spatial risk levels.")
    
    # 1. Fetch Composite Risk Indices from API or fallback
    res = api_request("GET", "/api/v1/risk/index")
    if res and res.status_code == 200:
        risk_data = res.json()
    else:
        # Mock high-fidelity risk metrics fallback if backend is not actively running
        dist_scores = []
        criticals, highs = 0, 0
        for d in DISTRICTS:
            comp = random.uniform(10, 85)
            lvl = "low"
            if comp > 75:
                lvl = "critical"
                criticals += 1
            elif comp > 55:
                lvl = "high"
                highs += 1
            elif comp > 30:
                lvl = "medium"
            dist_scores.append({
                "district_name": d,
                "composite_score": comp,
                "risk_level": lvl,
                "drought_score": comp * 0.9,
                "flood_probability": comp / 100.0 * 0.85
            })
        risk_data = {
            "critical_count": criticals,
            "high_count": highs,
            "districts": dist_scores
        }
    
    # Top Overview Metrics
    m1, m2, m3, m4 = st.columns(4)
    with m1:
        st.metric("Districts Monitored", "11", help="Nagpur, Amravati, Akola, Wardha, Yavatmal, etc.")
    with m2:
        st.metric("Critical Hazards Active", f"{risk_data['critical_count']}", delta="Drought Severity Peak" if risk_data['critical_count'] > 0 else None, delta_color="inverse")
    with m3:
        st.metric("High Alert Regions", f"{risk_data['high_count']}")
    with m4:
        st.metric("Region Status", "Stable" if risk_data['critical_count'] == 0 else "Hazard Warning Active", delta="Monsoon deficit present" if risk_data['critical_count'] > 0 else None)
        
    # Map & District Inspector columns
    col_map, col_inspector = st.columns([2, 1])
    
    with col_map:
        st.markdown("#### Choropleth GIS Map")
        
        # Center coordinates for Vidarbha
        m = folium.Map(location=[20.6, 78.5], zoom_start=7, tiles="cartodbpositron")
        
        # Pull GeoJSON dynamic boundaries from API or fallback
        res_geojson = api_request("GET", "/api/v1/risk/geojson")
        if res_geojson and res_geojson.status_code == 200:
            geojson_data = res_geojson.json()
        else:
            # High quality synthetic circular district polygon features
            features = []
            for d in DISTRICTS:
                coords = DISTRICTS.index(d)
                lat = 21.14 if d=="Nagpur" else 20.93 if d=="Amravati" else 20.74 if d=="Wardha" else 20.38 if d=="Yavatmal" else 20.71 if d=="Akola" else 20.52 if d=="Buldhana" else 20.10 if d=="Washim" else 19.96 if d=="Chandrapur" else 20.18 if d=="Gadchiroli" else 21.46 if d=="Gondia" else 21.16
                lng = 79.08 if d=="Nagpur" else 77.75 if d=="Amravati" else 78.60 if d=="Wardha" else 78.12 if d=="Yavatmal" else 77.00 if d=="Akola" else 76.18 if d=="Buldhana" else 77.13 if d=="Washim" else 79.29 if d=="Chandrapur" else 80.00 if d=="Gadchiroli" else 80.19 if d=="Gondia" else 79.65
                
                # Fetch corresponding score
                matched = next((x for x in risk_data["districts"] if x["district_name"] == d), None)
                score = matched["composite_score"] if matched else 20.0
                
                features.append({
                    "type": "Feature",
                    "id": d,
                    "geometry": {
                        "type": "Polygon",
                        "coordinates": [[
                            [lng-0.2, lat-0.2], [lng+0.2, lat-0.2],
                            [lng+0.2, lat+0.2], [lng-0.2, lat+0.2],
                            [lng-0.2, lat-0.2]
                        ]]
                    },
                    "properties": {
                        "name": d,
                        "composite_risk_score": score
                    }
                })
            geojson_data = {"type": "FeatureCollection", "features": features}

        # Render Choropleth using Folium
        folium.Choropleth(
            geo_data=geojson_data,
            name="choropleth",
            data=pd.DataFrame(risk_data["districts"]),
            columns=["district_name", "composite_score"],
            key_on="feature.id",
            fill_color="YlOrRd",
            fill_opacity=0.7,
            line_opacity=0.4,
            legend_name="Composite Risk Index (Drought + Flood)",
            smooth_factor=0
        ).add_to(m)
        
        # Add interactive marker tags
        for feat in geojson_data["features"]:
            d_name = feat["properties"]["name"]
            score = feat["properties"]["composite_risk_score"]
            lat = feat["geometry"]["coordinates"][0][0][1] + 0.1
            lng = feat["geometry"]["coordinates"][0][0][0] + 0.1
            
            folium.Marker(
                location=[lat, lng],
                popup=f"<b>{d_name}</b><br>Risk Score: {score:.1f}",
                icon=folium.Icon(color="red" if score > 70 else "orange" if score > 50 else "blue")
            ).add_to(m)

        folium_static(m, width=780, height=450)
        
    with col_inspector:
        st.markdown(f"#### 🔍 Inspector: {st.session_state.selected_district}")
        
        # Fetch detailed metrics for selected district
        district_risk = next((x for x in risk_data["districts"] if x["district_name"] == st.session_state.selected_district), None)
        
        if district_risk:
            st.markdown(f"""
            <div style='background: rgba(15,23,42,0.5); padding: 18px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.08);'>
                <h4 style='margin:0; color:#3b82f6;'>Hazard Index Card</h4>
                <hr style='border:1px solid rgba(255,255,255,0.05); margin:10px 0;'>
                <p><b>Composite Score:</b> {district_risk['composite_score']:.1f} / 100</p>
                <p><b>Risk Category:</b> <span style='font-weight:700; color:#ef4444;'>{district_risk['risk_level'].upper()}</span></p>
                <p><b>Drought Score:</b> {district_risk['drought_score']:.1f} / 100</p>
                <p><b>Flood GNN Prob:</b> {district_risk['flood_probability'] * 100:.1f}%</p>
            </div>
            """, unsafe_allow_html=True)
            
            # GNN Spatial propagation list
            st.markdown("##### Upstream Neighbor Channels")
            neighbors = ADJACENCY.get(st.session_state.selected_district, [])
            for n in neighbors:
                n_risk = next((x for x in risk_data["districts"] if x["district_name"] == n), {"composite_score": 10.0})
                st.markdown(f"**{n}:** Risk Score {n_risk['composite_score']:.1f} (Upstream Diffuser)")
        else:
            st.warning("Select a district to view insights.")
            
    st.markdown("</div>", unsafe_allow_html=True)

# ─────────────────────────────────────────────────────────────────────────────
# TAB 2: RAINFALL FORECASTING
# ─────────────────────────────────────────────────────────────────────────────
with tab_rainfall:
    st.markdown("<div class='glass-card'>", unsafe_allow_html=True)
    st.subheader("🌦️ District Rainfall Forecasting Engine (Module 1)")
    st.write("Short-term daily predictions (LSTM + XGBoost ensemble) and long-term SARIMA + Temporal Transformer seasonal outlooks.")
    
    dist_name = st.session_state.selected_district
    
    c_short, c_long = st.columns(2)
    
    with c_short:
        st.markdown("#### 📅 7-Day Forecasting Timeline")
        
        # Fetch daily forecast
        res_fc = api_request("POST", "/api/v1/rainfall/forecast", json_data={
            "district_name": dist_name,
            "horizon_days": 7,
            "model": "ensemble",
            "include_uncertainty": True
        })
        
        if res_fc and res_fc.status_code == 200:
            fc_data = res_fc.json()
            days = [d["date"] for d in fc_data["daily_forecasts"]]
            preds = [d["predicted_rainfall_mm"] for d in fc_data["daily_forecasts"]]
            lows = [d["lower_bound_mm"] for d in fc_data["daily_forecasts"]]
            uppers = [d["upper_bound_mm"] for d in fc_data["daily_forecasts"]]
        else:
            # Fallback dynamic mock predictions
            today = datetime.date.today()
            days = [str(today + datetime.timedelta(days=i)) for i in range(7)]
            preds = [round(np.random.exponential(scale=6.0), 2) for _ in range(7)]
            lows = [round(p * 0.7, 2) for p in preds]
            uppers = [round(p * 1.3, 2) for p in preds]
            fc_data = {"total_predicted_mm": sum(preds), "alert_triggered": max(preds) > 40}

        # Plotly graph for 7-day forecast with confidence intervals
        fig_7d = go.Figure()
        
        # Lower bound
        fig_7d.add_trace(go.Scatter(
            x=days, y=lows,
            line=dict(width=0),
            showlegend=False,
            hoverinfo='skip'
        ))
        # Upper bound (fill to lower)
        fig_7d.add_trace(go.Scatter(
            x=days, y=uppers,
            fill='tonexty',
            fillcolor='rgba(59, 130, 246, 0.15)',
            line=dict(width=0),
            name="95% Bayesian Confidence Band",
            hoverinfo='skip'
        ))
        # Point prediction
        fig_7d.add_trace(go.Scatter(
            x=days, y=preds,
            line=dict(color='#3b82f6', width=3),
            mode='lines+markers',
            name="Point Forecast (LSTM+XGBoost)"
        ))
        
        fig_7d.update_layout(
            title="7-Day Rainfall Forecast (mm) with Uncertainty bounds",
            paper_bgcolor='rgba(0,0,0,0)',
            plot_bgcolor='rgba(0,0,0,0)',
            font_color='#e2e8f0',
            xaxis=dict(gridcolor='rgba(255,255,255,0.05)'),
            yaxis=dict(gridcolor='rgba(255,255,255,0.05)')
        )
        st.plotly_chart(fig_7d, use_container_width=True)
        st.write(f"**Cumulative 7-day forecast:** {fc_data['total_predicted_mm']:.1f} mm")
        if fc_data.get("alert_triggered"):
            st.error("⚠️ Heavy rainfall warning active in forecasting window.")
            
    with c_long:
        st.markdown("#### 🌾 Long-Term Seasonal Outlook")
        
        season = st.selectbox("Select Target Season:", ["kharif", "rabi"])
        
        res_seas = api_request("POST", "/api/v1/rainfall/forecast/seasonal", json_data={
            "district_name": dist_name,
            "season": season,
            "year": 2026
        })
        
        if res_seas and res_seas.status_code == 200:
            seas_data = res_seas.json()
        else:
            # Fallback mock seasonal forecasts
            hist_avg = 1100 if season == "kharif" else 90.0
            dev = random.uniform(-18.0, 18.0)
            pred = hist_avg * (1 + dev / 100.0)
            months = ["June", "July", "August", "September"] if season == "kharif" else ["October", "November", "December", "January"]
            seas_data = {
                "predicted_total_mm": pred,
                "historical_avg_mm": hist_avg,
                "deviation_pct": dev,
                "forecast_category": "normal" if abs(dev) < 10 else "below_normal" if dev < -10 else "above_normal",
                "monthly_breakdown": [
                    {"month": m, "predicted_mm": pred / 4.0, "deviation_pct": dev}
                    for m in months
                ]
            }

        # Plotly Monthly breakdown bar chart
        m_names = [m["month"] for m in seas_data["monthly_breakdown"]]
        m_preds = [m["predicted_mm"] for m in seas_data["monthly_breakdown"]]
        
        fig_seas = px.bar(
            x=m_names, y=m_preds,
            labels={'x': 'Month', 'y': 'Rainfall (mm)'},
            color_discrete_sequence=['#10b981']
        )
        fig_seas.update_layout(
            title=f"Monthly Projected Breakdown ({season.capitalize()} 2026)",
            paper_bgcolor='rgba(0,0,0,0)',
            plot_bgcolor='rgba(0,0,0,0)',
            font_color='#e2e8f0',
            xaxis=dict(gridcolor='rgba(255,255,255,0.05)'),
            yaxis=dict(gridcolor='rgba(255,255,255,0.05)')
        )
        st.plotly_chart(fig_seas, use_container_width=True)
        
        # Display seasonal stats
        st.markdown(f"""
        <div style='background: rgba(15,23,42,0.4); padding: 15px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.08);'>
            <p style='margin:0;'><b>Predicted Seasonal Total:</b> {seas_data['predicted_total_mm']:.1f} mm</p>
            <p style='margin:5px 0 0 0;'><b>Historical Baseline:</b> {seas_data['historical_avg_mm']:.1f} mm</p>
            <p style='margin:5px 0 0 0;'><b>Deviation from Normal:</b> <span style='color:#ef4444;'>{seas_data['deviation_pct']:.1f}%</span></p>
            <p style='margin:5px 0 0 0;'><b>Classification:</b> <span style='font-weight:700;'>{seas_data['forecast_category'].upper().replace("_", " ")}</span></p>
        </div>
        """, unsafe_allow_html=True)
        
    st.markdown("</div>", unsafe_allow_html=True)

# ─────────────────────────────────────────────────────────────────────────────
# TAB 3: CROP YIELD & SUITABILITY
# ─────────────────────────────────────────────────────────────────────────────
with tab_crop:
    st.markdown("<div class='glass-card'>", unsafe_allow_html=True)
    st.subheader("🌾 Agronomic Crop Intelligence (Module 2)")
    st.write("Predict expected yields (CatBoost+RF) and identify top-3 optimal crops (LightGBM) using localized soil profiles.")
    
    dist_name = st.session_state.selected_district
    
    col_inputs, col_outputs = st.columns([1, 2])
    
    with col_inputs:
        st.markdown("#### 🧪 Soil Profile Inputs")
        
        crop_sel = st.selectbox("Target Crop Name:", ["Cotton", "Soybean", "Tur (Arhar)", "Paddy", "Wheat"])
        season_sel = st.selectbox("Select Season:", ["kharif", "rabi"])
        
        soil_type = st.selectbox("Soil General Class:", ["black_cotton", "red", "alluvial", "laterite"])
        ph = st.slider("Soil pH:", min_value=4.0, max_value=9.0, value=6.8, step=0.1)
        nitro = st.number_input("Nitrogen (N) kg/ha:", min_value=10.0, max_value=500.0, value=180.0)
        phos = st.number_input("Phosphorus (P) kg/ha:", min_value=5.0, max_value=200.0, value=28.0)
        potas = st.number_input("Potassium (K) kg/ha:", min_value=50.0, max_value=800.0, value=340.0)
        moisture = st.slider("Soil Moisture (%):", min_value=0.0, max_value=100.0, value=30.0)
        
        rain_inp = st.number_input("Expected Season Rainfall (mm):", value=780.0)
        temp_inp = st.slider("Average Season Temp (°C):", min_value=15.0, max_value=45.0, value=28.5)
        
        trigger_pred = st.button("🚀 Execute Agronomic Engine")

    with col_outputs:
        if trigger_pred:
            st.markdown("#### 📊 Model Inference Outcomes")
            
            # 1. Trigger yield prediction API
            res_yield = api_request("POST", "/api/v1/crop/yield", json_data={
                "district_name": dist_name,
                "crop_name": crop_sel,
                "season": season_sel,
                "year": 2026,
                "area_ha": 10.0,
                "soil": {
                    "soil_type": soil_type,
                    "soil_ph": ph,
                    "nitrogen_kg_per_ha": nitro,
                    "phosphorus_kg_per_ha": phos,
                    "potassium_kg_per_ha": potas,
                    "soil_moisture_pct": moisture
                },
                "season_rainfall_mm": rain_inp,
                "avg_temperature_c": temp_inp,
                "model": "ensemble"
            })
            
            # 2. Trigger recommendations API
            res_rec = api_request("POST", "/api/v1/crop/recommend", json_data={
                "district_name": dist_name,
                "season": season_sel,
                "soil": {
                    "soil_type": soil_type,
                    "soil_ph": ph,
                    "nitrogen_kg_per_ha": nitro,
                    "phosphorus_kg_per_ha": phos,
                    "potassium_kg_per_ha": potas,
                    "soil_moisture_pct": moisture
                },
                "season_rainfall_mm": rain_inp,
                "avg_temperature_c": temp_inp
            })

            # Format Response Data
            if res_yield and res_yield.status_code == 200:
                y_data = res_yield.json()
            else:
                # Fallback mock yield responses
                y_data = {
                    "predicted_yield_kg_per_ha": 1650.0,
                    "predicted_total_production_tonnes": 16.5,
                    "advisory": f"Soybean expected yield is stable. Maintain standard NPK schedules.",
                    "shap_top_features": [
                        {"feature_name": "nitrogen_kg_per_ha", "shap_value": 82.4, "feature_value": nitro},
                        {"feature_name": "season_rainfall_mm", "shap_value": 45.1, "feature_value": rain_inp},
                        {"feature_name": "avg_temperature_c", "shap_value": -31.0, "feature_value": temp_inp},
                        {"feature_name": "soil_ph", "shap_value": -12.4, "feature_value": ph}
                    ]
                }
                
            if res_rec and res_rec.status_code == 200:
                r_data = res_rec.json()
            else:
                # Fallback mock crop recommendations
                r_data = {
                    "recommendations": [
                        {"crop_name": "Soybean", "confidence_pct": 82.5, "expected_yield_kg_per_ha": 1650.0},
                        {"crop_name": "Cotton", "confidence_pct": 68.2, "expected_yield_kg_per_ha": 650.0},
                        {"crop_name": "Tur (Arhar)", "confidence_pct": 45.0, "expected_yield_kg_per_ha": 950.0}
                    ],
                    "advisory_text": f"LightGBM highly recommends cultivating Soybean or Cotton for {dist_name} in {season_sel}."
                }

            # Render Yield Metric Cards
            cy1, cy2 = st.columns(2)
            with cy1:
                st.metric("Predicted Yield (kg/ha)", f"{y_data['predicted_yield_kg_per_ha']:.1f}")
            with cy2:
                st.metric("Production (10 Hectares)", f"{y_data['predicted_total_production_tonnes']:.1f} Tonnes")
                
            st.info(f"💡 **Agronomic Advisory:** {y_data['advisory']}")
            
            # Draw Suitability Recommendations
            st.markdown("##### Multiclass Crop Suitability Standings")
            for i, r in enumerate(r_data["recommendations"]):
                c_name = r["crop_name"]
                conf = r["confidence_pct"]
                st.markdown(f"**Rank {i+1}: {c_name}** ({conf:.1f}% Match)")
                st.progress(conf / 100.0)

            # Draw Plotly SHAP Explanation Chart
            st.markdown("##### SHAP Local Feature Explanations")
            sh_features = [item["feature_name"] for item in y_data["shap_top_features"]]
            sh_vals = [item["shap_value"] for item in y_data["shap_top_features"]]
            
            # Map colors based on positive / negative pushes
            sh_colors = ['#10b981' if v > 0 else '#ef4444' for v in sh_vals]
            
            fig_shap = go.Figure(go.Bar(
                x=sh_vals,
                y=sh_features,
                orientation='h',
                marker_color=sh_colors
            ))
            fig_shap.update_layout(
                title="How inputs influenced yield forecast (SHAP values)",
                paper_bgcolor='rgba(0,0,0,0)',
                plot_bgcolor='rgba(0,0,0,0)',
                font_color='#e2e8f0',
                xaxis=dict(gridcolor='rgba(255,255,255,0.05)', title="SHAP Push Direction"),
                yaxis=dict(gridcolor='rgba(255,255,255,0.05)')
            )
            st.plotly_chart(fig_shap, use_container_width=True)
            
        else:
            st.info("👈 Enter soil details and click 'Execute Agronomic Engine' to compute forecasts.")
            
    st.markdown("</div>", unsafe_allow_html=True)

# ─────────────────────────────────────────────────────────────────────────────
# TAB 4: ALERT CENTER & TWILIO SMS SIMULATOR
# ─────────────────────────────────────────────────────────────────────────────
with tab_alerts:
    st.markdown("<div class='glass-card'>", unsafe_allow_html=True)
    st.subheader("🚨 Real-Time Warning Center & SMS Alert Dispatcher (Module 4)")
    st.write("Fires SMS alerts using Twilio APIs and push notifications via Firebase topics to connected farmers.")
    
    c_logs, c_sim = st.columns(2)
    
    with c_logs:
        st.markdown("#### 📋 Platform Warnings Log")
        
        # Pull logs from DB or default
        res_logs = api_request("GET", "/api/v1/alerts/history", params={"page": 1, "page_size": 5})
        if res_logs and res_logs.status_code == 200:
            logs = res_logs.json()["alerts"]
        else:
            # Fallback mock alert logs
            logs = [
                {"district_name": "Nagpur", "alert_type": "heavy_rain", "severity": "critical", "message": "⚠️ Heavy rain forecast of 115mm in Nagpur. Move livestock away from low valleys.", "triggered_at": "2026-05-29T20:15:00"},
                {"district_name": "Yavatmal", "alert_type": "drought", "severity": "warning", "message": "⚠️ Dry spell warning: 22 consecutive dry days. Prioritize micro-sprinklers.", "triggered_at": "2026-05-29T18:40:00"},
                {"district_name": "Bhandara", "alert_type": "flood", "severity": "critical", "message": "⚠️ River channels overflowing. Evacuate downstream boundaries immediately.", "triggered_at": "2026-05-29T14:30:00"}
            ]
            
        for log in logs:
            col_sev = "#ef4444" if log["severity"] == "critical" else "#f59e0b"
            st.markdown(f"""
            <div style='background: rgba(15,23,42,0.4); padding: 12px; border-radius: 8px; margin-bottom: 10px; border-left: 5px solid {col_sev};'>
                <p style='margin:0; font-size:12px; color:#94a3b8;'><b>District:</b> {log['district_name']} | <b>Type:</b> {log['alert_type'].upper()}</p>
                <p style='margin:4px 0 0 0; font-size:14px; font-weight:600;'>{log['message']}</p>
            </div>
            """, unsafe_allow_html=True)
            
    with c_sim:
        st.markdown("#### 📲 Twilio SMS Simulator")
        st.write("Test direct dispatch warning signals to farmers or regional administrators.")
        
        sim_phone = st.text_input("Enter Recipient Phone:", value="+919876543210")
        sim_dist = st.selectbox("Trigger District:", DISTRICTS, key="sim_dist")
        sim_type = st.selectbox("Select Danger Signal:", ["heavy_rain", "drought", "flood", "crop_advisory"])
        sim_sev = st.selectbox("Alert Severity Level:", ["info", "warning", "critical"])
        
        sim_msg = st.text_area("Alert Broadcast Message:", value="⚠️ EMERGENCY RISK WARNING: Extreme weather events expected in your village. Prioritize safety.")
        
        trigger_sms = st.button("⚡ Dispatch Twilio SMS broadcast")
        
        if trigger_sms:
            # Trigger SMS trigger API
            res_trigger = api_request("POST", "/api/v1/alerts/trigger", json_data={
                "district_id": DISTRICTS.index(sim_dist) + 1,
                "alert_type": sim_type,
                "severity": sim_sev,
                "title": f"AgroSense Alert — {sim_dist}",
                "message": sim_msg,
                "channel": "sms",
                "recipient_phones": [sim_phone]
            })
            
            if res_trigger and res_trigger.status_code == 200:
                tr_data = res_trigger.json()
                st.success(f"🎉 SMS successfully routed through Twilio! SMS SID: {tr_data.get('sms_status')}")
            else:
                st.info(f"🔗 Twilio simulator activated. Broadcast SMS compiled: '🌾 AgroSense AI Alert: {sim_msg}' dispatched to {sim_phone}.")

    st.markdown("</div>", unsafe_allow_html=True)

# ─────────────────────────────────────────────────────────────────────────────
# TAB 5: SUBSCRIPTIONS & UPGRADES
# ─────────────────────────────────────────────────────────────────────────────
with tab_subscriptions:
    st.markdown("<div class='glass-card'>", unsafe_allow_html=True)
    st.subheader("💳 AgroSense AI Subscriptions Tiers")
    st.write("Dynamic business model allowing farmers to access basic advisories, while unlocking custom risk maps, SHAP explanation charts, and GNN indices for enterprises.")
    
    # Plans comparison pricing cards
    pc1, pc2, pc3, pc4 = st.columns(4)
    
    with pc1:
        st.markdown("""
        <div style='background: rgba(15,23,42,0.6); padding: 20px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.08); text-align: center;'>
            <h4 style='color: #94a3b8; margin: 0;'>Farmer Basic</h4>
            <h2 style='color: white; margin: 15px 0;'>₹99 / mo</h2>
            <hr style='border: 1px solid rgba(255,255,255,0.05); margin: 10px 0;'>
            <p style='font-size: 13px; color: #cbd5e1;'>✔ 7-day rainfall forecasts</p>
            <p style='font-size: 13px; color: #cbd5e1;'>✔ Crop recommendations</p>
            <p style='font-size: 13px; color: #cbd5e1;'>✔ SMS disaster alerts</p>
            <p style='font-size: 11px; color: #94a3b8;'>B2C pricing tier</p>
        </div>
        """, unsafe_allow_html=True)
        if st.button("Select Farmer", key="pay_farmer"):
            st.session_state.user_tier = "farmer"
            st.success("Successfully upgraded to Farmer B2C tier!")
            st.rerun()
            
    with pc2:
        st.markdown("""
        <div style='background: rgba(30, 41, 59, 0.6); padding: 20px; border-radius: 12px; border: 1px solid #3b82f6; text-align: center;'>
            <div class='premium-badge'>BEST FOR BUSINESS</div>
            <h4 style='color: #3b82f6; margin: 10px 0 0 0;'>Agri-Business</h4>
            <h2 style='color: white; margin: 15px 0;'>₹5,000 / mo</h2>
            <hr style='border: 1px solid rgba(255,255,255,0.05); margin: 10px 0;'>
            <p style='font-size: 13px; color: #cbd5e1;'>✔ Full 11-district API access</p>
            <p style='font-size: 13px; color: #cbd5e1;'>✔ Yield prediction regressors</p>
            <p style='font-size: 13px; color: #cbd5e1;'>✔ Deep SHAP explanations</p>
            <p style='font-size: 11px; color: #94a3b8;'>Commercial B2B tier</p>
        </div>
        """, unsafe_allow_html=True)
        if st.button("Select Agribusiness", key="pay_agri"):
            st.session_state.user_tier = "agribusiness"
            st.success("Successfully upgraded to Agribusiness B2B tier!")
            st.rerun()

    with pc3:
        st.markdown("""
        <div style='background: rgba(15,23,42,0.6); padding: 20px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.08); text-align: center;'>
            <h4 style='color: #a855f7; margin: 0;'>Insurance Corp</h4>
            <h2 style='color: white; margin: 15px 0;'>Custom B2B</h2>
            <hr style='border: 1px solid rgba(255,255,255,0.05); margin: 10px 0;'>
            <p style='font-size: 13px; color: #cbd5e1;'>✔ Spatial drought risk logs</p>
            <p style='font-size: 13px; color: #cbd5e1;'>✔ Historical yield records</p>
            <p style='font-size: 13px; color: #cbd5e1;'>✔ Spatial GNN probabilities</p>
            <p style='font-size: 11px; color: #94a3b8;'>Risk analysis tier</p>
        </div>
        """, unsafe_allow_html=True)
        if st.button("Select Insurance", key="pay_ins"):
            st.session_state.user_tier = "insurance"
            st.success("Successfully upgraded to Insurance B2B tier!")
            st.rerun()

    with pc4:
        st.markdown("""
        <div style='background: rgba(15,23,42,0.6); padding: 20px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.08); text-align: center;'>
            <h4 style='color: #f59e0b; margin: 0;'>Government Agency</h4>
            <h2 style='color: white; margin: 15px 0;'>B2G Tender</h2>
            <hr style='border: 1px solid rgba(255,255,255,0.05); margin: 10px 0;'>
            <p style='font-size: 13px; color: #cbd5e1;'>✔ Regional disaster alert system</p>
            <p style='font-size: 13px; color: #cbd5e1;'>✔ Full PostGIS spatial map</p>
            <p style='font-size: 13px; color: #cbd5e1;'>✔ MLflow experiment registry</p>
            <p style='font-size: 11px; color: #94a3b8;'>Administrative B2G tier</p>
        </div>
        """, unsafe_allow_html=True)
        if st.button("Select Government", key="pay_gov"):
            st.session_state.user_tier = "government"
            st.success("Successfully upgraded to Government B2G tier!")
            st.rerun()
            
    st.markdown("</div>", unsafe_allow_html=True)

st.markdown("<hr style='border: 1px solid rgba(255,255,255,0.08); margin: 30px 0;'>", unsafe_allow_html=True)
st.markdown("<p style='text-align: center; color: #94a3b8; font-size: 12px;'>MIT License © 2026 AgroSense AI — Maharashtra Crop-Climate Intelligence Platform</p>", unsafe_allow_html=True)
