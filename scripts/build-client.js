import { execSync } from 'child_process';

console.log('Starting client build...');

try {
  // Use the Vite CLI directly
  execSync('npx vite build', { 
    stdio: 'inherit',
    env: { ...process.env, NODE_ENV: 'production' }
  });
  console.log('Client build completed successfully!');
} catch (error) {
  console.error('Client build failed:', error.message);
  process.exit(1);
}
