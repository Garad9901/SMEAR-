# 🌾 AgroSense AI

> **Intelligent Crop & Climate Risk Platform for Vidarbha, Maharashtra**
> District-level rainfall forecasting, crop yield prediction, drought/flood risk indexing, and real-time farmer alerts — powered by XGBoost, LSTM, Transformer, GNN, and Bayesian Deep Learning.

[![Python](https://img.shields.io/badge/Python-3.11+-blue)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.111-green)](https://fastapi.tiangolo.com)
[![License](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)
[![Docker](https://img.shields.io/badge/Docker-Compose-blue)](docker-compose.yml)

---

## 🗺️ Coverage

**11 Vidarbha Districts:** Nagpur · Amravati · Wardha · Yavatmal · Akola · Buldhana · Washim · Chandrapur · Gadchiroli · Gondia · Bhandara

**Data:** 44 years (1980–2024) daily weather records from IMD + NASA POWER API

---

## 🏗️ Architecture

```
[IMD / NASA POWER / OpenCity APIs]
        ↓
[Airflow ETL Pipelines]
        ↓
[Feature Engineering: Pandas + NumPy]
        ↓
[ML Layer: XGBoost | LSTM | Transformer | GNN | SARIMA | Bayesian DL]
        ↓
[MLflow Model Registry]
        ↓
[FastAPI Backend (JWT + Razorpay)]
        ↓
[Streamlit Dashboard] + [Twilio SMS + Firebase Push Alerts]
```

---

## 🚀 Quick Start

### Prerequisites
- Docker Desktop ≥ 24
- Python 3.11+
- PostgreSQL 15 with PostGIS extension

### 1. Clone & Configure
```bash
git clone https://github.com/yourorg/agrosense-ai.git
cd agrosense-ai
cp .env.example .env
# Edit .env with your API keys and DB credentials
```

### 2. Start Full Stack
```bash
make dev
# OR
docker-compose up --build
```

### 3. Access Services
| Service | URL |
|---------|-----|
| FastAPI Docs | http://localhost:8000/docs |
| Streamlit Dashboard | http://localhost:8501 |
| MLflow UI | http://localhost:5000 |
| Airflow UI | http://localhost:8080 |
| pgAdmin | http://localhost:5050 |

---

## 📦 Modules

### Module 1 — Rainfall Forecasting Engine
- **Short-term (7-day):** XGBoost + LSTM ensemble
- **Long-term (seasonal):** SARIMA + Transformer
- **Uncertainty:** Bayesian Deep Learning (MC Dropout)
- **Endpoint:** `POST /api/v1/rainfall/forecast`

### Module 2 — Crop Yield Prediction
- **Yield regression:** Random Forest + CatBoost
- **Soil+weather fusion:** Multi-input Keras Neural Network
- **Crop recommendation:** LightGBM multiclass
- **Explainability:** SHAP per-district
- **Endpoint:** `POST /api/v1/crop/yield` · `POST /api/v1/crop/recommend`

### Module 3 — Drought & Flood Risk Index
- **Drought severity:** Isolation Forest + Autoencoder anomaly detection
- **Flood probability:** GNN on district adjacency graph (PyTorch Geometric)
- **Composite risk:** Weighted ensemble index (0–100 scale)
- **Spatial output:** Folium choropleth + GeoJSON
- **Endpoint:** `GET /api/v1/risk/index/{district_id}`

### Module 4 — Real-Time Alert System
- **Triggers:** Model threshold-based alerts
- **Channels:** Twilio SMS + Firebase Cloud Messaging
- **Endpoint:** `POST /api/v1/alerts/trigger`

---

## 🔑 API Authentication

All endpoints require JWT Bearer token:
```bash
# Register
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "farmer@example.com", "password": "secure123", "full_name": "Ramesh Patil"}'

# Login
curl -X POST http://localhost:8000/api/v1/auth/login \
  -d 'username=farmer@example.com&password=secure123'

# Use token
curl -X GET http://localhost:8000/api/v1/districts/ \
  -H "Authorization: Bearer <your_token>"
```

---

## 💰 Subscription Tiers

| Tier | Price | Features |
|------|-------|---------|
| Farmer (B2C) | ₹99/month | 7-day forecast + crop advisory |
| Agri-Business | ₹5,000/month | API access + all district data |
| Insurance | Custom | Risk index per district (batch) |
| Government | B2G tender | Full platform + disaster alerts |

---

## 🧪 Running Tests
```bash
make test
# OR
pytest tests/ -v --cov=app --cov-report=html
```

---

## 🔬 Research Papers

1. *"AgroSense: A Multi-Model Deep Learning Framework for District-Level Crop-Climate Risk Prediction in Vidarbha"* — Target: IEEE Access / Computers & Electronics in Agriculture
2. *"Graph Neural Networks for Spatial Rainfall Diffusion Modeling in Maharashtra"* — Target: Journal of Hydrology

---

## 📁 Project Structure
```
AgroSense-AI/
├── backend/          # FastAPI REST API
├── ml/               # ML/DL model modules
├── etl/              # Airflow ETL pipelines
├── dashboard/        # Streamlit MVP dashboard
├── infra/            # Docker, Nginx, PostgreSQL, AWS
└── tests/            # pytest test suite
```

---

## 🤝 Contributing
See [CONTRIBUTING.md](CONTRIBUTING.md). PRs welcome for new district data, model improvements, and UI features.

---

## 📄 License
MIT License © 2024 AgroSense AI Team
