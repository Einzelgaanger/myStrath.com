// Custom server starter script to set up environment and start the server
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

// Define environment variables
const env = {
  ...process.env,
  PORT: '5000',
  HOST: '0.0.0.0',
  VITE_PORT: '5000',
  VITE_HOST: '0.0.0.0'
};

// Get the directory of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('Starting server with custom environment...');
console.log(`PORT: ${env.PORT}`);
console.log(`HOST: ${env.HOST}`);

// Start the vite dev server with the custom environment and force port and host
const vite = spawn('vite', ['--port=5000', '--host=0.0.0.0'], {
  env,
  stdio: 'inherit',
  shell: true,
  cwd: process.cwd()
});

// Handle process events
vite.on('error', (err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

vite.on('exit', (code) => {
  console.log(`Server process exited with code ${code}`);
  process.exit(code);
});

// Handle termination signals
process.on('SIGINT', () => {
  console.log('Received SIGINT, shutting down...');
  vite.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('Received SIGTERM, shutting down...');
  vite.kill('SIGTERM');
});