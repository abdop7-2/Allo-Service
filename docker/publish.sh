#!/usr/bin/env bash
# Build, tag and push the app images to Docker Hub.
#
# One-time:  docker login
# Then:      DOCKERHUB_USER=yourname TAG=1.0 ./docker/publish.sh
set -e

: "${DOCKERHUB_USER:?Set DOCKERHUB_USER to your Docker Hub username}"
TAG="${TAG:-latest}"

echo "Building images..."
docker compose build backend frontend

echo "Tagging for $DOCKERHUB_USER (tag: $TAG)..."
docker tag allo-services-backend  "$DOCKERHUB_USER/allo-backend:$TAG"
docker tag allo-services-frontend "$DOCKERHUB_USER/allo-frontend:$TAG"

echo "Pushing..."
docker push "$DOCKERHUB_USER/allo-backend:$TAG"
docker push "$DOCKERHUB_USER/allo-frontend:$TAG"

echo ""
echo "Done. Your friend runs:"
echo "  DOCKERHUB_USER=$DOCKERHUB_USER TAG=$TAG docker compose -f docker-compose.dist.yml up -d"
