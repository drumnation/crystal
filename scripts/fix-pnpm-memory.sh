#!/bin/bash

# Fix pnpm memory issues for Crystal project
# This script implements the complete solution based on pnpm issue #6227

set -e

echo "🔧 Fixing pnpm memory issues for Crystal project"
echo "================================================"

# Step 1: Clean everything
echo "📧 Step 1: Cleaning existing installations..."
rm -rf node_modules frontend/node_modules main/node_modules shared/node_modules
rm -rf .pnpm-store pnpm-lock.yaml package-lock.json
pnpm store prune || true

# Step 2: Update .npmrc with optimal settings
echo "⚙️  Step 2: Configuring optimal pnpm settings..."
cat > .npmrc << 'EOF'
# Memory optimization for pnpm based on issue #6227
# https://github.com/pnpm/pnpm/issues/6227

# Critical setting to prevent memory issues
dedupe-peer-dependents=true

# Reduce concurrent operations
network-concurrency=1
fetch-retries=3
fetch-retry-mintimeout=20000
fetch-retry-maxtimeout=120000

# Performance optimizations
progress=false
prefer-offline=true
shamefully-hoist=true
strict-peer-dependencies=false
auto-install-peers=false

# Use isolated node_modules
node-linker=isolated
EOF

# Step 3: Set environment for maximum memory
echo "💾 Step 3: Setting memory environment..."
export NODE_OPTIONS="--max-old-space-size=8192"
export PNPM_CHILD_CONCURRENCY=1

# Step 4: Install with frozen lockfile generation
echo "📦 Step 4: Installing dependencies..."
echo "   This may take a few minutes on first run..."

# First, generate a fresh lockfile
pnpm install --no-frozen-lockfile || {
    echo "⚠️  Standard install failed, trying with hoisted linker..."
    
    # Fallback to hoisted if isolated fails
    echo "node-linker=hoisted" >> .npmrc
    pnpm install --no-frozen-lockfile
}

# Step 5: Rebuild native modules
echo "🔨 Step 5: Rebuilding native modules..."
pnpm run electron:rebuild || {
    echo "⚠️  Electron rebuild failed, trying manual approach..."
    cd main
    npx electron-rebuild -f -w better-sqlite3
    cd ..
}

# Step 6: Build main process
echo "🏗️  Step 6: Building main process..."
pnpm run build:main

echo ""
echo "✅ Setup complete! You can now run: pnpm dev"
echo ""
echo "💡 Tips for future worktrees:"
echo "   1. Always use this script for initial setup"
echo "   2. The .npmrc settings are now optimized"
echo "   3. If issues persist, increase NODE_OPTIONS memory"