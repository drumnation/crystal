#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const RESET = '\x1b[0m';
const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const BLUE = '\x1b[34m';
const BOLD = '\x1b[1m';

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

function validateNodeVersion() {
  header('Validating Node.js Version');
  
  const nvmrcPath = path.join(process.cwd(), '.nvmrc');
  if (!fs.existsSync(nvmrcPath)) {
    error('No .nvmrc file found');
    return false;
  }
  
  const expectedVersion = fs.readFileSync(nvmrcPath, 'utf8').trim();
  const currentVersion = process.version.slice(1); // Remove 'v' prefix
  
  if (currentVersion !== expectedVersion) {
    error(`Node.js version mismatch:`);
    error(`  Expected: ${expectedVersion} (from .nvmrc)`);
    error(`  Current:  ${currentVersion}`);
    error('');
    error('Please install the correct Node.js version:');
    error('  Using nvm: nvm install && nvm use');
    error('  Using asdf: asdf install nodejs && asdf local nodejs ' + expectedVersion);
    error('  Using fnm: fnm install && fnm use');
    return false;
  }
  
  success(`Node.js version ${currentVersion} ✓`);
  return true;
}

function validatePnpmVersion() {
  header('Validating pnpm Version');
  
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  if (!fs.existsSync(packageJsonPath)) {
    error('No package.json file found');
    return false;
  }
  
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  const packageManager = packageJson.packageManager;
  
  if (!packageManager || !packageManager.startsWith('pnpm@')) {
    error('No pnpm version specified in package.json packageManager field');
    return false;
  }
  
  const expectedVersion = packageManager.split('@')[1].split('+')[0];
  
  try {
    const currentVersion = execSync('pnpm --version', { encoding: 'utf8' }).trim();
    
    if (currentVersion !== expectedVersion) {
      error(`pnpm version mismatch:`);
      error(`  Expected: ${expectedVersion} (from package.json)`);
      error(`  Current:  ${currentVersion}`);
      error('');
      error('Please install the correct pnpm version:');
      error('  Enable corepack: corepack enable');
      error('  Or install manually: npm install -g pnpm@' + expectedVersion);
      return false;
    }
    
    success(`pnpm version ${currentVersion} ✓`);
    return true;
  } catch (err) {
    error('pnpm is not installed or not in PATH');
    error('Install pnpm:');
    error('  Enable corepack: corepack enable');
    error('  Or install manually: npm install -g pnpm');
    return false;
  }
}

function validateSystemDependencies() {
  header('Validating System Dependencies');
  
  let allValid = true;
  
  // Check for Python
  try {
    const pythonVersion = execSync('python3 --version', { encoding: 'utf8', stdio: 'pipe' }).trim();
    success(`Python: ${pythonVersion} ✓`);
  } catch (err) {
    try {
      const pythonVersion = execSync('python --version', { encoding: 'utf8', stdio: 'pipe' }).trim();
      if (pythonVersion.includes('Python 3')) {
        success(`Python: ${pythonVersion} ✓`);
      } else {
        error('Python 3 is required but Python 2 found');
        error('Install Python 3:');
        error('  macOS: brew install python3');
        error('  Ubuntu/Debian: sudo apt-get install python3');
        error('  CentOS/RHEL: sudo yum install python3');
        allValid = false;
      }
    } catch (err2) {
      error('Python is not installed or not in PATH');
      error('Install Python 3:');
      error('  macOS: brew install python3');
      error('  Ubuntu/Debian: sudo apt-get install python3');
      error('  CentOS/RHEL: sudo yum install python3');
      error('  Windows: Download from https://python.org');
      allValid = false;
    }
  }
  
  // Check for build tools (platform-specific)
  const platform = process.platform;
  
  if (platform === 'darwin') {
    // macOS - check for Xcode command line tools
    try {
      execSync('xcode-select -p', { stdio: 'pipe' });
      success('Xcode Command Line Tools ✓');
    } catch (err) {
      error('Xcode Command Line Tools not installed');
      error('Install with: xcode-select --install');
      allValid = false;
    }
  } else if (platform === 'linux') {
    // Linux - check for build-essential
    try {
      execSync('which gcc', { stdio: 'pipe' });
      execSync('which g++', { stdio: 'pipe' });
      execSync('which make', { stdio: 'pipe' });
      success('Build tools (gcc, g++, make) ✓');
    } catch (err) {
      error('Build tools not installed');
      error('Install build tools:');
      error('  Ubuntu/Debian: sudo apt-get install build-essential');
      error('  CentOS/RHEL: sudo yum groupinstall "Development Tools"');
      error('  Fedora: sudo dnf groupinstall "Development Tools"');
      allValid = false;
    }
  } else if (platform === 'win32') {
    // Windows - check for Visual Studio Build Tools
    warning('Windows build tools validation not implemented');
    warning('Ensure Visual Studio Build Tools are installed');
    info('Download from: https://visualstudio.microsoft.com/visual-cpp-build-tools/');
  }
  
  // Check for git
  try {
    const gitVersion = execSync('git --version', { encoding: 'utf8', stdio: 'pipe' }).trim();
    success(`Git: ${gitVersion} ✓`);
  } catch (err) {
    error('Git is not installed or not in PATH');
    error('Install Git:');
    error('  macOS: brew install git');
    error('  Ubuntu/Debian: sudo apt-get install git');
    error('  CentOS/RHEL: sudo yum install git');
    error('  Windows: Download from https://git-scm.com');
    allValid = false;
  }
  
  return allValid;
}

function validateNodeGyp() {
  header('Validating node-gyp');
  
  try {
    // Try to run node-gyp configure in a temporary directory
    const tempDir = fs.mkdtempSync(path.join(require('os').tmpdir(), 'crystal-gyp-test-'));
    
    try {
      // Create a minimal package.json and binding.gyp for testing
      fs.writeFileSync(path.join(tempDir, 'package.json'), JSON.stringify({
        name: 'test',
        version: '1.0.0',
        gypfile: true
      }));
      
      fs.writeFileSync(path.join(tempDir, 'binding.gyp'), JSON.stringify({
        targets: [{
          target_name: 'test',
          sources: []
        }]
      }));
      
      execSync('npx node-gyp configure', { 
        cwd: tempDir, 
        stdio: 'pipe',
        timeout: 10000
      });
      
      success('node-gyp can run successfully ✓');
      return true;
    } finally {
      // Clean up temp directory
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  } catch (err) {
    error('node-gyp cannot run properly');
    error('This may indicate missing build tools or configuration issues');
    warning('Native modules may fail to compile');
    return false;
  }
}

function main() {
  log(`${BOLD}${BLUE}Crystal Development Environment Validation${RESET}`);
  log('='.repeat(50));
  
  const validations = [
    validateNodeVersion,
    validatePnpmVersion,
    validateSystemDependencies,
    validateNodeGyp
  ];
  
  let allPassed = true;
  
  for (const validation of validations) {
    const result = validation();
    allPassed = allPassed && result;
  }
  
  log('\n' + '='.repeat(50));
  
  if (allPassed) {
    success(`${BOLD}All environment validations passed! ✅${RESET}`);
    success('You can proceed with: pnpm run bootstrap');
    process.exit(0);
  } else {
    error(`${BOLD}Environment validation failed! ❌${RESET}`);
    error('Please fix the issues above before proceeding');
    process.exit(1);
  }
}

// Run validation if this script is executed directly
if (require.main === module) {
  main();
}

module.exports = {
  validateNodeVersion,
  validatePnpmVersion,
  validateSystemDependencies,
  validateNodeGyp
};