#!/usr/bin/env bash
set -euo pipefail

# -----------------------
# CONFIG (edit if you want)
# -----------------------
REGION="${REGION:-us-east1}"

# Auto-detect PROJECT_ID if not exported
if [[ -z "${PROJECT_ID:-}" ]]; then
  echo "PROJECT_ID not set; reading from gcloud config…"
  PROJECT_ID="$(gcloud config get-value project 2>/dev/null || true)"
fi

if [[ -z "${PROJECT_ID:-}" ]]; then
  echo "ERROR: PROJECT_ID is empty. Run: export PROJECT_ID=<your-gcp-project-id>"
  exit 1
fi

echo "Using PROJECT_ID=$PROJECT_ID  REGION=$REGION"
echo

# -----------------------
# Paths (from repo root)
# -----------------------
ROOT="$(pwd)"
MCP_DIR="$ROOT/bluetubetv-live/polygon-mcp-sidecar/mcp"
API_DIR="$ROOT/bluetubetv-live/polygon-mcp-sidecar/api"

# Sanity checks
[[ -d "$MCP_DIR" ]] || { echo "ERROR: Missing $MCP_DIR"; exit 1; }
[[ -d "$API_DIR" ]] || { echo "ERROR: Missing $API_DIR"; exit 1; }

# -----------------------
# Build & push MCP
# -----------------------
echo "==> MCP: $MCP_DIR"
cd "$MCP_DIR"

# Ensure Dockerfile exists
if [[ ! -f Dockerfile ]]; then
  echo "ERROR: MCP Dockerfile missing at $MCP_DIR/Dockerfile"
  exit 1
fi

docker build -t "gcr.io/$PROJECT_ID/mcp-sidecar:latest" .
docker push "gcr.io/$PROJECT_ID/mcp-sidecar:latest"

# -----------------------
# Build & push API
# -----------------------
echo
echo "==> API: $API_DIR"
cd "$API_DIR"

# Ensure Dockerfile exists
if [[ ! -f Dockerfile ]]; then
  echo "ERROR: API Dockerfile missing at $API_DIR/Dockerfile"
  exit 1
fi

docker build -t "gcr.io/$PROJECT_ID/btv-api:latest" .
docker push "gcr.io/$PROJECT_ID/btv-api:latest"

echo
echo "✅ Done. Images pushed:"
echo "   gcr.io/$PROJECT_ID/mcp-sidecar:latest"
echo "   gcr.io/$PROJECT_ID/btv-api:latest"
