#!/usr/bin/env node

const http = require('http');
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

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    timeout: 30000, // 30 seconds default
    port: 4521,
    host: 'localhost',
    format: 'human', // 'human' or 'json'
    retries: 3,
    retryDelay: 2000 // 2 seconds between retries
  };
  
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    switch (arg) {
      case '--timeout':
        options.timeout = parseInt(args[++i]) || options.timeout;
        break;
      case '--port':
        options.port = parseInt(args[++i]) || options.port;
        break;
      case '--host':
        options.host = args[++i] || options.host;
        break;
      case '--format':
        options.format = args[++i] || options.format;
        break;
      case '--retries':
        options.retries = parseInt(args[++i]) || options.retries;
        break;
      case '--retry-delay':
        options.retryDelay = parseInt(args[++i]) || options.retryDelay;
        break;
      case '--help':
        console.log(`
Crystal Development Server Health Check

Usage: node dev-health-check.js [options]

Options:
  --timeout <ms>      Maximum time to wait for server (default: 30000)
  --port <port>       Port to check (default: 4521)
  --host <host>       Host to check (default: localhost)
  --format <format>   Output format: human|json (default: human)
  --retries <count>   Number of retry attempts (default: 3)
  --retry-delay <ms>  Delay between retries (default: 2000)
  --help              Show this help message

Exit codes:
  0  - Server is healthy
  1  - Server is not responding
  2  - Server responded but content is invalid
  3  - Invalid arguments or configuration
`);
        process.exit(0);
      default:
        if (arg.startsWith('--')) {
          error(`Unknown option: ${arg}`);
          process.exit(3);
        }
    }
  }
  
  return options;
}

function checkPortAvailability(host, port, timeout) {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error(`Timeout after ${timeout}ms`));
    }, timeout);
    
    const req = http.get({
      hostname: host,
      port: port,
      path: '/',
      timeout: timeout
    }, (res) => {
      clearTimeout(timeoutId);
      
      let data = '';
      res.on('data', chunk => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data
        });
      });
    });
    
    req.on('error', (err) => {
      clearTimeout(timeoutId);
      reject(err);
    });
    
    req.on('timeout', () => {
      clearTimeout(timeoutId);
      req.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

function validateResponse(response) {
  const { statusCode, headers, body } = response;
  
  // Check for successful HTTP status
  if (statusCode !== 200) {
    return {
      valid: false,
      reason: `HTTP ${statusCode}`
    };
  }
  
  // Check for HTML content (should be a React app)
  if (!headers['content-type'] || !headers['content-type'].includes('text/html')) {
    return {
      valid: false,
      reason: `Unexpected content-type: ${headers['content-type']}`
    };
  }
  
  // Check for basic HTML structure
  if (!body.includes('<html') || !body.includes('<div id="root">')) {
    return {
      valid: false,
      reason: 'Response does not contain expected HTML structure'
    };
  }
  
  // Check for Crystal-specific elements
  if (!body.includes('Crystal') && !body.includes('claude-code')) {
    return {
      valid: false,
      reason: 'Response does not contain Crystal application markers'
    };
  }
  
  return { valid: true };
}

function checkProcesses() {
  const processes = [];
  
  try {
    // Check for Node.js processes that might be Crystal
    const output = execSync('ps aux | grep -E "(node|electron)" | grep -v grep', { 
      encoding: 'utf8',
      stdio: 'pipe'
    });
    
    const lines = output.split('\n').filter(line => line.trim());
    
    for (const line of lines) {
      if (line.includes('electron') || line.includes('crystal') || line.includes('4521')) {
        processes.push(line.trim());
      }
    }
  } catch (err) {
    // ps command failed or no processes found
  }
  
  return processes;
}

async function performHealthCheck(options) {
  const { host, port, timeout, retries, retryDelay } = options;
  
  let lastError;
  let attempt = 0;
  
  while (attempt <= retries) {
    try {
      if (attempt > 0) {
        info(`Retry attempt ${attempt}/${retries}...`);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      }
      
      const response = await checkPortAvailability(host, port, timeout);
      const validation = validateResponse(response);
      
      if (!validation.valid) {
        throw new Error(validation.reason);
      }
      
      return {
        healthy: true,
        statusCode: response.statusCode,
        responseTime: Date.now(),
        attempt: attempt + 1
      };
      
    } catch (err) {
      lastError = err;
      attempt++;
      
      if (attempt <= retries) {
        warning(`Attempt ${attempt} failed: ${err.message}`);
      }
    }
  }
  
  return {
    healthy: false,
    error: lastError.message,
    attempts: attempt
  };
}

async function main() {
  const options = parseArgs();
  const startTime = Date.now();
  
  if (options.format === 'human') {
    log(`${BOLD}${BLUE}Crystal Development Server Health Check${RESET}`);
    log('='.repeat(50));
    info(`Checking ${options.host}:${options.port}`);
    info(`Timeout: ${options.timeout}ms, Retries: ${options.retries}`);
  }
  
  try {
    const result = await performHealthCheck(options);
    const endTime = Date.now();
    const totalTime = endTime - startTime;
    
    if (result.healthy) {
      if (options.format === 'json') {
        console.log(JSON.stringify({
          status: 'healthy',
          host: options.host,
          port: options.port,
          responseTime: totalTime,
          attempt: result.attempt,
          timestamp: new Date().toISOString()
        }));
      } else {
        success(`Development server is healthy! ✅`);
        success(`Response time: ${totalTime}ms`);
        if (result.attempt > 1) {
          info(`Success on attempt ${result.attempt}`);
        }
      }
      
      process.exit(0);
      
    } else {
      const processes = checkProcesses();
      
      if (options.format === 'json') {
        console.log(JSON.stringify({
          status: 'unhealthy',
          host: options.host,
          port: options.port,
          error: result.error,
          attempts: result.attempts,
          processes: processes,
          timestamp: new Date().toISOString()
        }));
      } else {
        error(`Development server is not healthy! ❌`);
        error(`Error: ${result.error}`);
        error(`Failed after ${result.attempts} attempts`);
        
        if (processes.length > 0) {
          warning('Related processes found:');
          processes.forEach(proc => {
            warning(`  ${proc}`);
          });
        } else {
          error('No related processes found');
          error('The development server may not be running');
        }
        
        log('');
        error('Troubleshooting steps:');
        error('  1. Start the development server: pnpm run dev');
        error('  2. Check for port conflicts: lsof -i :4521');
        error('  3. Verify environment: pnpm run validate-env');
        error('  4. Check logs for error messages');
      }
      
      process.exit(1);
    }
    
  } catch (err) {
    if (options.format === 'json') {
      console.log(JSON.stringify({
        status: 'error',
        error: err.message,
        timestamp: new Date().toISOString()
      }));
    } else {
      error(`Health check failed: ${err.message}`);
    }
    
    process.exit(3);
  }
}

// Run health check if this script is executed directly
if (require.main === module) {
  main();
}

module.exports = { main, checkPortAvailability, validateResponse, parseArgs };