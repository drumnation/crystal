#!/usr/bin/env node

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const { validateNodeVersion, validatePnpmVersion, validateSystemDependencies, validateNodeGyp } = require('./validate-environment');

const RESET = '\x1b[0m';
const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const BLUE = '\x1b[34m';
const BOLD = '\x1b[1m';
const DIM = '\x1b[2m';

function log(message, color = RESET) {
  console.log(`${color}${message}${RESET}`);
}

function error(message) {
  log(`❌ ${message}`, RED);
}

function success(message) {
  log(`✅ ${message}`, GREEN);
}

function warning(message) {
  log(`⚠️  ${message}`, YELLOW);
}

function info(message) {
  log(`ℹ️  ${message}`, BLUE);
}

function header(message) {
  log(`\n${BOLD}${message}${RESET}`, BLUE);
}

function step(message) {
  log(`${BOLD}▶ ${message}${RESET}`, BLUE);
}

function substep(message) {
  log(`  ${DIM}${message}${RESET}`);
}

function runCommand(command, options = {}) {
  const { cwd = process.cwd(), timeout = 300000 } = options; // 5 minute default timeout
  
  try {
    substep(`Running: ${command}`);
    const output = execSync(command, {
      cwd,
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
      timeout
    });
    
    if (output && output.trim()) {
      substep(`Output: ${output.trim()}`);
    }
    
    return output;
  } catch (err) {
    error(`Command failed: ${command}`);
    if (err.stdout) {
      error(`stdout: ${err.stdout}`);
    }
    if (err.stderr) {
      error(`stderr: ${err.stderr}`);
    }
    throw err;
  }
}

function validateEnvironment() {
  header('Step 1: Environment Validation');
  
  const validations = [
    { name: 'Node.js version', fn: validateNodeVersion },
    { name: 'pnpm version', fn: validatePnpmVersion },
    { name: 'System dependencies', fn: validateSystemDependencies },
    { name: 'node-gyp functionality', fn: validateNodeGyp }
  ];
  
  let allPassed = true;
  
  for (const { name, fn } of validations) {
    substep(`Validating ${name}...`);
    const result = fn();
    if (!result) {
      allPassed = false;
    }
  }
  
  if (!allPassed) {
    error('Environment validation failed. Please fix the issues above.');
    process.exit(1);
  }
  
  success('Environment validation passed');
}

function installDependencies() {
  header('Step 2: Installing Dependencies');
  
  step('Installing workspace dependencies...');
  
  // Check if pnpm-lock.yaml exists and is up to date
  const lockfilePath = path.join(process.cwd(), 'pnpm-lock.yaml');
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  
  if (fs.existsSync(lockfilePath) && fs.existsSync(packageJsonPath)) {
    const lockStat = fs.statSync(lockfilePath);
    const packageStat = fs.statSync(packageJsonPath);
    
    if (packageStat.mtime > lockStat.mtime) {
      warning('package.json is newer than pnpm-lock.yaml');
      warning('This may indicate dependency changes that need to be resolved');
    }
  }
  
  try {
    // Use frozen-lockfile to ensure deterministic installs
    runCommand('pnpm install --frozen-lockfile', { timeout: 600000 }); // 10 minutes for install
    success('Dependencies installed successfully');
  } catch (err) {
    error('Failed to install dependencies with frozen lockfile');
    warning('Attempting to install with lockfile update...');
    
    try {
      runCommand('pnpm install', { timeout: 600000 });
      warning('Dependencies installed with lockfile update');
      warning('Consider committing the updated pnpm-lock.yaml');
    } catch (installErr) {
      error('Failed to install dependencies');
      error('Common solutions:');
      error('  1. Clear node_modules: rm -rf node_modules');
      error('  2. Clear pnpm cache: pnpm store prune');
      error('  3. Check network connectivity');
      error('  4. Verify package.json syntax');
      throw installErr;
    }
  }
}

function rebuildNativeModules() {
  header('Step 3: Rebuilding Native Modules');
  
  step('Building main process...');
  try {
    runCommand('pnpm run build:main');
    success('Main process built successfully');
  } catch (err) {
    error('Failed to build main process');
    throw err;
  }
  
  step('Rebuilding Electron native modules...');
  try {
    runCommand('pnpm run electron:rebuild');
    success('Native modules rebuilt successfully');
  } catch (err) {
    error('Failed to rebuild native modules');
    error('Common solutions:');
    error('  1. Ensure Python and build tools are installed');
    error('  2. Clear electron cache: npx electron-rebuild --force');
    error('  3. Check for platform-specific build requirements');
    throw err;
  }
  
  // Validate that critical native modules are working
  step('Validating native modules...');
  validateNativeModules();
}

