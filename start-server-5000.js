import { spawn } from "child_process";
import { createServer } from "http";
import { createProxyMiddleware } from "http-proxy-middleware";
import express from "express";
import cors from "cors";
import session from "express-session";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcrypt";
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { eq } from "drizzle-orm";
import { users } from "./shared/schema.js";
import crypto from "crypto";
import bodyParser from "body-parser";

// Configure database
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false
});

const db = drizzle(pool);

// Configure passport with local strategy
passport.use(
  new LocalStrategy(
    {
      usernameField: "admissionNumber",
      passwordField: "password",
    },
    async (admissionNumber, password, done) => {
      try {
        console.log(`Authentication attempt for admission number: ${admissionNumber}`);
        
        // Find user by admission number
        const [user] = await db.select().from(users).where(eq(users.admissionNumber, admissionNumber));
        
        if (!user) {
          console.log("User not found");
          return done(null, false, { message: "Incorrect admission number or password" });
        }

        // Compare password using bcrypt
        const isPasswordValid = await bcrypt.compare(password, user.password);
        
        if (!isPasswordValid) {
          console.log("Invalid password");
          return done(null, false, { message: "Incorrect admission number or password" });
        }

        console.log("Authentication successful");
        return done(null, user);
      } catch (error) {
        console.error("Authentication error:", error);
        return done(error);
      }
    }
  )
);

// Configure user serialization/deserialization for session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    done(null, user || null);
  } catch (error) {
    done(error);
  }
});

async function startDevEnvironment() {
  console.log("Starting development environment on port 5000");
  
  // Start Vite development server (it will run on port 3000)
  const viteProcess = spawn("npx", ["vite", "--port", "3000", "--host", "0.0.0.0"], {
    stdio: "inherit",
    env: { ...process.env },
  });
  
  console.log("Vite server starting on port 3000...");
  
  // Give Vite time to start up
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  // Create Express server on port 5000
  const app = express();
  
  // Health check endpoint for Replit
  app.get('/health', (req, res) => {
    res.status(200).send('Server is healthy');
  });

  // CORS configuration
  app.use(cors({
    origin: true,
    credentials: true
  }));

  // Parse request bodies
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));

  // Session configuration
  app.use(session({
    secret: process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex'),
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      secure: false, // Set to true in production with HTTPS
      httpOnly: true
    }
  }));

  // Initialize Passport
  app.use(passport.initialize());
  app.use(passport.session());

  // Generate CSRF token
  app.use((req, res, next) => {
    if (!req.session.csrfToken) {
      req.session.csrfToken = crypto.randomBytes(32).toString('hex');
    }
    next();
  });

  // Set up auth routes
  app.post('/api/login', (req, res, next) => {
    console.log("Login attempt:", req.body);
    
    passport.authenticate('local', (err, user, info) => {
      if (err) {
        console.error("Login error:", err);
        return res.status(500).json({ message: "Authentication error" });
      }
      
      if (!user) {
        console.log("Login failed:", info.message);
        return res.status(401).json({ message: info.message || "Authentication failed" });
      }
      
      req.login(user, (err) => {
        if (err) {
          console.error("Session error:", err);
          return res.status(500).json({ message: "Session error" });
        }
        
        // Don't send password to client
        const { password, ...userWithoutPassword } = user;
        console.log("Login successful for user:", userWithoutPassword.username);
        
        return res.status(200).json(userWithoutPassword);
      });
    })(req, res, next);
  });

  app.post('/api/logout', (req, res) => {
    const username = req.user?.username;
    req.logout((err) => {
      if (err) {
        console.error("Logout error:", err);
        return res.status(500).json({ message: "Logout failed" });
      }
      console.log("Logout successful for user:", username);
      res.status(200).json({ message: "Logged out successfully" });
    });
  });

  app.get('/api/user', (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    // Don't send password to client
    const { password, ...userWithoutPassword } = req.user;
    res.status(200).json(userWithoutPassword);
  });

  app.get('/api/csrf-token', (req, res) => {
    res.json({ csrfToken: req.session.csrfToken });
  });

  // Add all academic endpoints that existed in routes.ts
  app.get("/api/academic/countries", async (req, res) => {
    try {
      const result = await db.query.countries.findMany();
      res.json(result);
    } catch (error) {
      console.error('Error fetching countries:', error);
      res.status(500).json({ message: 'Error fetching countries' });
    }
  });

  // Proxy all other requests to Vite server
  app.use("/", createProxyMiddleware({
    target: "http://localhost:3000",
    changeOrigin: true,
    ws: true,
    logLevel: 'debug'
  }));
  
  // Start server on port 5000
  const server = createServer(app);
  server.listen(5000, '0.0.0.0', () => {
    console.log("Server listening on port 5000 (0.0.0.0)");
    console.log("Access your application at http://localhost:5000");
  });
  
  // Handle graceful shutdown
  process.on("SIGINT", () => {
    console.log("Shutting down servers");
    viteProcess.kill();
    server.close();
    process.exit(0);
  });
}

startDevEnvironment().catch(err => {
  console.error("Failed to start development environment:", err);
  process.exit(1);
});