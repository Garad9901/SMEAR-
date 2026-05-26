-- ──────────────────────────────────────────────────────────────────
-- RouteIQ X — PostGIS Database Schema
-- Extensions, schemas, and core tables for spatial intelligence
-- ──────────────────────────────────────────────────────────────────

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS postgis_topology;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- ── Multi-Tenant Schema ────────────────────────────────────────────
CREATE SCHEMA IF NOT EXISTS routeiq;
SET search_path TO routeiq, public;

-- ── Tenants ───────────────────────────────────────────────────────
CREATE TABLE tenants (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug            VARCHAR(64) UNIQUE NOT NULL,
    name            VARCHAR(256) NOT NULL,
    country         VARCHAR(64),
    tier            VARCHAR(16) CHECK (tier IN ('free', 'standard', 'enterprise')) DEFAULT 'standard',
    quota_roads     INTEGER DEFAULT 100000,
    quota_api_hour  INTEGER DEFAULT 10000,
    is_active       BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW(),
    metadata        JSONB DEFAULT '{}'::JSONB
);

-- ── Road Segments (core table with PostGIS geometry) ──────────────
CREATE TABLE road_segments (
    id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    external_id             VARCHAR(64),
    tenant_id               UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    osm_way_id              BIGINT,
    name                    VARCHAR(512),
    city                    VARCHAR(128) NOT NULL,
    country                 VARCHAR(64),
    
    -- Geometry (SRID 4326 = WGS84 GPS coordinates)
    geometry                GEOMETRY(LineString, 4326) NOT NULL,
    bbox                    GEOMETRY(Polygon, 4326),
    length_m                FLOAT,
    
    -- Road attributes
    highway_type            VARCHAR(32),
    surface_type            VARCHAR(32),
    lanes                   SMALLINT DEFAULT 2,
    speed_limit_kmh         SMALLINT,
    direction               VARCHAR(16) CHECK (direction IN ('both', 'forward', 'backward')),
    age_years               SMALLINT,
    
    -- Health metrics
    rhi_score               FLOAT CHECK (rhi_score BETWEEN 0 AND 100),
    risk_level              VARCHAR(16) CHECK (risk_level IN ('critical', 'high', 'medium', 'low')),
    priority_score          INTEGER,
    ai_confidence           FLOAT CHECK (ai_confidence BETWEEN 0 AND 1),
    
    -- Predictions
    predicted_failure_date  DATE,
    failure_probability_90d FLOAT CHECK (failure_probability_90d BETWEEN 0 AND 1),
    rhi_forecast_30d        FLOAT,
    rhi_forecast_60d        FLOAT,
    rhi_forecast_90d        FLOAT,
    
    -- Traffic & usage
    traffic_load_score      FLOAT CHECK (traffic_load_score BETWEEN 0 AND 1),
    annual_traffic_volume   INTEGER,
    
    -- Costs
    repair_cost_estimate    NUMERIC(15, 2),
    last_repair_cost        NUMERIC(15, 2),
    
    -- Climate features
    rainfall_mm_annual      FLOAT,
    freeze_thaw_cycles      SMALLINT DEFAULT 0,
    temperature_avg_c       FLOAT,
    
    -- Complaints
    complaint_count_30d     INTEGER DEFAULT 0,
    complaint_count_90d     INTEGER DEFAULT 0,
    complaint_cluster_score FLOAT,
    
    -- Maintenance history
    last_inspected_at       DATE,
    last_maintained_at      DATE,
    maintenance_count       SMALLINT DEFAULT 0,
    
    -- Data provenance
    data_sources            JSONB DEFAULT '[]'::JSONB,
    satellite_imagery_date  DATE,
    osm_version             INTEGER,
    
    -- Timestamps
    created_at              TIMESTAMPTZ DEFAULT NOW(),
    updated_at              TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE (tenant_id, external_id)
);

-- ── Spatial Indexes ────────────────────────────────────────────────
CREATE INDEX idx_road_segments_geometry    ON road_segments USING GIST (geometry);
CREATE INDEX idx_road_segments_bbox        ON road_segments USING GIST (bbox);
CREATE INDEX idx_road_segments_tenant      ON road_segments (tenant_id);
CREATE INDEX idx_road_segments_city        ON road_segments (city);
CREATE INDEX idx_road_segments_rhi         ON road_segments (rhi_score);
CREATE INDEX idx_road_segments_risk        ON road_segments (risk_level);
CREATE INDEX idx_road_segments_priority    ON road_segments (priority_score DESC);
CREATE INDEX idx_road_segments_failure     ON road_segments (predicted_failure_date);
CREATE INDEX idx_road_segments_updated     ON road_segments (updated_at DESC);

-- ── Row-Level Security (Multi-Tenant Isolation) ────────────────────
ALTER TABLE road_segments ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation ON road_segments
    USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

