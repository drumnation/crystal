#!/bin/bash

# Ultra-minimal memory pnpm installation script
# This script installs dependencies in the smallest possible chunks

echo "Starting ultra-minimal memory pnpm installation..."

# Set very restrictive memory limits
export NODE_OPTIONS="--max-old-space-size=1024"
export PNPM_CHILD_CONCURRENCY=1
export CI=true
export NODE_ENV=production

# Clean everything first
echo "Cleaning up to free memory..."
rm -rf node_modules */node_modules */*/node_modules
pnpm store prune || true

# Step 1: Install only production dependencies for shared workspace
echo "Step 1: Installing shared workspace (production only)..."
cd shared
pnpm install --prod --no-optional --reporter=silent --prefer-offline --network-concurrency=1
cd ..

# Step 2: Install main workspace dependencies without dev deps
echo "Step 2: Installing main workspace (production only)..."
cd main
pnpm install --prod --no-optional --reporter=silent --prefer-offline --network-concurrency=1
cd ..

# Step 3: Install frontend workspace dependencies without dev deps
echo "Step 3: Installing frontend workspace (production only)..."
cd frontend
pnpm install --prod --no-optional --reporter=silent --prefer-offline --network-concurrency=1
cd ..

# Step 4: Install root dependencies
echo "Step 4: Installing root dependencies..."
pnpm install --filter "." --prod --no-optional --reporter=silent --prefer-offline --network-concurrency=1

# Step 5: Now try to install dev dependencies in smaller chunks
echo "Step 5: Installing development dependencies..."
export NODE_OPTIONS="--max-old-space-size=2048"

# Install TypeScript and build tools first
echo "Installing build tools..."
pnpm add -D typescript rimraf mkdirp --reporter=silent --prefer-offline

# Install other dev dependencies
echo "Installing remaining dev dependencies..."
pnpm install --reporter=silent --prefer-offline --network-concurrency=1

echo "Installation complete!"
echo ""
echo "Next steps:"
echo "1. Run: pnpm run build:main"
echo "2. Run: pnpm run electron:rebuild (may need manual intervention)"
echo "3. Run: pnpm run dev"