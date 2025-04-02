#!/bin/bash

echo "======================================"
echo "     Arbitrage Operator Deploy"
echo "======================================"

# Step 1: Check for .env
if [ ! -f .env ]; then
    echo "⚠️  .env file not found! Copy .env.example and configure it first."
    exit 1
fi

# Step 2: Build Docker Images
echo "🔄 Building Docker images..."
docker-compose build

# Step 3: Launch Full Stack
echo "🚀 Starting Arbitrage Stack..."
docker-compose up -d

# Step 4: Show Status
echo "✅ Docker Containers Running:"
docker-compose ps

# Step 5: Show Access Info
echo "======================================"
echo " Grafana:    http://localhost:3000 (admin/admin)"
echo " Prometheus: http://localhost:9090"
echo "======================================"
echo "Logs: docker-compose logs -f searcher"
echo "Stop: docker-compose down"
echo "======================================"
