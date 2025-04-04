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

console.log(`${colors.blue}Starting targeted fix for routes.js...${colors.reset}`);

try {
  // Create a basic routes.js file
  const routesJsContent = `
import { Router } from 'express';
import { createAuthRouter, requireAuth, requireAdmin, verifyCsrfToken } from './auth.js';
import { Storage } from './storage.js';
import { createContentRouter } from './content.js';
import { createAcademicRouter } from './academic.js';
import { createAdminRouter } from './admin.js';
import { createSearchRouter } from './search.js';
import { createWebSocketServer } from './websocket.js';

// Register all routes
export async function registerRoutes(app) {
  const storage = new Storage();
  
  // Create routers
  const authRouter = createAuthRouter(storage);
  const contentRouter = createContentRouter(storage);
  const academicRouter = createAcademicRouter(storage);
  const adminRouter = createAdminRouter(storage);
  const searchRouter = createSearchRouter(storage);
  
  // Register routers
  app.use('/api/auth', authRouter);
  app.use('/api/content', contentRouter);
  app.use('/api/academic', academicRouter);
  app.use('/api/admin', requireAdmin, adminRouter);
  app.use('/api/search', searchRouter);
  
  // Apply CSRF protection to all API routes
  app.use('/api', verifyCsrfToken);
  
  // Create WebSocket server
  const wsServer = createWebSocketServer(app.server, storage);
  
  return {
    authRouter,
    contentRouter,
    academicRouter,
    adminRouter,
    searchRouter,
    wsServer
  };
}

// Sanitize HTML content
export function sanitizeHtml(html) {
  if (!html) return '';
  
  // Basic sanitization
  return html
    .replace(/<script\\b[^<]*(?:(?!<\\/script>)<[^<]*)*<\\/script>/gi, '')
    .replace(/on\\w+="[^"]*"/g, '')
    .replace(/on\\w+='[^']*'/g, '')
    .replace(/on\\w+=\\w+/g, '');
}

// Middleware for validating request body
export function validateRequestBody(schema) {
  return (req, res, next) => {
    try {
      const result = schema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ 
          error: 'Invalid request data',
          details: result.error.errors 
        });
      }
      req.validatedBody = result.data;
      next();
    } catch (error) {
      console.error('Validation error:', error);
      res.status(400).json({ error: 'Invalid request data' });
    }
  };
}

// Middleware for handling errors
export function errorHandler(err, req, res, next) {
  console.error('API Error:', err);
  res.status(500).json({ error: 'Internal server error' });
}

// Middleware for logging requests
export function requestLogger(req, res, next) {
  console.log(\`[\${new Date().toISOString()}] \${req.method} \${req.url}\`);
  next();
}
`;
  
  // Write the fixed file
  fs.writeFileSync(path.resolve(__dirname, 'dist/server/routes.js'), routesJsContent);
  console.log(`${colors.green}Fixed routes.js file created successfully!${colors.reset}`);
  
  console.log(`${colors.green}Fix completed successfully!${colors.reset}`);
} catch (error) {
  console.error(`${colors.red}Fix failed:${colors.reset}`, error);
  process.exit(1);
}
