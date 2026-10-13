const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Load variables from .env if not already provided in environment
const envPath = path.join(__dirname, '../.env');
if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, 'utf-8').split('\n');
  for (const line of lines) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*["']?([^"'\r\n]*)["']?/);
    if (match && !process.env[match[1]]) {
      process.env[match[1]] = match[2];
    }
  }
}

console.log('>>> [Build Step 1/2] Generating Prisma Client...');
execSync('npx prisma generate', { stdio: 'inherit', env: process.env });

console.log('>>> [Build Step 2/2] Compiling Next.js production build...');
execSync('npx next build', { stdio: 'inherit', env: process.env });

console.log('>>> [Build Finished] Success!');
