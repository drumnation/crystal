pnpm build:mac
```

## Setting Up New Worktrees

When Crystal creates new worktrees for sessions, they need to be properly bootstrapped with dependencies. This section explains the setup process, configuration, and solutions for common issues.

### System Requirements

- **Node.js**: >= 22.14.0
- **pnpm**: >= 8.0.0 (REQUIRED - install with `npm install -g pnpm`)
- **Memory**: >= 8GB RAM recommended (4GB minimum with memory-safe options)

### Crystal Configuration

To ensure Crystal properly sets up new worktrees, configure your project settings with:

- **Build Script**: `node --max-old-space-size=4096 scripts/setup-worktree.mjs`
- **Run Commands**: `pnpm run dev`

The setup script automatically:
1. Validates pnpm installation (required for workspace management)
2. Uses memory-safe installation options
3. Handles corrupted states and memory constraints
4. Rebuilds native modules for Electron
5. Builds the main process TypeScript files

### Manual Setup

```bash
# Install pnpm if not already installed
npm install -g pnpm

# Run the setup script with memory optimization
node --max-old-space-size=4096 scripts/setup-worktree.mjs

# Start development server
pnpm run dev
```

**Note**: npm is NOT recommended as it breaks workspace linking. Only use `--use-npm` flag as an absolute last resort.

### Troubleshooting

#### Memory Issues

If you encounter "JavaScript heap out of memory" errors:

1. **Use the memory-optimized setup command**:
   ```bash
   node --max-old-space-size=4096 scripts/setup-worktree.mjs
   ```

2. **Close other applications** to free up system memory

3. **Try progressive installation** (the script will attempt this automatically)

4. **Try the memory-safe installation script**:
   ```bash
   # Uses aggressive memory optimization for pnpm
   bash scripts/pnpm-install-safe.sh
   ```

5. **If pnpm continues to fail due to environment constraints**:
   ```bash
   # Temporary workaround using npm
   bash scripts/install-workaround.sh
   ```
   **IMPORTANT**: This is a temporary solution. Once memory constraints are resolved:
   - Close memory-intensive applications
   - Run: `node scripts/setup-worktree.mjs --clean`
   - Run: `node --max-old-space-size=8192 scripts/setup-worktree.mjs`

#### Corrupted State

If you see warnings about mixed package managers or corrupted installations:

1. **Run the cleanup command**:
   ```bash
   node scripts/setup-worktree.mjs --clean
   ```
   This will:
   - Remove all node_modules directories
   - Clear pnpm and npm caches
   - Prepare for a fresh installation

2. **Reinstall dependencies**:
   ```bash
   node --max-old-space-size=4096 scripts/setup-worktree.mjs
   ```

#### Package Manager Issues

**pnpm is REQUIRED for Crystal projects**
- Crystal uses pnpm workspaces for proper dependency management
- npm breaks workspace linking and causes dependency issues
- Only use npm (`--use-npm` flag) as an absolute last resort

**If you see npm warnings:**
```
npm warn Unknown project config "public-hoist-pattern"
```
This means npm is being used instead of pnpm. Install pnpm and run the setup again.

#### Workspace Linking

If dependencies are missing in worktrees:

1. **Ensure pnpm is installed**:
   ```bash
   npm install -g pnpm
   ```

2. **Run the setup script**:
   ```bash
   node --max-old-space-size=4096 scripts/setup-worktree.mjs
   ```

3. **If installation fails**, try:
   ```bash
   pnpm install --no-frozen-lockfile
   ```

#### Native Module Problems

If better-sqlite3, node-pty, or other native modules fail:

1. **Run the rebuild command**:
   ```bash
   pnpm run electron:rebuild
   ```

2. **Ensure build tools are installed**:
   - macOS: Xcode Command Line Tools
   - Windows: Visual Studio Build Tools
   - Linux: build-essential package

3. **Check Node.js/Electron compatibility**:
   The Node.js version must match Electron's Node.js version

### Quick Fix Commands

```bash
# Clean corrupted installation
node scripts/setup-worktree.mjs --clean

# Memory-safe installation with pnpm
node --max-old-space-size=4096 scripts/setup-worktree.mjs

# Last resort: Force npm (NOT RECOMMENDED - breaks workspaces)
node --max-old-space-size=4096 scripts/setup-worktree.mjs --use-npm

# Check your environment
node --version  # Should be >= 22.14.0
pnpm --version  # Should be >= 8.0.0
```

### Crystal Project Settings Summary

After successful setup, use these settings in Crystal:

| Setting | Value |
|---------|-------|
| Build Script | `node --max-old-space-size=4096 scripts/setup-worktree.mjs` |
| Run Command | `pnpm run dev` |



## 🤝 Contributing
