const { execSync } = require('child_process');

// Ensure required environment variables have safe defaults during build
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = 'file:./dev.db';
}
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'medicare-super-secure-production-jwt-secret-key-2026';
}

console.log('>>> [Build Step 1/3] Generating Prisma Client...');
execSync('npx prisma generate', { stdio: 'inherit', env: process.env });

console.log('>>> [Build Step 2/3] Syncing database schema with prisma db push...');
execSync('npx prisma db push --accept-data-loss', { stdio: 'inherit', env: process.env });

console.log('>>> [Build Step 2.5/3] Initializing essential categories, subcategories, and admin...');
try {
  execSync('node prisma/init-essential.js', { stdio: 'inherit', env: process.env });
} catch (err) {
  console.warn('Note: Init essential step warning:', err.message);
}

console.log('>>> [Build Step 3/3] Compiling Next.js production build...');
execSync('npx next build', { stdio: 'inherit', env: process.env });

console.log('>>> [Build Finished] Success!');

