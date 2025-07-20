#!/bin/bash

# Optimized pnpm installation script for Crystal worktrees
# This script uses the best practices for memory-constrained Electron monorepos

set -e

echo "🚀 Crystal Optimized pnpm Installation"
echo "====================================="

# Detect available memory
TOTAL_MEM=$(free -m 2>/dev/null | awk '/^Mem:/{print $2}' || sysctl -n hw.memsize 2>/dev/null | awk '{print int($1/1024/1024)}' || echo "8192")
echo "📊 System memory: ${TOTAL_MEM}MB"

# Calculate optimal heap size (75% of available memory, max 8GB)
HEAP_SIZE=$((TOTAL_MEM * 3 / 4))
if [ $HEAP_SIZE -gt 8192 ]; then
  HEAP_SIZE=8192
fi
if [ $HEAP_SIZE -lt 2048 ]; then
  HEAP_SIZE=2048
fi

echo "🧠 Using heap size: ${HEAP_SIZE}MB"

# Set environment variables
export NODE_OPTIONS="--max-old-space-size=${HEAP_SIZE}"
export PNPM_CHILD_CONCURRENCY=1
export CI=true
export ELECTRON_SKIP_BINARY_DOWNLOAD=1  # Skip electron binary during install

# Clear any existing locks
rm -f pnpm-lock.yaml.lock

# Step 1: Clean install with frozen lockfile
echo ""
echo "📦 Step 1: Installing dependencies..."
pnpm install --frozen-lockfile || {
  echo "⚠️  Frozen lockfile failed, trying without..."
  pnpm install --no-frozen-lockfile
}

# Step 2: Download electron separately with more memory
echo ""
echo "📥 Step 2: Downloading Electron binary..."
cd main
export ELECTRON_SKIP_BINARY_DOWNLOAD=0
npx electron@36.4.0 --version || true
cd ..

# Step 3: Rebuild native modules
echo ""
echo "🔨 Step 3: Rebuilding native modules..."
pnpm run electron:rebuild || {
  echo "⚠️  Rebuild failed, trying with manual approach..."
  cd main
  npx electron-rebuild -f -w better-sqlite3
  cd ..
}

# Step 4: Build main process
echo ""
echo "🏗️  Step 4: Building main process..."
pnpm run build:main

echo ""
echo "✅ Installation completed successfully!"
echo ""
echo "You can now run: pnpm run dev"