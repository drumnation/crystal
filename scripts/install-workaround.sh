#!/bin/bash

# Temporary workaround script using npm to bypass pnpm memory issues
# This is NOT ideal but allows installation to complete

echo "==================================================================="
echo "TEMPORARY WORKAROUND: Using npm to bypass memory constraints"
echo "NOTE: This is a temporary solution. pnpm is the preferred manager."
echo "==================================================================="
echo ""

# Clean up first
echo "Cleaning up existing node_modules..."
rm -rf node_modules */node_modules */*/node_modules

# Set memory limit
export NODE_OPTIONS="--max-old-space-size=4096"

# Step 1: Install with npm using legacy peer deps
echo "Installing dependencies with npm (temporary workaround)..."
npm install --legacy-peer-deps --no-audit --no-fund

# Step 2: Try to rebuild native modules
echo ""
echo "Attempting to rebuild native modules..."
cd main && npx electron-rebuild -f -w better-sqlite3 || echo "Rebuild failed - manual intervention may be needed"
cd ..

# Step 3: Build main process
echo ""
echo "Building main process..."
npm run build:main || echo "Build failed - manual intervention may be needed"

echo ""
echo "==================================================================="
echo "Installation complete (using npm workaround)"
echo ""
echo "IMPORTANT NOTES:"
echo "1. This used npm instead of pnpm due to memory constraints"
echo "2. Some workspace features may be limited"
echo "3. Once memory issues are resolved, clean and reinstall with pnpm"
echo ""
echo "To migrate back to pnpm when possible:"
echo "  1. Close memory-intensive applications"
echo "  2. Run: node scripts/setup-worktree.mjs --clean"
echo "  3. Run: node --max-old-space-size=8192 scripts/setup-worktree.mjs"
echo ""
echo "For now, you can run: npm run dev"
echo "==================================================================="