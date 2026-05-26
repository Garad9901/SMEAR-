# 🛣️ RouteIQ X — Autonomous Infrastructure Intelligence Platform

> **Cloud-native, software-only autonomous smart city operating system that predicts road degradation, prioritizes maintenance operations, optimizes repair budgets, and orchestrates workflows using distributed AI agents and geospatial telemetry.**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue)](https://www.docker.com/)
[![Kubernetes](https://img.shields.io/badge/Kubernetes-Native-326CE5)](https://kubernetes.io/)
[![MLflow](https://img.shields.io/badge/MLflow-Integrated-0194E2)](https://mlflow.org/)
[![Vite](https://img.shields.io/badge/Vite-Build%20Passing-success)](https://vitejs.dev/)

---

## 🚀 Executive Summary

**RouteIQ X** is an enterprise-grade, cloud-native Software-as-a-Service (SaaS) infrastructure intelligence platform designed for municipal corporations, public works departments, and highway authorities globally. 

Unlike traditional platforms, **RouteIQ X operates 100% through software-based intelligence and public APIs** — requiring zero physical IoT sensors, camera hardware, or manual patrol fleets. It acts as a comprehensive diagnostic engine that scans satellite bands, parses citizen logs, runs multi-agent reasoning, solves resource allocations, and exports audit logs natively.

---

## ✨ Cutting-Edge Key Features

### 🖥️ High-Fidelity UI/UX & Intelligent Control Center
*   **Digital Twin Simulator (`/app/simulator`):** Dynamic multi-variable stress-testing engine simulating monsoons, budget cuts, and freight overloading. Volumetric stress is mapped through structural pavement aggregate layers in real-time.
*   **City Comparison Rankings (`/app/comparison`):** Ranks municipal health performance metrics side-by-side using raced horizontal bar graphs and capital expenditure vs. RHI (Road Health Index) correlation scatter plots.
*   **AI Command Center (`/app/command-center`):** Live streaming terminal logging LangGraph orchestrations, inter-agent state communications, and offering human-in-the-loop approvals for high-value allocations.
*   **Global Context-Aware AI Chatbot:** Persistent, floatable chat bubble driven by simulated multi-agent thought streams, serving visual diagnostic cards and quick action suggestion tags.

### 🧑‍💼 Grounded "Human Element" & Manual Overrides
*   **Municipal Team Handover Notes:** Dynamic, interactive sticky note post-it board on the dashboard, letting supervisors leave shift notes, coordinate repair dispatches, and log manual override activities.
*   **Supervisor RHI Override:** Inspector-centric controls directly on the Road Map panel. Overwrite AI-predicted degradation scores instantly with manual physical inspection data. Updates map layers, legend indexes, and database states in real-time.
*   **Direct PDF Report Compiler:** Custom client-side stream compilation that generates and downloads high-fidelity, formal PDF reports containing diagnostic tables and digital auditor signatures on-the-fly.

---

## 🏗️ System Architecture

```
                               ┌────────────────────────────────────────────────────────┐
                               │                    User Browser / CLI                  │
                               └────────────────────────────────────────────────────────┘
                                                           │
                                                           ▼ (Amplify / Vercel Edge)
                               ┌────────────────────────────────────────────────────────┐
                               │               RouteIQ X React Frontend                 │
                               │        TailwindCSS + Leaflet Maps + Recharts           │
                               └────────────────────────────────────────────────────────┘
                                                           │
                                                           ▼ (JWT + OpenTelemetry)
                               ┌────────────────────────────────────────────────────────┐
                               │                  API Gateway (FastAPI)                 │
                               │        Rate-Limiting · Prometheus · Kong Proxy         │
                               └────────────────────────────────────────────────────────┘
                                     │                     │                       │
           ┌─────────────────────────┘                     │                       └─────────────────────────┐
           ▼ (gRPC / Celery)                               ▼ (gRPC / Celery)                                 ▼ (gRPC / Celery)
┌──────────────────────────────────────┐        ┌──────────────────────────────────────┐        ┌──────────────────────────────────────┐
│        LangGraph Orchestrator        │        │          Geospatial Engine           │        │        Linear LP Optimizer           │
│  8 Autonomous Agents (Pinecone)      │        │  OSMnx Graphing · PostGIS · Rasterio │        │  HiGHS LP · GA Solver · DP Knapsack  │
└──────────────────────────────────────┘        └──────────────────────────────────────┘        └──────────────────────────────────────┘
           │                                               │                                               │
           └─────────────────────────┐                     │                       ┌───────────────────────┘
                                     ▼                     ▼                       ▼
                               ┌────────────────────────────────────────────────────────┐
                               │                   Data Storage Layer                   │
                               │  RDS PostGIS (Spatial) · Redis (Cache) · S3 (Rasters)  │
                               └────────────────────────────────────────────────────────┘
```

---

## 📂 Repository Structure

```
RouteIQ-X/
├── apps/
│   └── web/                    # React + TypeScript + Vite + TailwindCSS frontend
├── services/
│   ├── api-gateway/            # FastAPI Kong Gateway with JWT and Prometheus
│   ├── ingestion/              # Apache Airflow DAGs + MSK Kafka telemetry ingest
│   ├── geospatial/             # OSMnx city network graphing and DBSCAN clustering
│   ├── ai-engine/              # XGBoost RHI model, TFT forecasting, and YOLOv8 satellite scans
│   ├── agents/                 # LangGraph StateGraph orchestration service
│   ├── optimizer/              # LP, GA, Knapsack, and RL allocation solvers
│   └── notification/           # Alertmanager webhook and notification dispatchers
├── infra/
│   ├── terraform/              # AWS EKS VPC, RDS PostGIS, MSK Kafka, and ElastiCache IaC
│   ├── k8s/                    # Production Helm values and GitOps ArgoCD application sets
│   └── db/                     # PostGIS Multi-tenant RLS schema & seed records
├── mlops/
│   ├── pipelines/              # Kubeflow training pipeline (Validate -> Train -> Drift -> Promote)
│   └── features/               # Feast feature store configurations
└── docker-compose.yml          # Full multi-container local execution stack
```

---

## 🚀 Quick Start (Local Development)

### Prerequisites
*   **Docker & Docker Compose v2+**
*   **Node.js 20+ & npm 10+**
*   **Python 3.11+**

### 1. Configure Local Environment
```bash
git clone https://github.com/Garad9901/SMEAR-.git
cd RouteIQ-X
cp .env.example .env
```

### 2. Launch Local Database & Core Services
Spin up Postgres with PostGIS, ElastiCache Redis, and local mock instances:
```bash
docker-compose up -d
```

### 3. Initialize Spatial Schema & Database Seeds
Connect to your database container and apply the initialization seeds:
```bash
docker exec -i routeiq-db psql -U postgres -d routeiq < infra/db/init.sql
```

### 4. Boot Frontend Dev Server
Install npm dependencies and trigger Vite hot-reloading:
```bash
cd apps/web
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🔑 Data Ingestion & Integration

| Integrations | Ingestion Protocol | Purpose |
| :--- | :--- | :--- |
| **Sentinel-2 (ESA)** | Rasterio API / STAC | Multi-spectral band road cracking scanning |
| **OpenStreetMap** | Overpass API / OSMnx | Street graph modeling and centrality audits |
| **OpenWeatherMap** | Airflow ETL Scheduler | Daily environmental freeze-thaw & rainfall indices |
| **Open311** | Kafka Consumer | Real-time citizen complaint ticket streaming |
| **TomTom Traffic** | HTTP REST | Dynamic hourly vehicular shear index load features |

---

## 🛡️ Security, Governance, & RLS

*   **Row-Level Security (RLS):** Implemented directly inside RDS PostgreSQL to ensure multi-tenant municipality boundaries.
*   **Explainable AI (XAI):** Core ML models evaluate inferences using **SHAP values**, tracking feature contributions (Road Age, Traffic, Precipitation) on every diagnostic score.
*   **Blockchain Integrity:** Audited agent operations log cryptographically verified hash receipts on the transaction ledger.

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for details.

---

*Built for highly resilient, sustainable, and data-driven smart cities. Powered by satellite intelligence, multi-agent AI, and cloud-native systems.*
