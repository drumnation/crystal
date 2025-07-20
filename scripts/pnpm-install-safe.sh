#!/bin/bash

# Memory-safe pnpm installation script

echo "Setting up memory-optimized environment for pnpm..."

# Set Node.js memory limit
export NODE_OPTIONS="--max-old-space-size=4096"

# Set pnpm-specific memory optimizations
export PNPM_CHILD_CONCURRENCY=1
export CI=true

# Clear any existing node_modules to free memory
if [ -d "node_modules" ]; then
  echo "Clearing existing node_modules..."
  rm -rf node_modules
fi

# Clear pnpm store cache to free memory
echo "Clearing pnpm cache..."
pnpm store prune || true

# Install with memory-safe options
echo "Installing dependencies with memory optimizations..."
pnpm install \
  --no-frozen-lockfile \
  --reporter=silent \
  --prefer-offline \
  --network-concurrency=1 \
  --child-concurrency=1

echo "Installation complete!"