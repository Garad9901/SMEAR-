.PHONY: help dev build test migrate lint clean logs shell-api shell-db

# ─────────────────────────────────────────────────────────────────────────────
# Help
# ─────────────────────────────────────────────────────────────────────────────
help:  ## Show this help message
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

# ─────────────────────────────────────────────────────────────────────────────
# Development
# ─────────────────────────────────────────────────────────────────────────────
dev:  ## Start full stack in development mode
	docker-compose up --build -d
	@echo "\033[32m✔ AgroSense AI is running!\033[0m"
	@echo "  API Docs:   http://localhost:8000/docs"
	@echo "  Dashboard:  http://localhost:8501"
	@echo "  MLflow:     http://localhost:5000"
	@echo "  Airflow:    http://localhost:8080"

stop:  ## Stop all services
	docker-compose down

restart:  ## Restart all services
	docker-compose restart

build:  ## Build Docker images
	docker-compose build --no-cache

logs:  ## Tail logs for all services
	docker-compose logs -f

logs-api:  ## Tail API logs
	docker-compose logs -f api

logs-db:  ## Tail PostgreSQL logs
	docker-compose logs -f postgres

# ─────────────────────────────────────────────────────────────────────────────
# Database
# ─────────────────────────────────────────────────────────────────────────────
migrate:  ## Run Alembic migrations
	docker-compose exec api alembic upgrade head

migrate-create:  ## Create new migration (usage: make migrate-create MSG="add users table")
	docker-compose exec api alembic revision --autogenerate -m "$(MSG)"

migrate-rollback:  ## Rollback last migration
	docker-compose exec api alembic downgrade -1

db-seed:  ## Seed district data
	docker-compose exec api python -m app.utils.seed_data

# ─────────────────────────────────────────────────────────────────────────────
# Testing
# ─────────────────────────────────────────────────────────────────────────────
test:  ## Run all tests
	docker-compose exec api pytest tests/ -v --cov=app --cov-report=term-missing

test-api:  ## Run API tests only
	docker-compose exec api pytest tests/test_api/ -v

test-ml:  ## Run ML tests only
	docker-compose exec api pytest tests/test_ml/ -v

test-cov:  ## Run tests with HTML coverage report
	docker-compose exec api pytest tests/ --cov=app --cov-report=html
	@echo "Coverage report: htmlcov/index.html"

# ─────────────────────────────────────────────────────────────────────────────
# ML Training
# ─────────────────────────────────────────────────────────────────────────────
train-rainfall:  ## Train Module 1 rainfall models
	docker-compose exec api python ml/module1_rainfall/train.py

train-crop:  ## Train Module 2 crop models
	docker-compose exec api python ml/module2_crop/train.py

train-risk:  ## Train Module 3 risk models
	docker-compose exec api python ml/module3_risk/train.py

train-all:  ## Train all modules sequentially
	make train-rainfall train-crop train-risk

# ─────────────────────────────────────────────────────────────────────────────
# Code Quality
# ─────────────────────────────────────────────────────────────────────────────
lint:  ## Run ruff linter
	ruff check backend/ ml/ etl/ dashboard/

format:  ## Format code with ruff
	ruff format backend/ ml/ etl/ dashboard/

typecheck:  ## Run mypy type checker
	mypy backend/app/ --ignore-missing-imports

# ─────────────────────────────────────────────────────────────────────────────
# Utilities
# ─────────────────────────────────────────────────────────────────────────────
shell-api:  ## Open shell in API container
	docker-compose exec api bash

shell-db:  ## Open psql shell
	docker-compose exec postgres psql -U agrosense_user -d agrosense

clean:  ## Remove build artifacts and caches
	find . -type d -name __pycache__ -exec rm -rf {} + 2>/dev/null; true
	find . -name "*.pyc" -delete
	rm -rf .pytest_cache htmlcov .coverage

setup-dev:  ## Install dev dependencies locally (without Docker)
	pip install -r backend/requirements.txt
	pip install -r ml/requirements.txt
	pip install pytest pytest-asyncio pytest-cov httpx ruff mypy
