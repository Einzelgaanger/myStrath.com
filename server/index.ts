import express, { Express, Request, Response, NextFunction } from "express";
import cors from "cors";
import compression from "compression";
import helmet from "helmet";
import rateLimit from 'express-rate-limit';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";
import { setupAuth } from "./auth";
import { registerRoutes } from "./routes";
import { createServer } from "http";
import { runMigrations } from "./db";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function startServer() {
  try {
    // Run database migrations
    await runMigrations();

    const app: Express = express();
    const port = process.env.PORT || 5000; // Keep this at 5000 for production
    
    // Log configuration settings
    console.log("Starting server with configuration:");
    console.log(`- Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`- Port: ${port}`);
    console.log(`- Database: ${process.env.DATABASE_URL ? 'Connected' : 'Not connected'}`);
    console.log("----------------------------------------");

    // Strict CORS policy for production
    app.use(cors({
      origin: process.env.NODE_ENV === 'production' 
        ? ['https://stratizens.com', 'https://*.stratizens.com'] // Whitelist domains in production
        : '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token', 'X-Requested-With'],
      credentials: true,
      maxAge: 86400 // Cache preflight requests for 24 hours
    }));

    // Enable compression
    app.use(compression());

    // Advanced security headers configuration
    app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'"], // Needed for React
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", "data:", "blob:"],
          fontSrc: ["'self'", "data:"],
          connectSrc: ["'self'", "wss:", "ws:"],
          frameSrc: ["'none'"],
          objectSrc: ["'none'"],
          upgradeInsecureRequests: [],
        }
      },
      crossOriginEmbedderPolicy: false, // Needed for loading resources
      crossOriginOpenerPolicy: { policy: "same-origin" },
      crossOriginResourcePolicy: { policy: "same-site" },
      dnsPrefetchControl: { allow: false },
      frameguard: { action: "deny" },
      hsts: {
        maxAge: 31536000, // 1 year in seconds
        includeSubDomains: true,
        preload: true
      },
      referrerPolicy: { policy: "strict-origin-when-cross-origin" },
      xssFilter: true,
      noSniff: true,
      permittedCrossDomainPolicies: { permittedPolicies: "none" }
    }));

    // Strict parsing of JSON with size limits to prevent DoS attacks
    app.use(express.json({ limit: '1mb' }));
    app.use(express.urlencoded({ extended: true, limit: '1mb' }));
    
    // Add rate limiting to prevent brute force and DoS attacks
    const apiLimiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // Limit each IP to 100 requests per window
      standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
      legacyHeaders: false, // Disable the `X-RateLimit-*` headers
      message: "Too many requests from this IP, please try again later."
    });
    
    // Apply rate limiting to all API routes
    app.use('/api/', apiLimiter);

    // Health check endpoint
    app.get("/health", (req: Request, res: Response) => {
      res.json({ status: "ok" });
    });

    // Error handling middleware
    app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
      console.error(err.stack);
      res.status(500).json({
        message: "Internal Server Error",
        error: process.env.NODE_ENV === "development" ? err.message : undefined,
      });
    });

    // Register API routes BEFORE static file serving
    // This will return an HTTP server with WebSocket support
    const httpServer = await registerRoutes(app);

    // Serve static files from the client build directory
    app.use(express.static(path.join(__dirname, "../dist/client")));

    // Handle client-side routing - serve index.html for all other routes
    app.get("*", (req: Request, res: Response) => {
      res.sendFile(path.join(__dirname, "../dist/client/index.html"));
    });

    // Start the server - bind to all interfaces (0.0.0.0)
    httpServer.listen(Number(port), "0.0.0.0", () => {
      console.log(`Server running on port ${port} (0.0.0.0)`);
      console.log(`Health check available at http://0.0.0.0:${port}/health`);
      console.log(`WebSocket server available at ws://0.0.0.0:${port}/ws`);
    });

    // Handle graceful shutdown
    process.on("SIGTERM", () => {
      console.log("SIGTERM signal received: closing HTTP server");
      httpServer.close(() => {
        console.log("HTTP server closed");
        process.exit(0);
      });
    });

    return httpServer;
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
