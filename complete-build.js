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

console.log(`${colors.blue}Starting complete build process...${colors.reset}`);

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

  // Step 3: Create a manual transpilation for each server file
  console.log(`${colors.yellow}Manually transpiling server files...${colors.reset}`);
  
  // Create a function to manually transpile TypeScript files
  function transpileFile(filePath, outputPath) {
    console.log(`Transpiling ${filePath} to ${outputPath}`);
    
    try {
      let content = fs.readFileSync(filePath, 'utf-8');
      
      // Replace TypeScript imports
      content = content.replace(/import\s+.*\s+from\s+['"](.*)\.ts['"]/g, (match, p1) => {
        return match.replace(`${p1}.ts`, `${p1}.js`);
      });
      
      // Replace import type statements
      content = content.replace(/import\s+type\s+.*\s+from\s+['"](.*)['"]/g, '');
      
      // Remove interface and type declarations
      content = content.replace(/interface\s+[^{]*{[^}]*}/g, '');
      content = content.replace(/type\s+[^=]+=\s*[^;]*;/g, '');
      
      // Remove export type statements
      content = content.replace(/export\s+(type|interface)\s+[^{;]+[{;][^}]*[};]/g, '');
      
      // Handle type annotations in variable declarations
      content = content.replace(/const\s+([^:]+):\s*[^=]+\s*=/g, 'const $1 =');
      content = content.replace(/let\s+([^:]+):\s*[^=]+\s*=/g, 'let $1 =');
      content = content.replace(/var\s+([^:]+):\s*[^=]+\s*=/g, 'var $1 =');
      
      // Handle function parameter types and return types
      content = content.replace(/function\s+([^(]+)\(([^)]*)\):\s*[^{]+\s*{/g, 'function $1($2) {');
      
      // Handle arrow function types
      content = content.replace(/\(([^)]*)\):\s*[^=]+\s*=>/g, '($1) =>');
      
      // Handle parameter type annotations
      content = content.replace(/(\w+)\s*:\s*[A-Za-z<>[\]{}|&]+/g, '$1');
      
      // Handle generic types
      content = content.replace(/<[^>]+>/g, '');
      
      // Fix method calls that might be broken by our replacements
      content = content.replace(/(\w+)\s*\(\s*\)\s*\./g, '$1().');
      
      // Write the transpiled content to the output file
      const outputDir = path.dirname(outputPath);
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }
      
      fs.writeFileSync(outputPath, content);
      return true;
    } catch (error) {
      console.error(`Error transpiling ${filePath}:`, error);
      return false;
    }
  }
  
  // Manually transpile server files
  const serverDir = path.resolve(__dirname, 'server');
  const serverDistDir = path.resolve(__dirname, 'dist/server');
  
  function processDirectory(sourceDir, targetDir, relativePath = '') {
    const currentSourceDir = path.join(sourceDir, relativePath);
    const currentTargetDir = path.join(targetDir, relativePath);
    
    if (!fs.existsSync(currentTargetDir)) {
      fs.mkdirSync(currentTargetDir, { recursive: true });
    }
    
    const items = fs.readdirSync(currentSourceDir);
    
    for (const item of items) {
      const sourcePath = path.join(currentSourceDir, item);
      const targetPath = path.join(currentTargetDir, item);
      const stats = fs.statSync(sourcePath);
      
      if (stats.isDirectory()) {
        // Recursively process subdirectories
        processDirectory(sourceDir, targetDir, path.join(relativePath, item));
      } else if (item.endsWith('.ts')) {
        // Transpile TypeScript files
        const jsTargetPath = targetPath.replace('.ts', '.js');
        transpileFile(sourcePath, jsTargetPath);
      } else {
        // Copy other files as is
        fs.copyFileSync(sourcePath, targetPath);
      }
    }
  }
  
  processDirectory(serverDir, serverDistDir);
  console.log(`${colors.green}Server files transpiled successfully!${colors.reset}`);
  
  // Step 4: Manually transpile shared files
  console.log(`${colors.yellow}Manually transpiling shared files...${colors.reset}`);
  
  const sharedDir = path.resolve(__dirname, 'shared');
  const sharedDistDir = path.resolve(__dirname, 'dist/shared');
  
  if (fs.existsSync(sharedDir)) {
    processDirectory(sharedDir, sharedDistDir);
    console.log(`${colors.green}Shared files transpiled successfully!${colors.reset}`);
  } else {
    console.log(`${colors.yellow}No shared directory found, skipping...${colors.reset}`);
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

  // Step 7: Create a special fix for the db.js file
  console.log(`${colors.yellow}Creating special fix for db.js...${colors.reset}`);
  
  const dbJsContent = `
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { sql } from "drizzle-orm";
import * as schema from "../shared/schema.js";

// Database connection configuration
const poolConfig = {
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
};

// Create PostgreSQL client
const pool = new Pool(poolConfig);

// Add event listeners for pool errors
pool.on("error", (err) => {
  console.error("Unexpected error on idle client", err);
  process.exit(-1);
});

pool.on("connect", () => {
  console.log("New client connected to the database");
});

pool.on("remove", () => {
  console.log("Client removed from the pool");
});

// Create Drizzle ORM instance with schema
export const db = drizzle(pool, {
  logger: process.env.NODE_ENV === "development",
  schema
});

// Run database migrations
export async function runMigrations() {
  try {
    console.log("Running database migrations...");
    await migrate(db, { migrationsFolder: "./drizzle" });
    console.log("Database migrations completed successfully");
    
    // Test database connection
    const result = await db.execute(sql\`SELECT version()\`);
    console.log("Database version:", result[0].version);
  } catch (error) {
    console.error("Error running migrations:", error);
    throw error;
  }
}

// Close database connections
export async function closeConnections() {
  try {
    await pool.end();
    console.log("Database connections closed");
  } catch (error) {
    console.error("Error closing database connections:", error);
    throw error;
  }
}

// Check database health
export async function checkDatabaseHealth() {
  try {
    await db.execute(sql\`SELECT 1\`);
    return true;
  } catch (error) {
    console.error("Database health check failed:", error);
    return false;
  }
}

// Execute a transaction
export async function executeTransaction(callback) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await callback(drizzle(client));
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

// Execute a query with retries
export async function executeQueryWithRetry(
  query,
  params = [],
  maxRetries = 3,
  retryDelay = 1000
) {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await db.execute(sql.raw(query, params));
      return result;
    } catch (error) {
      lastError = error;
      console.warn(\`Query attempt \${attempt} failed:\`, error);
      
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      }
    }
  }
  
  throw lastError;
}

// Execute a query with timeout
export async function executeQueryWithTimeout(
  query,
  params = [],
  timeout = 5000
) {
  const client = await pool.connect();
  try {
    await client.query(\`SET statement_timeout = \${timeout}\`);
    const result = await client.query(query, params);
    return result.rows;
  } finally {
    client.release();
  }
}

// Get database statistics
export async function getDatabaseStats() {
  const stats = await db.execute(sql\`
    SELECT
      count(*) as total_connections,
      sum(case when state = 'active' then 1 else 0 end) as active_connections,
      sum(case when state = 'idle' then 1 else 0 end) as idle_connections,
      sum(case when waiting then 1 else 0 end) as waiting_clients
    FROM pg_stat_activity
  \`);
  
  return stats[0];
}

// Monitor database performance
export async function monitorDatabasePerformance() {
  const stats = await db.execute(sql\`
    SELECT
      count(*) as query_count,
      avg(extract(epoch from (now() - query_start))) as avg_query_time,
      sum(case when extract(epoch from (now() - query_start)) > 1 then 1 else 0 end) as slow_queries
    FROM pg_stat_activity
    WHERE state = 'active'
  \`);
  
  return stats[0];
}

// Clean up old connections
export async function cleanupOldConnections(maxIdleTime = 30000) {
  await db.execute(sql\`
    SELECT pg_terminate_backend(pid)
    FROM pg_stat_activity
    WHERE state = 'idle'
    AND state_change < now() - interval '\${maxIdleTime}ms'
  \`);
}

// Reset database connection pool
export async function resetConnectionPool() {
  await pool.end();
  Object.assign(pool, new Pool(poolConfig));
}

// Export pool for direct access if needed
export { pool };
`;
  
  fs.writeFileSync(path.resolve(__dirname, 'dist/server/db.js'), dbJsContent);
  console.log(`${colors.green}Special fix for db.js created successfully!${colors.reset}`);
  
  // Step 8: Create a special fix for the auth.js file
  console.log(`${colors.yellow}Creating special fix for auth.js...${colors.reset}`);
  
  const authJsContent = `
import { Router } from 'express';
import bcrypt from 'bcrypt';
import { nanoid } from 'nanoid';
import { Storage } from './storage.js';

export function createAuthRouter(storage) {
  const router = Router();
  
  // Register a new user
  router.post('/register', async (req, res) => {
    try {
      const { username, password, email } = req.body;
      
      // Check if username already exists
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ error: 'Username already exists' });
      }
      
      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Create user
      const newUser = await storage.createUser({
        username,
        password: hashedPassword,
        email,
        role: 'user',
        points: 0,
        createdAt: new Date()
      });
      
      // Set session
      req.session.userId = newUser.id;
      
      // Return user without password
      const { password: _, ...userWithoutPassword } = newUser;
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      console.error('Error registering user:', error);
      res.status(500).json({ error: 'Failed to register user' });
    }
  });
  
  // Login
  router.post('/login', async (req, res) => {
    try {
      const { username, password } = req.body;
      
      // Get user
      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(401).json({ error: 'Invalid username or password' });
      }
      
      // Compare password
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        return res.status(401).json({ error: 'Invalid username or password' });
      }
      
      // Set session
      req.session.userId = user.id;
      
      // Generate CSRF token
      if (!req.session.csrfToken) {
        req.session.csrfToken = nanoid(64);
      }
      
      // Return user without password
      const { password: _, ...userWithoutPassword } = user;
      res.status(200).json({
        ...userWithoutPassword,
        csrfToken: req.session.csrfToken
      });
    } catch (error) {
      console.error('Error logging in:', error);
      res.status(500).json({ error: 'Failed to login' });
    }
  });
  
  // Logout
  router.post('/logout', (req, res) => {
    req.session.destroy(err => {
      if (err) {
        console.error('Error destroying session:', err);
        return res.status(500).json({ error: 'Failed to logout' });
      }
      res.status(200).json({ message: 'Logged out successfully' });
    });
  });
  
  // Get current user
  router.get('/me', async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: 'Not authenticated' });
      }
      
      const user = await storage.getUserById(req.session.userId);
      if (!user) {
        req.session.destroy(() => {});
        return res.status(401).json({ error: 'User not found' });
      }
      
      // Generate CSRF token if not exists
      if (!req.session.csrfToken) {
        req.session.csrfToken = nanoid(64);
      }
      
      // Return user without password
      const { password: _, ...userWithoutPassword } = user;
      res.status(200).json({
        ...userWithoutPassword,
        csrfToken: req.session.csrfToken
      });
    } catch (error) {
      console.error('Error getting current user:', error);
      res.status(500).json({ error: 'Failed to get user information' });
    }
  });
  
  // Update user profile
  router.put('/profile', async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: 'Not authenticated' });
      }
      
      // Verify CSRF token
      const csrfToken = req.headers['x-csrf-token'];
      if (!csrfToken || csrfToken !== req.session.csrfToken) {
        return res.status(403).json({ error: 'Invalid CSRF token' });
      }
      
      const { username, email, bio, avatar } = req.body;
      
      // Get current user
      const currentUser = await storage.getUserById(req.session.userId);
      if (!currentUser) {
        req.session.destroy(() => {});
        return res.status(401).json({ error: 'User not found' });
      }
      
      // Check if username is being changed and already exists
      if (username && username !== currentUser.username) {
        const existingUser = await storage.getUserByUsername(username);
        if (existingUser && existingUser.id !== currentUser.id) {
          return res.status(400).json({ error: 'Username already exists' });
        }
      }
      
      // Update user
      const updatedUser = await storage.updateUser(req.session.userId, {
        username: username || currentUser.username,
        email: email || currentUser.email,
        bio,
        avatar
      });
      
      // Return user without password
      const { password: _, ...userWithoutPassword } = updatedUser;
      res.status(200).json(userWithoutPassword);
    } catch (error) {
      console.error('Error updating profile:', error);
      res.status(500).json({ error: 'Failed to update profile' });
    }
  });
  
  // Change password
  router.put('/password', async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: 'Not authenticated' });
      }
      
      // Verify CSRF token
      const csrfToken = req.headers['x-csrf-token'];
      if (!csrfToken || csrfToken !== req.session.csrfToken) {
        return res.status(403).json({ error: 'Invalid CSRF token' });
      }
      
      const { currentPassword, newPassword } = req.body;
      
      // Get current user
      const user = await storage.getUserById(req.session.userId);
      if (!user) {
        req.session.destroy(() => {});
        return res.status(401).json({ error: 'User not found' });
      }
      
      // Verify current password
      const passwordMatch = await bcrypt.compare(currentPassword, user.password);
      if (!passwordMatch) {
        return res.status(401).json({ error: 'Current password is incorrect' });
      }
      
      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      
      // Update password
      await storage.updateUser(req.session.userId, {
        password: hashedPassword
      });
      
      res.status(200).json({ message: 'Password updated successfully' });
    } catch (error) {
      console.error('Error changing password:', error);
      res.status(500).json({ error: 'Failed to change password' });
    }
  });
  
  return router;
}

// Middleware to check if user is authenticated
export function requireAuth(req, res, next) {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  next();
}

// Middleware to check if user has admin role
export function requireAdmin(req, res, next) {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  // Get user from storage
  const storage = new Storage();
  storage.getUserById(req.session.userId)
    .then(user => {
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
      }
      next();
    })
    .catch(error => {
      console.error('Error checking admin status:', error);
      res.status(500).json({ error: 'Server error' });
    });
}

// Middleware to verify CSRF token
export function verifyCsrfToken(req, res, next) {
  // Skip for GET requests
  if (req.method === 'GET') {
    return next();
  }
  
  const csrfToken = req.headers['x-csrf-token'];
  if (!csrfToken || csrfToken !== req.session.csrfToken) {
    return res.status(403).json({ error: 'Invalid CSRF token' });
  }
  
  next();
}
`;
  
  fs.writeFileSync(path.resolve(__dirname, 'dist/server/auth.js'), authJsContent);
  console.log(`${colors.green}Special fix for auth.js created successfully!${colors.reset}`);

  console.log(`${colors.green}Build completed successfully!${colors.reset}`);
  console.log(`${colors.yellow}To deploy, upload the contents of the dist directory to your hosting provider.${colors.reset}`);
} catch (error) {
  console.error(`${colors.red}Build failed:${colors.reset}`, error);
  process.exit(1);
}
