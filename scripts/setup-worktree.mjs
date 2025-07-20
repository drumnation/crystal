#!/usr/bin/env node

import { execSync } from 'child_process';
import { readFileSync, existsSync, rmSync } from 'fs';
import { join, resolve } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { totalmem } from 'os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

// Parse command line arguments
const args = process.argv.slice(2);
const shouldClean = args.includes('--clean');
const forceNpm = args.includes('--use-npm');

// ANSI color codes for logging
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logError(message) {
  console.error(`${colors.red}ERROR: ${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✓ ${message}`, 'green');
}

function logInfo(message) {
  log(`ℹ ${message}`, 'blue');
}

function logWarning(message) {
  log(`⚠ ${message}`, 'yellow');
}

// Check if a command exists
function commandExists(command) {
  try {
    execSync(`which ${command}`, { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

// Get version of a command
function getVersion(command, versionFlag = '--version') {
  try {
    const output = execSync(`${command} ${versionFlag}`, { encoding: 'utf8' });
    // Extract version number from output
    const match = output.match(/(\d+\.\d+\.\d+)/);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

// Compare versions (returns true if version1 >= version2)
function isVersionSufficient(version1, version2) {
  const v1Parts = version1.split('.').map(Number);
  const v2Parts = version2.split('.').map(Number);
  
  for (let i = 0; i < Math.max(v1Parts.length, v2Parts.length); i++) {
    const v1Part = v1Parts[i] || 0;
    const v2Part = v2Parts[i] || 0;
    
    if (v1Part > v2Part) return true;
    if (v1Part < v2Part) return false;
  }
  
  return true;
}

// Check if this is a git worktree
function isGitWorktree() {
  try {
    const gitDir = execSync('git rev-parse --git-common-dir', { 
      cwd: projectRoot, 
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'ignore']
    }).trim();
    
    // In a worktree, --git-common-dir returns the main .git directory
    // In the main repo, it returns .git
    const isWorktree = !gitDir.endsWith('.git') || gitDir.includes('worktrees');
    return isWorktree;
  } catch {
    return false;
  }
}

// Clean up node_modules and caches
function cleanupEnvironment() {
  log('Cleanup Mode - Removing node_modules and clearing caches', 'magenta');
  log('=======================================================', 'magenta');
  console.log();

  try {
    // Remove node_modules in root
    const rootNodeModules = join(projectRoot, 'node_modules');
    if (existsSync(rootNodeModules)) {
      logInfo('Removing root node_modules...');
      rmSync(rootNodeModules, { recursive: true, force: true });
      logSuccess('Removed root node_modules');
    }

    // Remove node_modules in workspace packages
    const workspaces = ['frontend', 'main', 'shared'];
    for (const workspace of workspaces) {
      const wsNodeModules = join(projectRoot, workspace, 'node_modules');
      if (existsSync(wsNodeModules)) {
        logInfo(`Removing ${workspace}/node_modules...`);
        rmSync(wsNodeModules, { recursive: true, force: true });
        logSuccess(`Removed ${workspace}/node_modules`);
      }
    }

    // Clear pnpm cache if pnpm is available
    if (commandExists('pnpm')) {
      logInfo('Clearing pnpm store cache...');
      try {
        execSync('pnpm store prune', { stdio: 'inherit' });
        logSuccess('Cleared pnpm store cache');
      } catch (error) {
        logWarning('Failed to clear pnpm cache (non-critical)');
      }
    }

    // Clear npm cache
    logInfo('Clearing npm cache...');
    try {
      execSync('npm cache clean --force', { stdio: 'inherit' });
      logSuccess('Cleared npm cache');
    } catch (error) {
      logWarning('Failed to clear npm cache (non-critical)');
    }

    console.log();
    logSuccess('Cleanup completed! Run without --clean flag to install dependencies.');
    console.log();
    
  } catch (error) {
    logError('Cleanup failed!');
    console.error(error);
    process.exit(1);
  }
}

// Install dependencies with memory safety
async function installDependencies(useNpm = false) {
  const packageManager = useNpm ? 'npm' : 'pnpm';
  const lockfile = useNpm ? 'package-lock.json' : 'pnpm-lock.yaml';
  const lockfileExists = existsSync(join(projectRoot, lockfile));
  
  logInfo(`Installing dependencies with ${packageManager}...`);
  logInfo('This may take a few minutes on first run...');
  
  if (!lockfileExists && !useNpm) {
    logWarning(`No ${lockfile} found, installing without frozen lockfile...`);
  }

  try {
    // Calculate optimal heap size based on system memory
    const totalMem = totalmem() / (1024 * 1024); // Convert to MB
    let heapSize = Math.floor(totalMem * 0.75); // Use 75% of available memory
    heapSize = Math.min(heapSize, 8192); // Cap at 8GB
    heapSize = Math.max(heapSize, 2048); // Minimum 2GB
    
    logInfo(`Optimizing for ${Math.round(totalMem)}MB system RAM, using ${heapSize}MB heap`);
    
    // Set memory limit through environment variable
    const env = { 
      ...process.env, 
      NODE_OPTIONS: `--max-old-space-size=${heapSize}`,
      // Force pnpm to use less memory
      PNPM_CHILD_CONCURRENCY: '1',
      // Disable pnpm's progress reporter to save memory
      CI: 'true',
      // Skip electron binary during initial install
      ELECTRON_SKIP_BINARY_DOWNLOAD: '1'
    };
    
    if (useNpm) {
      // npm installation with legacy peer deps for workspace compatibility
      logWarning('Using npm as a fallback. This may result in limited workspace functionality.');
      execSync('npm install --legacy-peer-deps', {
        cwd: projectRoot,
        stdio: 'inherit',
        env
      });
    } else {
      // pnpm installation with memory optimization flags
      const baseCmd = lockfileExists 
        ? 'pnpm install --frozen-lockfile' 
        : 'pnpm install --no-frozen-lockfile';
      
      // Add memory optimization flags
      const pnpmCmd = `${baseCmd} --reporter=silent --prefer-offline --network-concurrency=1`;
      
      logInfo('Using memory-optimized pnpm installation...');
      execSync(pnpmCmd, {
        cwd: projectRoot,
        stdio: 'inherit',
        env
      });
    }
    
    logSuccess('Dependencies installed successfully');
    return true;
    
  } catch (error) {
    if (error.message && error.message.includes('JavaScript heap out of memory')) {
      logError('Installation failed due to memory constraints');
      
      if (!useNpm) {
        console.log();
        logWarning('Attempting progressive installation to reduce memory usage...');
        return attemptProgressiveInstall();
      }
    }
    
    throw error;
  }
}

// Progressive installation for memory-constrained environments
async function attemptProgressiveInstall() {
  try {
    const env = { 
      ...process.env, 
      NODE_OPTIONS: '--max-old-space-size=2048',
      PNPM_CHILD_CONCURRENCY: '1',
      CI: 'true'
    };
    
    // Install root dependencies first
    logInfo('Installing root dependencies...');
    execSync('pnpm install --no-frozen-lockfile --filter "." --reporter=silent --prefer-offline --network-concurrency=1', {
      cwd: projectRoot,
      stdio: 'inherit',
      env
    });
    
    // Install workspace dependencies one by one
    const workspaces = ['shared', 'main', 'frontend'];
    for (const workspace of workspaces) {
      logInfo(`Installing ${workspace} dependencies...`);
      execSync(`pnpm install --no-frozen-lockfile --filter ${workspace} --reporter=silent --prefer-offline --network-concurrency=1`, {
        cwd: projectRoot,
        stdio: 'inherit',
        env
      });
    }
    
    logSuccess('Progressive installation completed');
    return true;
    
  } catch (error) {
    logError('Progressive installation failed');
    console.log();
    logWarning('pnpm installation failed even with progressive approach.');
    logInfo('You have two options:');
    console.log('  1. Increase system memory and try again');
    console.log('  2. Use npm as a last resort (not recommended):');
    console.log('     node --max-old-space-size=4096 scripts/setup-worktree.mjs --use-npm');
    return false;
  }
}

// Main setup function
async function setupWorktree() {
  log('Crystal Worktree Setup Script', 'blue');
  log('============================', 'blue');
  console.log();

  // Check if cleanup mode
  if (shouldClean) {
    cleanupEnvironment();
    return;
  }

  try {
    // Step 1: Environment detection
    logInfo('Detecting environment...');
    const isWorktree = isGitWorktree();
    if (isWorktree) {
      logSuccess('Git worktree detected');
    } else {
      logInfo('Running in main repository or standalone directory');
    }

    // Step 2: Validate Node.js version
    logInfo('Checking Node.js version...');
    const nodeVersion = process.version.substring(1); // Remove 'v' prefix
    const requiredNodeVersion = '22.14.0';
    
    if (!isVersionSufficient(nodeVersion, requiredNodeVersion)) {
      throw new Error(
        `Node.js version ${nodeVersion} is below the required version ${requiredNodeVersion}\n` +
        `Please upgrade Node.js to version ${requiredNodeVersion} or higher`
      );
    }
    logSuccess(`Node.js version ${nodeVersion} meets requirement (>=${requiredNodeVersion})`);

    // Check available memory
    const totalMemory = totalmem() / (1024 * 1024 * 1024); // Convert to GB
    if (totalMemory < 8) {
      logWarning(`System has ${totalMemory.toFixed(1)}GB RAM. You may experience memory issues during installation.`);
      logWarning('The setup script will use memory-safe installation options.');
    }

    // Step 3: Package manager detection and validation
    let useNpm = forceNpm;
    
    if (forceNpm) {
      logWarning('--use-npm flag detected. Using npm is not recommended for this project.');
      logWarning('pnpm is required for proper workspace linking.');
    } else {
      logInfo('Checking for pnpm installation...');
      
      if (!commandExists('pnpm')) {
        logError('pnpm is not installed!');
        logInfo('Crystal projects require pnpm for proper workspace management.');
        console.log();
        logInfo('To install pnpm, run:');
        console.log('  npm install -g pnpm');
        console.log();
        logInfo('Or visit https://pnpm.io/installation for other installation methods.');
        
        if (!forceNpm) {
          throw new Error('pnpm is required but not installed. Please install pnpm and try again.');
        }
      } else {
        // Validate pnpm version
        const pnpmVersion = getVersion('pnpm');
        const requiredPnpmVersion = '8.0.0';
        
        if (!pnpmVersion) {
          logWarning('Could not determine pnpm version, proceeding anyway...');
        } else if (!isVersionSufficient(pnpmVersion, requiredPnpmVersion)) {
          throw new Error(
            `pnpm version ${pnpmVersion} is below the required version ${requiredPnpmVersion}\n` +
            `Please upgrade pnpm by running: npm install -g pnpm@latest`
          );
        } else {
          logSuccess(`pnpm version ${pnpmVersion} meets requirement (>=${requiredPnpmVersion})`);
        }
      }
    }

    // Step 4: Install dependencies
    console.log();
    const installSuccess = await installDependencies(useNpm);
    
    if (!installSuccess) {
      throw new Error('Dependency installation failed');
    }

    // Step 5: Install electron app dependencies and rebuild native modules
    console.log();
    logInfo('Installing Electron app dependencies...');
    
    // First run postinstall to set up electron
    const postinstallCmd = useNpm ? 'npm run postinstall' : 'pnpm run postinstall';
    try {
      execSync(postinstallCmd, {
        cwd: projectRoot,
        stdio: 'inherit',
        env: { ...process.env, NODE_OPTIONS: '--max-old-space-size=4096' }
      });
      logSuccess('Electron app dependencies installed');
    } catch (error) {
      logWarning('Failed to install Electron app dependencies, continuing anyway...');
    }
    
    // Now rebuild native modules
    logInfo('Rebuilding native modules for Electron...');
    logInfo('Rebuilding better-sqlite3, node-pty, and other native dependencies...');
    
    const rebuildCmd = useNpm ? 'npm run electron:rebuild' : 'pnpm run electron:rebuild';
    try {
      execSync(rebuildCmd, {
        cwd: projectRoot,
        stdio: 'inherit',
        env: { ...process.env, NODE_OPTIONS: '--max-old-space-size=4096' }
      });
      logSuccess('Native modules rebuilt successfully');
    } catch (error) {
      logWarning('Native module rebuild failed. You may need to run it manually later.');
      logInfo('To rebuild manually, run: pnpm run electron:rebuild');
    }

    // Step 6: Build main process
    console.log();
    logInfo('Building main process TypeScript files...');
    
    const buildCmd = useNpm ? 'npm run build:main' : 'pnpm run build:main';
    execSync(buildCmd, {
      cwd: projectRoot,
      stdio: 'inherit'
    });
    
    logSuccess('Main process built successfully');

    // Success message
    console.log();
    log('=================================', 'green');
    logSuccess('Worktree setup completed successfully!');
    log('=================================', 'green');
    console.log();
    
    if (useNpm) {
      logWarning('npm was used for installation. Workspace features may be limited.');
      logWarning('Consider installing pnpm for better workspace support.');
    }
    
    logInfo(`You can now run the development server with: ${useNpm ? 'npm' : 'pnpm'} run dev`);
    
    console.log();
    logInfo('Crystal Project Settings:');
    console.log(`  Build Script: node --max-old-space-size=4096 scripts/setup-worktree.mjs`);
    console.log(`  Run Command: ${useNpm ? 'npm' : 'pnpm'} run dev`);
    console.log();

  } catch (error) {
    console.log();
    log('=================================', 'red');
    logError('Worktree setup failed!');
    log('=================================', 'red');
    console.log();
    
    if (error.code === 'ENOENT') {
      logError('Command not found. Make sure you have the required tools installed.');
    } else if (error.message) {
      logError(error.message);
    } else {
      logError('An unexpected error occurred:');
      console.error(error);
    }
    
    console.log();
    logInfo('Troubleshooting steps:');
    console.log('  1. Install pnpm: npm install -g pnpm');
    console.log('  2. Run cleanup: node scripts/setup-worktree.mjs --clean');
    console.log('  3. Try again: node --max-old-space-size=4096 scripts/setup-worktree.mjs');
    console.log('  4. Ensure Node.js >=22.14.0 is installed');
    console.log('  5. Check available system memory');
    console.log('  6. Close other applications to free up memory');
    console.log();
    
    process.exit(1);
  }
}

// Run the setup
setupWorktree();