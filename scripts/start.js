const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Load DATABASE_URL from .env if not provided in environment
if (!process.env.DATABASE_URL) {
  const envPath = path.join(__dirname, '../.env');
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf-8').split('\n');
    for (const line of lines) {
      const match = line.match(/^\s*DATABASE_URL\s*=\s*["']?([^"'\r\n]+)["']?/);
      if (match) {
        process.env.DATABASE_URL = match[1];
        break;
      }
    }
  }
}
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'healora_super_secure_jwt_secret_key_2026';
}

const port = process.env.PORT || '3000';
process.env.PORT = port;
process.env.HOSTNAME = '0.0.0.0';

console.log(`>>> [Production Server] Starting Next.js on 0.0.0.0:${port}...`);

const child = spawn('npx', ['next', 'start', '-H', '0.0.0.0', '-p', port], {
  stdio: 'inherit',
  env: process.env,
  shell: true,
});

child.on('error', (err) => {
  console.error('Failed to start Next.js process:', err);
  process.exit(1);
});

child.on('exit', (code) => {
  process.exit(code || 0);
});
