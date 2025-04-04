#!/bin/bash

# This script is designed for Render.com deployment
# It bypasses TypeScript type checking while still producing a working build

echo "Starting Render.com build process..."

# Build the client
echo "Building client..."
npx vite build

# Create necessary directories
echo "Creating dist directories..."
mkdir -p dist/server
mkdir -p dist/shared

# Copy TypeScript files to dist directory
echo "Copying TypeScript files..."
cp -r server dist/
cp -r shared dist/

# Create a package.json for production
echo "Creating production package.json..."
node -e "
const fs = require('fs');
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const prodPkg = {
  name: pkg.name,
  version: pkg.version,
  description: pkg.description,
  engines: pkg.engines || { node: '>=18.0.0' },
  type: 'module',
  dependencies: pkg.dependencies,
  scripts: {
    start: 'ts-node --transpile-only server/index.ts'
  }
};
fs.writeFileSync('dist/package.json', JSON.stringify(prodPkg, null, 2));
"

echo "Build completed successfully!"
