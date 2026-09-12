const { execSync } = require('child_process');
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
  process.env.JWT_SECRET = 'medicare-super-secure-production-jwt-secret-key-2026';
}

console.log('>>> [Build Step 1/2] Generating Prisma Client...');
execSync('npx prisma generate', { stdio: 'inherit', env: process.env });

console.log('>>> [Build Step 2/2] Compiling Next.js production build...');
execSync('npx next build', { stdio: 'inherit', env: process.env });

console.log('>>> [Build Finished] Success!');