-- ── Maintenance Tasks ─────────────────────────────────────────────
CREATE TABLE maintenance_tasks (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id           UUID NOT NULL REFERENCES tenants(id),
    segment_id          UUID NOT NULL REFERENCES road_segments(id),
    
    task_type           VARCHAR(32) CHECK (task_type IN (
                            'crack-sealing', 'pothole-repair', 'resurfacing',
                            'patching', 'full-reconstruction', 'inspection')),
    priority            VARCHAR(16) CHECK (priority IN ('critical', 'high', 'medium', 'low')),
    status              VARCHAR(32) CHECK (status IN (
                            'pending-approval', 'scheduled', 'in-progress',
                            'completed', 'cancelled', 'deferred')),
    
    -- Schedule
    scheduled_date      DATE,
    estimated_days      SMALLINT,
    actual_start_date   DATE,
    actual_end_date     DATE,
    
    -- Cost
    estimated_cost      NUMERIC(15, 2),
    actual_cost         NUMERIC(15, 2),
    cost_savings        NUMERIC(15, 2),
    
    -- Assignment
    assigned_team       VARCHAR(128),
    crew_size           SMALLINT,
    equipment           JSONB DEFAULT '[]'::JSONB,
    
    -- AI metadata
    ai_generated        BOOLEAN DEFAULT TRUE,
    ai_agent            VARCHAR(64) DEFAULT 'Maintenance Planning Agent',
    ai_confidence       FLOAT,
    human_approved_by   UUID,
    human_approved_at   TIMESTAMPTZ,
    
    -- Outcome
    rhi_before          FLOAT,
    rhi_after           FLOAT,
    verified_by_agent   BOOLEAN DEFAULT FALSE,
    verification_date   TIMESTAMPTZ,
    
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE maintenance_tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON maintenance_tasks
    USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

-- ── AI Agent Decisions (Audit Log) ────────────────────────────────
CREATE TABLE agent_decisions (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id       UUID NOT NULL REFERENCES tenants(id),
    task_id         UUID NOT NULL,
    
    agent_name      VARCHAR(64) NOT NULL,
    agent_type      VARCHAR(32),
    decision_type   VARCHAR(64),
    
    input_data      JSONB,
    output_data     JSONB,
    reasoning       TEXT,
    
    confidence      FLOAT CHECK (confidence BETWEEN 0 AND 1),
    model_version   VARCHAR(32),
    shap_values     JSONB,
    
    execution_ms    INTEGER,
    memory_used_mb  FLOAT,
    
    requires_human  BOOLEAN DEFAULT FALSE,
    human_approved  BOOLEAN,
    human_reviewer  UUID,
    
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_agent_decisions_tenant    ON agent_decisions (tenant_id);
CREATE INDEX idx_agent_decisions_task      ON agent_decisions (task_id);
CREATE INDEX idx_agent_decisions_created   ON agent_decisions (created_at DESC);

-- ── Satellite Imagery Analysis ─────────────────────────────────────
CREATE TABLE satellite_analyses (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id           UUID NOT NULL REFERENCES tenants(id),
    segment_id          UUID NOT NULL REFERENCES road_segments(id),
    
    imagery_date        DATE NOT NULL,
    satellite_source    VARCHAR(32) DEFAULT 'Sentinel-2',
    resolution_m        FLOAT DEFAULT 10.0,
    
    detections          JSONB DEFAULT '[]'::JSONB,
    damage_score        FLOAT CHECK (damage_score BETWEEN 0 AND 1),
    surface_condition   VARCHAR(16),
    ndvi_mean           FLOAT,
    ndwi_mean           FLOAT,
    
    model_version       VARCHAR(32),
    inference_time_ms   INTEGER,
    confidence          FLOAT,
    
    rhi_impact          FLOAT,
    triggered_action    BOOLEAN DEFAULT FALSE,
    
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ── Budget Allocations ─────────────────────────────────────────────
CREATE TABLE budget_allocations (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id       UUID NOT NULL REFERENCES tenants(id),
    fiscal_year     VARCHAR(16) NOT NULL,
    quarter         VARCHAR(4),
    city            VARCHAR(128),
    
    total_budget    NUMERIC(18, 2) NOT NULL,
    allocated       NUMERIC(18, 2),
    spent           NUMERIC(18, 2) DEFAULT 0,
    
    algorithm_used  VARCHAR(32),
    optimization_score FLOAT,
    savings         NUMERIC(18, 2),
    roi_multiplier  FLOAT,
    
    projects        JSONB DEFAULT '[]'::JSONB,
    
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── ML Model Registry (mirrors MLflow) ────────────────────────────
CREATE TABLE ml_models (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name            VARCHAR(128) NOT NULL,
    version         VARCHAR(32) NOT NULL,
    type            VARCHAR(32),
    framework       VARCHAR(64),
    stage           VARCHAR(16) CHECK (stage IN ('production', 'staging', 'shadow', 'retired')),
    
    accuracy        FLOAT,
    f1_score        FLOAT,
    drift_score     FLOAT DEFAULT 0,
    
    mlflow_run_id   VARCHAR(64),
    artifact_path   TEXT,
    
    inference_count BIGINT DEFAULT 0,
    avg_latency_ms  FLOAT,
    
    retrained_at    TIMESTAMPTZ,
    promoted_at     TIMESTAMPTZ,
    
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── Seed: Demo Tenant ─────────────────────────────────────────────
INSERT INTO tenants (slug, name, country, tier) VALUES
    ('mmc-in', 'Mumbai Municipal Corporation', 'India', 'enterprise'),
    ('ndmc-in', 'New Delhi Municipal Corporation', 'India', 'enterprise'),
    ('bbmp-in', 'Bruhat Bengaluru Mahanagara Palike', 'India', 'standard'),
    ('sfpw-us', 'San Francisco Public Works', 'United States', 'enterprise'),
    ('tfl-uk', 'Transport for London', 'United Kingdom', 'enterprise')
ON CONFLICT DO NOTHING;

-- ── Update trigger ─────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER road_segments_updated
    BEFORE UPDATE ON road_segments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER maintenance_tasks_updated
    BEFORE UPDATE ON maintenance_tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
