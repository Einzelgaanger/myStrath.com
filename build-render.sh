#!/bin/bash

# Exit on error
set -e

echo "Starting build process for Render..."

# Install dependencies
echo "Installing dependencies..."
npm install

# Install Tailwind plugins explicitly
echo "Installing Tailwind plugins..."
npm install --save-dev tailwindcss-animate@1.0.7 @tailwindcss/typography@0.5.10

# Build the application using our simplified render build script
echo "Building application..."
npm run render-build

# Create dist/client directory if it doesn't exist
echo "Creating dist/client directory..."
mkdir -p dist/client

# Create a simple health check endpoint
echo "Creating health check endpoint..."
echo '<!DOCTYPE html><html><head><title>Health Check</title></head><body><h1>OK</h1></body></html>' > dist/client/health.html

# Create a simple server.js file in the root
echo "Creating server.js file..."
cat > server.js << 'EOL'
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import compression from 'compression';
import helmet from 'helmet';
import cors from 'cors';

// ES Module equivalent for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Enable compression
app.use(compression());

// Set security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://sdsy2.onrender.com"],
      fontSrc: ["'self'", "data:", "https:"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
}));

// Enable CORS
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'https://sdsy2.onrender.com',
  credentials: true,
}));

// Set proper MIME types for JavaScript modules
app.use((req, res, next) => {
  if (req.url.endsWith('.js')) {
    res.type('application/javascript');
  }
  next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Health check HTML endpoint
app.get('/health', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/client/health.html'));
});

// Serve static files from the client build
app.use(express.static(path.join(__dirname, 'dist/client'), {
  setHeaders: (res, path) => {
    if (path.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript');
    }
  }
}));

// For all other routes, serve the index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/client/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
EOL

# Create a simple server entry point in dist/server
echo "Creating server entry point..."
mkdir -p dist/server
cat > dist/server/index.js << 'EOL'
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import compression from 'compression';
import helmet from 'helmet';
import cors from 'cors';

// ES Module equivalent for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Enable compression
app.use(compression());

// Set security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://sdsy2.onrender.com"],
      fontSrc: ["'self'", "data:", "https:"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
}));

// Enable CORS
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'https://sdsy2.onrender.com',
  credentials: true,
}));

// Set proper MIME types for JavaScript modules
app.use((req, res, next) => {
  if (req.url.endsWith('.js')) {
    res.type('application/javascript');
  }
  next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Health check HTML endpoint
app.get('/health', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/health.html'));
});

// Serve static files from the client build
app.use(express.static(path.join(__dirname, '../client'), {
  setHeaders: (res, path) => {
    if (path.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript');
    }
  }
}));

// For all other routes, serve the index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
EOL

# Create a simple index.html file in dist/client if it doesn't exist
echo "Checking if index.html exists in dist/client..."
if [ ! -f "dist/client/index.html" ]; then
  echo "Creating index.html in dist/client..."
  cat > dist/client/index.html << 'EOL'
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>UniSphere - University Learning Platform</title>
    <link rel="stylesheet" href="/assets/index.css">
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/assets/index.js"></script>
  </body>
</html>
EOL
  echo "index.html created in dist/client"
else
  echo "index.html already exists in dist/client"
fi

# Check if the client build created the necessary files
echo "Checking client build output..."
if [ -d "dist/client/assets" ]; then
  echo "Client build assets directory exists"
  ls -la dist/client/assets
else
  echo "Client build assets directory does not exist, creating it..."
  mkdir -p dist/client/assets
fi

# Create a simple index.js file in dist/client/assets if it doesn't exist
echo "Checking if index.js exists in dist/client/assets..."
if [ ! -f "dist/client/assets/index.js" ]; then
  echo "Creating index.js in dist/client/assets..."
  cat > dist/client/assets/index.js << 'EOL'
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
EOL
  echo "index.js created in dist/client/assets"
else
  echo "index.js already exists in dist/client/assets"
fi

# Create a simple App.js file in dist/client/assets if it doesn't exist
echo "Checking if App.js exists in dist/client/assets..."
if [ ! -f "dist/client/assets/App.js" ]; then
  echo "Creating App.js in dist/client/assets..."
  cat > dist/client/assets/App.js << 'EOL'
import React from 'react';

function App() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-4xl font-bold text-gray-800 mb-4">UniSphere</h1>
      <p className="text-xl text-gray-600">University Learning Platform</p>
    </div>
  );
}

export default App;
EOL
  echo "App.js created in dist/client/assets"
else
  echo "App.js already exists in dist/client/assets"
fi

# Create a simple index.css file in dist/client/assets if it doesn't exist
echo "Checking if index.css exists in dist/client/assets..."
if [ ! -f "dist/client/assets/index.css" ]; then
  echo "Creating index.css in dist/client/assets..."
  cat > dist/client/assets/index.css << 'EOL'
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
EOL
  echo "index.css created in dist/client/assets"
else
  echo "index.css already exists in dist/client/assets"
fi

echo "Build completed successfully!"
