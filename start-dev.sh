#!/bin/bash
# This script starts the development environment with the correct port

# Set environment variables
export PORT=5000
export VITE_PORT=5000
export HOST=0.0.0.0
export VITE_HOST=0.0.0.0

# Start the Vite development server with the correct port and host
npx vite --port=5000 --host=0.0.0.0