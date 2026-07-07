const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const isWindows = process.platform === 'win32';

let pythonPath = 'python';
const venvPath = path.join(__dirname, '.venv');

if (fs.existsSync(venvPath)) {
  if (isWindows) {
    pythonPath = path.join(venvPath, 'Scripts', 'python.exe');
  } else {
    pythonPath = path.join(venvPath, 'bin', 'python');
  }
} else {
  pythonPath = isWindows ? 'python' : 'python3';
}

// Load environment variables from root .env manually to avoid dependency issues
const envPath = path.join(__dirname, '.env');
const env = {};
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      const key = match[1];
      let value = match[2] || '';
      // Remove quotes if present
      if (value.length > 0 && value.charAt(0) === '"' && value.charAt(value.length - 1) === '"') {
        value = value.substring(1, value.length - 1);
      } else if (value.length > 0 && value.charAt(0) === "'" && value.charAt(value.length - 1) === "'") {
        value = value.substring(1, value.length - 1);
      }
      env[key] = value.trim();
    }
  });
}

// Propagate env variables to child process
Object.keys(env).forEach(key => {
  if (!process.env[key]) {
    process.env[key] = env[key];
  }
});

const deepevalPort = process.env.DEEPEVAL_PORT || env.DEEPEVAL_PORT || '8002';

console.log(`📡 Starting Python evaluation server using interpreter: ${pythonPath}`);