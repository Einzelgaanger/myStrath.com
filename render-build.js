import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// ES Module equivalent for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m'
};

console.log(`${colors.blue}Starting Render deployment build process...${colors.reset}`);

try {
  // Step 1: Build the client-side code
  console.log(`${colors.yellow}Building client-side code...${colors.reset}`);
  try {
    execSync('npx vite build --outDir dist/client', { stdio: 'inherit' });
    console.log(`${colors.green}Client-side build completed successfully!${colors.reset}`);
  } catch (error) {
    console.error(`${colors.red}Error building client-side code:${colors.reset}`, error.message);
    process.exit(1);
  }

  // Step 2: Create dist/server directory if it doesn't exist
  if (!fs.existsSync(path.resolve(__dirname, 'dist/server'))) {
    fs.mkdirSync(path.resolve(__dirname, 'dist/server'), { recursive: true });
  }

  // Step 3: Create a simplified server entry point
  console.log(`${colors.yellow}Creating server entry point...${colors.reset}`);
  const serverEntryPoint = `
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import compression from 'compression';
import helmet from 'helmet';
import cors from 'cors';
import { createServer } from 'http';

// ES Module equivalent for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  try {
    const app = express();
    const port = process.env.PORT || 3000;

    // Enable CORS for all routes
    app.use(cors({
      origin: process.env.CORS_ORIGIN || '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization']
    }));

    // Enable compression
    app.use(compression());

    // Security headers
    app.use(helmet({
      contentSecurityPolicy: false // Disable CSP for development
    }));

    // Parse JSON bodies
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    // Health check endpoint
    app.get("/health", (req, res) => {
      res.json({ status: "ok", timestamp: new Date().toISOString() });
    });

    // Serve static files from the client build directory
    app.use(express.static(path.join(__dirname, "../client")));

    // Handle client-side routing - serve index.html for all other routes
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "../client/index.html"));
    });

    // Start the server
    const httpServer = createServer(app);
    httpServer.listen(port, () => {
      console.log(\`Server running on port \${port}\`);
      console.log(\`Health check available at http://localhost:\${port}/health\`);
    });

    return httpServer;
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
`;

  // Write the server entry point to dist/server/index.js
  fs.writeFileSync(path.resolve(__dirname, 'dist/server/index.js'), serverEntryPoint);
  console.log(`${colors.green}Server entry point created successfully!${colors.reset}`);

  // Step 4: Create health check HTML file
  console.log(`${colors.yellow}Creating health check HTML file...${colors.reset}`);
  const healthCheckHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Health Check - UniSphere</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      margin: 0;
      background-color: #f5f5f5;
    }
    .container {
      text-align: center;
      padding: 2rem;
      background-color: white;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    .status {
      font-size: 1.5rem;
      margin: 1rem 0;
      color: #4caf50;
    }
    .timestamp {
      color: #666;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>UniSphere Health Check</h1>
    <div class="status">Status: OK</div>
    <div class="timestamp">Last checked: <span id="time"></span></div>
    <script>
      document.getElementById('time').textContent = new Date().toLocaleString();
    </script>
  </div>
</body>
</html>
`;

  // Create health check HTML file
  fs.writeFileSync(path.resolve(__dirname, 'dist/health.html'), healthCheckHtml);
  console.log(`${colors.green}Health check HTML file created successfully!${colors.reset}`);

  // Step 5: Ensure client/index.html exists
  if (!fs.existsSync(path.resolve(__dirname, 'dist/client/index.html'))) {
    console.log(`${colors.yellow}Creating index.html in dist/client...${colors.reset}`);
    const indexHtml = `<!DOCTYPE html>
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
</html>`;
    fs.writeFileSync(path.resolve(__dirname, 'dist/client/index.html'), indexHtml);
    console.log(`${colors.green}index.html created in dist/client${colors.reset}`);
  }

  console.log(`${colors.green}Render deployment build completed successfully!${colors.reset}`);
} catch (error) {
  console.error(`${colors.red}Build failed:${colors.reset}`, error);
  process.exit(1);
}
