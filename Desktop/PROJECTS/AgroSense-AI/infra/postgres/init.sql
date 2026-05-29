-- =============================================================================
-- AgroSense AI — PostgreSQL Postgis Initialization
-- =============================================================================

-- Create additional databases required by Airflow and MLflow
SELECT 'CREATE DATABASE airflow' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'airflow')\gexec
SELECT 'CREATE DATABASE mlflow' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'mlflow')\gexec

-- Connect to main database (agrosense) and enable PostGIS + UUID extensions
\c agrosense;

CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Connect to airflow database and enable extensions
\c airflow;

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Connect to mlflow database and enable extensions
\c mlflow;

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
