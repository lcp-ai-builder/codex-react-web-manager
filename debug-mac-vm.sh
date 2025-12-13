#!/bin/bash

# Debug script for macOS VM environment with Vite
echo "========================================="
echo "Starting debug mode for macOS VM with Vite"
echo "========================================="
echo "Current directory: $(pwd)"
echo "Node version: $(node -v)"
echo "Yarn version: $(yarn -v)"
echo "Vite version: $(npx vite --version)"

# Export environment variables for macOS VM
export NODE_OPTIONS="--max_old_space_size=4096"
export VITE_ENV="mac-vm"

echo ""
echo "Environment variables:"
echo "- NODE_OPTIONS: $NODE_OPTIONS"
echo "- VITE_ENV: $VITE_ENV"
echo ""

# Run the development server with mac-vm environment
echo "Starting Vite development server for mac-vm environment..."
echo "=========================================================="
VITE_ENV=mac-vm npx vite