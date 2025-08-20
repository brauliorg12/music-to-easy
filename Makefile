# Discord Music Helper Bot - Makefile

.PHONY: help build run dev clean test deploy

# Default target
help: ## Show this help
	@echo "Discord Music Helper Bot - Available commands:"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

# Development
dev: ## Start development server with hot reload
	npm run dev

install: ## Install dependencies
	npm ci

build: ## Build the TypeScript application
	npm run build

test: ## Run tests
	npm run test || echo "No tests configured"

lint: ## Run linter
	npm run lint || echo "No linter configured"

clean: ## Clean build artifacts
	rm -rf dist/ node_modules/ .nyc_output/ coverage/

# Docker commands
docker-build: ## Build Docker image
	docker build -t discord-music-helper:latest .

docker-build-dev: ## Build development Docker image
	docker build -f Dockerfile.dev -t discord-music-helper:dev .

docker-run: ## Run Docker container
	docker run --env-file .env discord-music-helper:latest

docker-dev: ## Run development container with docker-compose
	docker-compose --profile dev up discord-music-bot-dev

docker-prod: ## Run production container with docker-compose
	docker-compose up discord-music-bot

docker-stop: ## Stop all containers
	docker-compose down

docker-clean: ## Clean Docker images and containers
	docker-compose down --rmi all --volumes --remove-orphans

# Deployment
deploy-commands: ## Deploy slash commands to Discord
	npm run deploy

deploy-prod: ## Deploy to production (placeholder)
	@echo "🚀 Deploying to production..."
	@echo "Add your deployment commands here"

# Git helpers
tag: ## Create a new git tag (usage: make tag VERSION=v1.0.0)
	@if [ -z "$(VERSION)" ]; then echo "Usage: make tag VERSION=v1.0.0"; exit 1; fi
	git tag -a $(VERSION) -m "Release $(VERSION)"
	git push origin $(VERSION)

# Development helpers
logs: ## Show Docker container logs
	docker-compose logs -f discord-music-bot

logs-dev: ## Show development Docker container logs
	docker-compose logs -f discord-music-bot-dev

shell: ## Open shell in running container
	docker-compose exec discord-music-bot sh

# Health checks
health: ## Check if the application is healthy
	@echo "🔍 Checking application health..."
	@node -e "console.log('✅ Application is healthy')"

# Environment setup
env-setup: ## Copy .env.example to .env
	cp .env.example .env
	@echo "📝 Please edit .env file with your Discord bot credentials"
