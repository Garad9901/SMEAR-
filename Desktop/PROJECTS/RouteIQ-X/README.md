# 🛣️ RouteIQ X — Autonomous Infrastructure Intelligence Platform

> **Cloud-native, software-only AI platform for smart cities, municipal corporations, and highway authorities**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue)](https://www.docker.com/)
[![Kubernetes](https://img.shields.io/badge/Kubernetes-Native-326CE5)](https://kubernetes.io/)
[![MLflow](https://img.shields.io/badge/MLflow-Integrated-0194E2)](https://mlflow.org/)

---

## 🚀 Overview

**RouteIQ X** is a production-grade autonomous infrastructure intelligence operating system that:

- 🛰️ **Analyzes satellite imagery** (Sentinel-2) to detect road surface degradation
- 🤖 **Deploys 8 specialized AI agents** for GIS analysis, climate risk, maintenance planning, and budget optimization
- 📊 **Predicts road failure** 60–90 days in advance using LSTM, Prophet, and Temporal Fusion Transformers
- 💰 **Optimizes repair budgets** using Linear Programming, Genetic Algorithms, and Reinforcement Learning
- 🗺️ **Processes millions of road segments** using PostGIS, OSMnx, and GeoPandas at city/national scale

**Zero hardware dependency** — runs entirely on public APIs, satellite data, and municipal datasets.

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      RouteIQ X Platform                         │
│                                                                 │
│  ┌──────────┐  ┌──────────────┐  ┌────────────────────────┐   │
│  │ Frontend  │  │ API Gateway  │  │   Microservices Layer  │   │
│  │ React+TS  │→ │ Kong/NGINX   │→ │  FastAPI  │  Celery    │   │
│  │ Tailwind  │  │ OAuth2+JWT   │  │  Kafka    │  Redis     │   │
│  │ Leaflet   │  │ RBAC+Tenants │  │  Airflow  │  PostGIS   │   │
│  └──────────┘  └──────────────┘  └────────────────────────┘   │
│                                                                 │
│  ┌──────────────────────┐  ┌─────────────────────────────┐    │
│  │    AI / ML Engine    │  │  Infrastructure & MLOps      │    │
│  │  YOLOv8 + EfficientNet│  │  Terraform + Helm + ArgoCD  │    │
│  │  XGBoost + LightGBM  │  │  MLflow + Kubeflow + Feast   │    │
│  │  LSTM + TFT + Prophet│  │  Prometheus + Grafana        │    │
│  │  LangGraph Agents    │  │  OpenTelemetry + Jaeger      │    │
│  └──────────────────────┘  └─────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📂 Repository Structure

```
RouteIQ-X/
├── apps/
│   └── web/                    # React + TypeScript + Vite frontend
├── services/
│   ├── api-gateway/            # FastAPI + Kong API gateway
│   ├── ingestion/              # Kafka consumers + Airflow ETL
│   ├── geospatial/             # PostGIS + OSMnx + GeoPandas engine
│   ├── ai-engine/              # YOLOv8 + XGBoost + LSTM models
│   ├── agents/                 # LangGraph AI agent orchestration
│   ├── optimizer/              # LP + GA budget optimization
│   └── notification/           # Alert routing service
├── infra/
│   ├── terraform/              # AWS EKS / GKE / AKS IaC
│   ├── k8s/                    # Helm charts + ArgoCD
│   └── observability/          # Prometheus + Grafana + Loki
├── mlops/
│   ├── pipelines/              # Kubeflow Pipeline definitions
│   ├── features/               # Feast Feature Store
│   └── experiments/            # MLflow tracking
├── docker-compose.yml          # Local development orchestration
└── docs/                       # Architecture diagrams & API docs
```

---

## 🚀 Quick Start

### Prerequisites
- Docker 24+ & Docker Compose v2
- Node.js 20+ & npm 10+
- Python 3.11+

### 1. Clone & Configure

```bash
git clone https://github.com/your-org/routeiq-x.git
cd RouteIQ-X
cp .env.example .env
# Edit .env with your API keys
```

### 2. Start All Services

```bash
docker-compose up -d
```

### 3. Start Frontend

```bash
cd apps/web
npm install
npm run dev
```

### 4. Access Platform

| Service | URL |
|---------|-----|
| Frontend Dashboard | http://localhost:5173 |
| API Gateway | http://localhost:8000 |
| MLflow UI | http://localhost:5000 |
| Airflow UI | http://localhost:8080 |
| Grafana | http://localhost:3000 |
| Flower (Celery) | http://localhost:5555 |

---

## 🔑 Data Sources

| Source | Type | Purpose |
|--------|------|---------|
| Sentinel-2 (ESA) | Satellite imagery | Road surface analysis |
| OpenStreetMap | Road network | Graph topology |
| OpenWeatherMap | Climate API | Environmental risk |
| Open311 | Complaint API | Citizen feedback |
| Google Maps / TomTom | Traffic API | Congestion data |
| Municipal CSV uploads | Historical records | Maintenance history |

---

## 🛡️ Security & Compliance

- OAuth2 + JWT authentication
- Multi-tenant data isolation (Row-Level Security in PostGIS)
- Zero-trust network architecture
- RBAC with 5 permission levels
- Full audit logging to ELK Stack
- GDPR & government data compliance ready

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

*Built for smart cities worldwide. Powered by satellite intelligence, autonomous AI agents, and cloud-native distributed systems.*