function validateNativeModules() {
  const criticalModules = [
    { name: 'better-sqlite3', path: 'main/node_modules/better-sqlite3' },
    { name: '@homebridge/node-pty-prebuilt-multiarch', path: 'node_modules/@homebridge/node-pty-prebuilt-multiarch' }
  ];
  
  for (const module of criticalModules) {
    try {
      substep(`Checking ${module.name}...`);
      
      // Try to require the module
      const modulePath = path.join(process.cwd(), module.path);
      if (!fs.existsSync(modulePath)) {
        warning(`Module ${module.name} not found at expected path`);
        continue;
      }
      
      // For better-sqlite3, try to create a test database
      if (module.name === 'better-sqlite3') {
        const Database = require(path.join(modulePath, 'lib/index.js'));
        const db = new Database(':memory:');
        db.exec('CREATE TABLE test (id INTEGER)');
        db.close();
        substep(`${module.name} working correctly`);
      }
      
      // For node-pty, try to check if it can be loaded
      if (module.name === '@homebridge/node-pty-prebuilt-multiarch') {
        require(path.join(modulePath, 'lib/index.js'));
        substep(`${module.name} working correctly`);
      }
      
    } catch (err) {
      warning(`Failed to validate ${module.name}: ${err.message}`);
      warning('This may cause runtime issues');
    }
  }
}

function validateDevEnvironment() {
  header('Step 4: Development Environment Validation');
  
  step('Starting development server validation...');
  
  return new Promise((resolve, reject) => {
    let frontendStarted = false;
    let electronStarted = false;
    let timeout;
    
    const cleanup = () => {
      if (timeout) {
        clearTimeout(timeout);
      }
    };
    
    // Set a timeout for the validation
    timeout = setTimeout(() => {
      cleanup();
      reject(new Error('Development server validation timed out after 60 seconds'));
    }, 60000);
    
    substep('Starting frontend development server...');
    
    // Start the development server
    const devProcess = spawn('pnpm', ['run', 'electron-dev'], {
      stdio: ['pipe', 'pipe', 'pipe'],
      cwd: process.cwd()
    });
    
    let output = '';
    
    devProcess.stdout.on('data', (data) => {
      const text = data.toString();
      output += text;
      
      // Check for frontend ready
      if (text.includes('Local:') && text.includes('4521') && !frontendStarted) {
        frontendStarted = true;
        substep('Frontend server started on port 4521');
      }
      
      // Check for Electron ready
      if (text.includes('Electron') && frontendStarted && !electronStarted) {
        electronStarted = true;
        substep('Electron application started');
        
        // Give it a moment to fully initialize
        setTimeout(() => {
          cleanup();
          devProcess.kill('SIGTERM');
          
          // Force kill if it doesn't terminate gracefully
          setTimeout(() => {
            if (!devProcess.killed) {
              devProcess.kill('SIGKILL');
            }
          }, 5000);
          
          resolve();
        }, 3000);
      }
    });
    
    devProcess.stderr.on('data', (data) => {
      const text = data.toString();
      output += text;
      
      // Check for common error patterns
      if (text.includes('Error:') || text.includes('EADDRINUSE')) {
        cleanup();
        devProcess.kill('SIGTERM');
        reject(new Error(`Development server failed to start: ${text}`));
      }
    });
    
    devProcess.on('error', (err) => {
      cleanup();
      reject(err);
    });
    
    devProcess.on('exit', (code) => {
      cleanup();
      
      if (code !== 0 && code !== null && !frontendStarted) {
        reject(new Error(`Development server exited with code ${code}. Output: ${output}`));
      } else if (frontendStarted && electronStarted) {
        resolve();
      }
    });
  });
}

async function main() {
  const startTime = Date.now();
  
  log(`${BOLD}${BLUE}Crystal Development Environment Bootstrap${RESET}`);
  log('='.repeat(60));
  
  try {
    validateEnvironment();
    installDependencies();
    rebuildNativeModules();
    
    await validateDevEnvironment();
    success('Development server validation passed');
    
    const endTime = Date.now();
    const duration = Math.round((endTime - startTime) / 1000);
    
    log('\n' + '='.repeat(60));
    success(`${BOLD}Bootstrap completed successfully! ✅${RESET}`);
    success(`Total time: ${duration} seconds`);
    log('');
    info('You can now start development with:');
    info('  pnpm run dev');
    log('');
    info('Other useful commands:');
    info('  pnpm run validate-env     - Validate environment');
    info('  pnpm run dev-health       - Check dev server health');
    info('  pnpm run lint             - Run linting');
    info('  pnpm run typecheck        - Run type checking');
    info('  pnpm run test             - Run tests');
    
  } catch (err) {
    const endTime = Date.now();
    const duration = Math.round((endTime - startTime) / 1000);
    
    log('\n' + '='.repeat(60));
    error(`${BOLD}Bootstrap failed! ❌${RESET}`);
    error(`Time elapsed: ${duration} seconds`);
    error(`Error: ${err.message}`);
    log('');
    error('Troubleshooting steps:');
    error('  1. Run: pnpm run validate-env');
    error('  2. Clear caches: rm -rf node_modules && pnpm store prune');
    error('  3. Check the error messages above');
    error('  4. Ensure all system dependencies are installed');
    
    process.exit(1);
  }
}

// Run bootstrap if this script is executed directly
if (require.main === module) {
  main();
}

module.exports = { main };