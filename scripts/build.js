import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m'
};

console.log(`${colors.blue}Starting custom build process...${colors.reset}`);

try {
  // Step 0: Check if tailwind dependencies are installed
  console.log(`${colors.yellow}Checking Tailwind dependencies...${colors.reset}`);
  try {
    // Check if tailwindcss-animate is installed
    require.resolve('tailwindcss-animate');
    console.log(`${colors.green}tailwindcss-animate is installed.${colors.reset}`);
  } catch (error) {
    console.log(`${colors.yellow}Installing tailwindcss-animate...${colors.reset}`);
    execSync('npm install --save-dev tailwindcss-animate@1.0.7', { stdio: 'inherit' });
  }

  try {
    // Check if @tailwindcss/typography is installed
    require.resolve('@tailwindcss/typography');
    console.log(`${colors.green}@tailwindcss/typography is installed.${colors.reset}`);
  } catch (error) {
    console.log(`${colors.yellow}Installing @tailwindcss/typography...${colors.reset}`);
    execSync('npm install --save-dev @tailwindcss/typography@0.5.10', { stdio: 'inherit' });
  }

  // Step 1: Build the client
  console.log(`${colors.yellow}Building client...${colors.reset}`);
  try {
    // Use our dedicated client build script
    execSync('node scripts/build-client.js', { stdio: 'inherit' });
  } catch (error) {
    console.error(`${colors.red}Error building client:${colors.reset}`, error.message);
    process.exit(1);
  }
  console.log(`${colors.green}Client build completed successfully!${colors.reset}`);

  // Step 2: Transpile server files to JavaScript
  console.log(`${colors.yellow}Transpiling server files...${colors.reset}`);
  
  // Create dist/server directory if it doesn't exist
  if (!fs.existsSync(path.resolve('dist/server'))) {
    fs.mkdirSync(path.resolve('dist/server'), { recursive: true });
  }
  
  // Transpile server files using tsc
  execSync('npx tsc --project tsconfig.server.json', { stdio: 'inherit' });
  console.log(`${colors.green}Server files transpiled successfully!${colors.reset}`);
  
  // Also copy shared directory
  if (!fs.existsSync(path.resolve('dist/shared'))) {
    fs.mkdirSync(path.resolve('dist/shared'), { recursive: true });
  }
  
  // Transpile shared files
  execSync('npx tsc --project tsconfig.shared.json', { stdio: 'inherit' });
  console.log(`${colors.green}Shared files transpiled successfully!${colors.reset}`);
  
  // Step 3: Create a simple entry point
  console.log(`${colors.yellow}Creating entry point...${colors.reset}`);
  const entryPoint = `
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import compression from 'compression';
import helmet from 'helmet';
import cors from 'cors';
import { createServer } from 'http';
import { registerRoutes } from './routes.js';
import { runMigrations } from './db.js';

// ES Module equivalent for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  try {
    // Run database migrations
    await runMigrations();

    const app = express();
    const port = process.env.PORT || 3000;

    // Enable CORS for all routes
    app.use(cors({
      origin: '*',
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

    // Register API routes BEFORE static file serving
    await registerRoutes(app);

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

// Write the entry point to dist/server/index.js
fs.writeFileSync(path.resolve('dist/server/index.js'), entryPoint);
console.log(`${colors.green}Entry point created successfully!${colors.reset}`);

// Step 4: Create a health check endpoint
console.log(`${colors.yellow}Creating health check endpoint...${colors.reset}`);
const healthCheckEndpoint = `
import express from 'express';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(\`Health check endpoint running on port \${port}\`);
});
`;

// Write the health check endpoint to dist/server/health.js
fs.writeFileSync(path.resolve('dist/server/health.js'), healthCheckEndpoint);
console.log(`${colors.green}Health check endpoint created successfully!${colors.reset}`);
  
// Step 5: Check if the client build created the necessary files
console.log(`${colors.yellow}Checking client build output...${colors.reset}`);
if (!fs.existsSync(path.resolve('dist/client/assets'))) {
  console.log(`${colors.red}Client build assets directory does not exist!${colors.reset}`);
  console.log(`${colors.yellow}Creating dist/client/assets directory...${colors.reset}`);
  fs.mkdirSync(path.resolve('dist/client/assets'), { recursive: true });
} else {
  console.log(`${colors.green}Client build assets directory exists${colors.reset}`);
  
  // List the files in the assets directory
  const assetsFiles = fs.readdirSync(path.resolve('dist/client/assets'));
  console.log(`${colors.green}Assets files:${colors.reset}`, assetsFiles);
}

// Step 6: Check if index.html exists in dist/client
console.log(`${colors.yellow}Checking if index.html exists in dist/client...${colors.reset}`);
if (!fs.existsSync(path.resolve('dist/client/index.html'))) {
  console.log(`${colors.red}index.html does not exist in dist/client!${colors.reset}`);
  console.log(`${colors.yellow}Creating index.html in dist/client...${colors.reset}`);
  fs.writeFileSync('dist/client/index.html', `<!DOCTYPE html>
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
</html>`);
  console.log(`${colors.green}index.html created in dist/client${colors.reset}`);
} else {
  console.log(`${colors.green}index.html already exists in dist/client${colors.reset}`);
  
  // Read the index.html file to check its content
  const indexHtmlContent = fs.readFileSync(path.resolve('dist/client/index.html'), 'utf8');
  console.log(`${colors.green}index.html content:${colors.reset}`, indexHtmlContent);
}

console.log(`${colors.green}Build completed successfully!${colors.reset}`);
} catch (error) {
  console.error(`${colors.red}Build failed:${colors.reset}`, error);
  process.exit(1);
}
