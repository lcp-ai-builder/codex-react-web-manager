#!/usr/bin/env bash
set -euo pipefail

IMAGE_ID="7adf3298f4d8"
CONTAINER_NAME="nginx-react-web-manager"
NGINX_ROOT="/usr/share/nginx/html"
APP_BASE="/trade-manager"
RUNTIME="podman"

if ! command -v "${RUNTIME}" >/dev/null 2>&1; then
  echo "${RUNTIME} is required but not found in PATH" >&2
  exit 1
fi

if ! command -v npm >/dev/null 2>&1; then
  echo "npm is required but not found in PATH" >&2
  exit 1
fi

if "${RUNTIME}" ps -a --format '{{.Names}}' | grep -qx "${CONTAINER_NAME}"; then
  echo "Removing existing container: ${CONTAINER_NAME}"
  "${RUNTIME}" rm -f "${CONTAINER_NAME}" >/dev/null
fi

echo "Starting nginx container from image ${IMAGE_ID}"
"${RUNTIME}" run -d --name "${CONTAINER_NAME}" -p 8192:80 "${IMAGE_ID}" >/dev/null

echo "Building Vite assets"
npm install
npm run build

echo "Uploading dist/ to nginx"
"${RUNTIME}" exec "${CONTAINER_NAME}" rm -rf "${NGINX_ROOT:?}${APP_BASE}"
"${RUNTIME}" exec "${CONTAINER_NAME}" mkdir -p "${NGINX_ROOT}${APP_BASE}"
"${RUNTIME}" cp dist/. "${CONTAINER_NAME}:${NGINX_ROOT}${APP_BASE}"

echo "Done. Open http://localhost:8192"
