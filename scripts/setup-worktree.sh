#!/bin/bash

# Crystal Worktree Setup Script
# This script sets up a new Crystal worktree with proper dependencies

echo "🔧 Setting up Crystal worktree..."

# Check if we're in a Crystal project directory
if [ ! -f "package.json" ] || [ ! -d "frontend" ] || [ ! -d "main" ]; then
    echo "❌ Error: This doesn't appear to be a Crystal project directory"
    echo "Please run this script from the root of a Crystal worktree"
    exit 1
fi

# The pnpm memory issue requires using npm for initial setup
echo "📦 Installing dependencies with npm (due to pnpm memory constraints)..."

# Clean any existing installations
echo "🧹 Cleaning existing node_modules..."
rm -rf node_modules frontend/node_modules main/node_modules shared/node_modules

# Install with npm
echo "Installing root dependencies..."
npm install

# Install frontend dependencies with legacy peer deps
echo "Installing frontend dependencies..."
cd frontend && npm install --legacy-peer-deps && cd ..

# Build main process
echo "🔨 Building main process..."
npm run build:main

# Rebuild native modules
echo "🔧 Rebuilding native modules..."
npm run electron:rebuild

echo "✅ Setup complete!"
echo ""
echo "📝 To start the development server, run:"
echo "    npm run dev"
echo ""
echo "⚠️  Note: Due to memory constraints with pnpm on this project,"
echo "    npm is used for installation. The dev server will still use pnpm"
echo "    for workspace commands as configured in package.json."