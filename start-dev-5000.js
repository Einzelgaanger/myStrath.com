import { spawn } from "child_process";
import { createServer } from "http";
import { createProxyMiddleware } from "http-proxy-middleware";
import express from "express";

async function startDevEnvironment() {
  console.log("Starting development environment on port 5000");
  
  // Start Vite development server (it will run on port 3000)
  const viteProcess = spawn("npx", ["vite", "--port", "3000", "--host", "0.0.0.0"], {
    stdio: "inherit",
    env: { ...process.env },
  });
  
  console.log("Vite server starting on port 3000...");
  
  // Give Vite time to start up - increased timeout for slower environments
  await new Promise(resolve => setTimeout(resolve, 10000));
  
  // Create proxy server on port 5000 that forwards to Vite server on 3000
  const app = express();
  
  // Health check endpoint for Replit
  app.get('/health', (req, res) => {
    res.status(200).send('Server is healthy');
  });
  
  // Proxy all requests to Vite server
  app.use("/", createProxyMiddleware({
    target: "http://localhost:3000",
    changeOrigin: true,
    ws: true,
    logLevel: 'debug'
  }));
  
  // Start proxy server on port 5000
  const server = createServer(app);
  server.listen(5000, '0.0.0.0', () => {
    console.log("Proxy server listening on port 5000 (0.0.0.0)");
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