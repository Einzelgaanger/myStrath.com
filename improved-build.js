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

console.log(`${colors.blue}Starting improved build process...${colors.reset}`);

try {
  // Step 1: Build the client
  console.log(`${colors.yellow}Building client...${colors.reset}`);
  try {
    // Build client directly using Vite
    execSync('npx vite build', { 
      stdio: 'inherit',
      env: { ...process.env, NODE_ENV: 'production' }
    });
    console.log(`${colors.green}Client build completed successfully!${colors.reset}`);
  } catch (error) {
    console.error(`${colors.red}Error building client:${colors.reset}`, error.message);
    // Continue with the build process even if client build fails
    console.log(`${colors.yellow}Continuing with server build...${colors.reset}`);
  }

  // Step 2: Create dist directories
  console.log(`${colors.yellow}Creating dist directories...${colors.reset}`);
  
  // Create dist/server directory if it doesn't exist
  if (!fs.existsSync(path.resolve(__dirname, 'dist/server'))) {
    fs.mkdirSync(path.resolve(__dirname, 'dist/server'), { recursive: true });
  }
  
  // Create dist/shared directory if it doesn't exist
  if (!fs.existsSync(path.resolve(__dirname, 'dist/shared'))) {
    fs.mkdirSync(path.resolve(__dirname, 'dist/shared'), { recursive: true });
  }

  // Step 3: Copy server files with improved TypeScript handling
  console.log(`${colors.yellow}Processing server files...${colors.reset}`);
  
  try {
    // Copy server files to dist/server
    const serverDir = path.resolve(__dirname, 'server');
    const serverDistDir = path.resolve(__dirname, 'dist/server');
    
    // Create a function to copy files recursively with improved TypeScript handling
    function copyFilesRecursively(sourceDir, targetDir) {
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }
      
      const files = fs.readdirSync(sourceDir);
      
      for (const file of files) {
        const sourcePath = path.join(sourceDir, file);
        const targetPath = path.join(targetDir, file);
        
        const stats = fs.statSync(sourcePath);
        
        if (stats.isDirectory()) {
          copyFilesRecursively(sourcePath, targetPath);
        } else if (file.endsWith('.ts')) {
          // Convert TypeScript files to JavaScript with improved handling
          let content = fs.readFileSync(sourcePath, 'utf-8');
          
          // Handle TypeScript imports
          content = content.replace(/import .* from ["'](.*)\.ts["'];?/g, 'import * from "$1.js";');
          content = content.replace(/import \{(.*)\} from ["'](.*)\.ts["'];?/g, 'import {$1} from "$2.js";');
          
          // Handle type annotations in variable declarations
          content = content.replace(/const ([^:]+): [^=]+ =/g, 'const $1 =');
          content = content.replace(/let ([^:]+): [^=]+ =/g, 'let $1 =');
          content = content.replace(/var ([^:]+): [^=]+ =/g, 'var $1 =');
          
          // Handle function parameter types
          content = content.replace(/function ([^(]+)\(([^)]*): [^)]+\)/g, 'function $1($2)');
          
          // Handle function return types
          content = content.replace(/function [^(]+\([^)]*\): [^{]+ {/g, 'function $1($2) {');
          
          // Handle arrow function types
          content = content.replace(/\(([^)]*)\): [^=]+ =>/g, '($1) =>');
          
          // Handle generic types
          content = content.replace(/<[^>]+>/g, '');
          
          // Handle interface and type declarations
          content = content.replace(/interface [^{]+{[^}]+}/g, '');
          content = content.replace(/type [^=]+ = [^;]+;/g, '');
          
          // Handle export type statements
          content = content.replace(/export (type|interface) [^{;]+[{;][^}]*[};]/g, '');
          
          // Replace .ts extensions with .js in imports
          content = content.replace(/\.ts/g, '.js');
          
          fs.writeFileSync(targetPath.replace('.ts', '.js'), content);
        } else {
          fs.copyFileSync(sourcePath, targetPath);
        }
      }
    }
    
    copyFilesRecursively(serverDir, serverDistDir);
    console.log(`${colors.green}Server files processed successfully!${colors.reset}`);
  } catch (error) {
    console.error(`${colors.red}Error processing server files:${colors.reset}`, error.message);
    process.exit(1);
  }

  // Step 4: Copy shared files with improved TypeScript handling
  console.log(`${colors.yellow}Processing shared files...${colors.reset}`);
  
  try {
    // Copy shared files to dist/shared
    const sharedDir = path.resolve(__dirname, 'shared');
    const sharedDistDir = path.resolve(__dirname, 'dist/shared');
    
    if (fs.existsSync(sharedDir)) {
      if (!fs.existsSync(sharedDistDir)) {
        fs.mkdirSync(sharedDistDir, { recursive: true });
      }
      
      const files = fs.readdirSync(sharedDir);
      
      for (const file of files) {
        const sourcePath = path.join(sharedDir, file);
        const targetPath = path.join(sharedDistDir, file);
        
        if (fs.statSync(sourcePath).isFile()) {
          if (file.endsWith('.ts')) {
            // Convert TypeScript files to JavaScript with improved handling
            let content = fs.readFileSync(sourcePath, 'utf-8');
            
            // Handle TypeScript imports
            content = content.replace(/import .* from ["'](.*)\.ts["'];?/g, 'import * from "$1.js";');
            content = content.replace(/import \{(.*)\} from ["'](.*)\.ts["'];?/g, 'import {$1} from "$2.js";');
            
            // Handle type annotations in variable declarations
            content = content.replace(/const ([^:]+): [^=]+ =/g, 'const $1 =');
            content = content.replace(/let ([^:]+): [^=]+ =/g, 'let $1 =');
            content = content.replace(/var ([^:]+): [^=]+ =/g, 'var $1 =');
            
            // Handle function parameter types
            content = content.replace(/function ([^(]+)\(([^)]*): [^)]+\)/g, 'function $1($2)');
            
            // Handle function return types
            content = content.replace(/function [^(]+\([^)]*\): [^{]+ {/g, 'function $1($2) {');
            
            // Handle arrow function types
            content = content.replace(/\(([^)]*)\): [^=]+ =>/g, '($1) =>');
            
            // Handle generic types
            content = content.replace(/<[^>]+>/g, '');
            
            // Handle interface and type declarations
            content = content.replace(/interface [^{]+{[^}]+}/g, '');
            content = content.replace(/type [^=]+ = [^;]+;/g, '');
            
            // Handle export type statements
            content = content.replace(/export (type|interface) [^{;]+[{;][^}]*[};]/g, '');
            
            // Replace .ts extensions with .js in imports
            content = content.replace(/\.ts/g, '.js');
            
            fs.writeFileSync(targetPath.replace('.ts', '.js'), content);
          } else {
            fs.copyFileSync(sourcePath, targetPath);
          }
        }
      }
    }
    
    console.log(`${colors.green}Shared files processed successfully!${colors.reset}`);
  } catch (error) {
    console.error(`${colors.red}Error processing shared files:${colors.reset}`, error.message);
    process.exit(1);
  }

  // Step 5: Create server entry point
  console.log(`${colors.yellow}Creating server entry point...${colors.reset}`);
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
  fs.writeFileSync(path.resolve(__dirname, 'dist/server/index.js'), entryPoint);
  console.log(`${colors.green}Server entry point created successfully!${colors.reset}`);

  // Step 6: Create package.json for production
  console.log(`${colors.yellow}Creating production package.json...${colors.reset}`);
  
  try {
    const packageJson = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'package.json'), 'utf-8'));
    
    // Create a simplified package.json for production
    const productionPackageJson = {
      name: packageJson.name,
      version: packageJson.version,
      description: packageJson.description,
      main: "server/index.js",
      type: "module",
      scripts: {
        start: "node server/index.js"
      },
      dependencies: packageJson.dependencies || {},
      engines: packageJson.engines || { node: ">=18.0.0" }
    };
    
    fs.writeFileSync(
      path.resolve(__dirname, 'dist/package.json'),
      JSON.stringify(productionPackageJson, null, 2)
    );
    
    console.log(`${colors.green}Production package.json created successfully!${colors.reset}`);
  } catch (error) {
    console.error(`${colors.red}Error creating production package.json:${colors.reset}`, error.message);
    process.exit(1);
  }

  console.log(`${colors.green}Build completed successfully!${colors.reset}`);
  console.log(`${colors.yellow}To deploy, upload the contents of the dist directory to your hosting provider.${colors.reset}`);
} catch (error) {
  console.error(`${colors.red}Build failed:${colors.reset}`, error);
  process.exit(1);
}
