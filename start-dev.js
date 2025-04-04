// Custom dev script to ensure the Vite server runs on port 5000
import { spawn } from 'child_process';

// Configure environment variables
process.env.PORT = '5000';
process.env.VITE_PORT = '5000';
process.env.HOST = '0.0.0.0';
process.env.VITE_HOST = '0.0.0.0';

console.log('Starting development server with custom configuration:');
console.log(`PORT: ${process.env.PORT}`);
console.log(`HOST: ${process.env.HOST}`);

// Start the dev script from package.json with --port and --host flags explicitly set
const child = spawn('npx', ['vite', '--port=5000', '--host=0.0.0.0'], {
  stdio: 'inherit',
  shell: true,
  env: process.env
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('Shutting down development server...');
  child.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('Shutting down development server...');
  child.kill('SIGTERM');
});

// Handle child process events
child.on('error', (err) => {
  console.error('Failed to start development server:', err);
  process.exit(1);
});

child.on('exit', (code) => {
  if (code !== 0) {
    console.error(`Development server exited with code ${code}`);
  }
  process.exit(code);
});