# LUMI+ Platform Makefile
# Convenient commands for development and deployment

.PHONY: help up down restart logs clean install build test

# Default target
help:
	@echo "LUMI+ Platform - Available Commands:"
	@echo "  make up          - Start all services"
	@echo "  make down        - Stop all services"
	@echo "  make restart     - Restart all services"
	@echo "  make logs        - View logs from all services"
	@echo "  make logs-be     - View backend logs"
	@echo "  make logs-fe     - View frontend logs"
	@echo "  make logs-db     - View database logs"
	@echo "  make clean       - Remove all containers and volumes"
	@echo "  make install     - Install dependencies for all projects"
	@echo "  make build       - Build all Docker images"
	@echo "  make test        - Run tests"
	@echo "  make db-migrate  - Run database migrations"
	@echo "  make db-reset    - Reset database (WARNING: deletes all data)"

# Start all services
up:
	docker-compose up -d
	@echo "Services started! Access:"
	@echo "  Frontend: http://localhost:3000"
	@echo "  Backend API: http://localhost:5000"
	@echo "  pgAdmin: http://localhost:5050"
	@echo "  PostgreSQL: localhost:5432"
	@echo "  Redis: localhost:6379"
	@echo "  MongoDB: localhost:27017"

# Stop all services
down:
	docker-compose down

# Restart all services
restart:
	docker-compose restart

# View logs
logs:
	docker-compose logs -f

logs-be:
	docker-compose logs -f backend

logs-fe:
	docker-compose logs -f frontend

logs-db:
	docker-compose logs -f postgres

# Clean up everything
clean:
	docker-compose down -v
	@echo "All containers and volumes removed"

# Install dependencies locally
install:
	@echo "Installing frontend dependencies..."
	cd frontend && npm install
	@echo "Installing backend dependencies..."
	cd backend && npm install
	@echo "Dependencies installed!"

# Build Docker images
build:
	docker-compose build

# Run tests
test:
	@echo "Running backend tests..."
	cd backend && npm test
	@echo "Running frontend tests..."
	cd frontend && npm test

# Database migrations
db-migrate:
	docker exec -i lumiplus-postgres psql -U postgres -d lumiplus_db < database/migrations/001_initial_schema.sql

# Reset database (WARNING)
db-reset:
	@echo "WARNING: This will delete all data!"
	@read -p "Are you sure? [y/N] " -n 1 -r; \
	echo; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		docker-compose down postgres; \
		docker volume rm merithem_postgres_data; \
		docker-compose up -d postgres; \
		sleep 5; \
		make db-migrate; \
		echo "Database reset complete"; \
	fi

# Development commands
dev-fe:
	cd frontend && npm run dev

dev-be:
	cd backend && npm run dev

# Production build
prod-build:
	cd frontend && npm run build
	cd backend && npm run build
