#!/bin/bash

# Debug script for WSL environment with Vite
echo "=================================="
echo "Starting debug mode for WSL with Vite"
echo "=================================="
echo "Current directory: $(pwd)"
echo "Node version: $(node -v)"
echo "Yarn version: $(yarn -v)"
echo "Vite version: $(npx vite --version)"

# Export environment variables for WSL
export NODE_OPTIONS="--max_old_space_size=4096"
export VITE_ENV="wsl"
export BROWSER=none

echo ""
echo "Environment variables:"
echo "- NODE_OPTIONS: $NODE_OPTIONS"
echo "- VITE_ENV: $VITE_ENV"
echo "- BROWSER: $BROWSER"
echo ""

# Run the development server with wsl environment
echo "Starting Vite development server for WSL environment..."
echo "===================================================="
VITE_ENV=wsl npx vite