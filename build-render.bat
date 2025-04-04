@echo off
echo Starting build process for Render...

echo Installing dependencies...
call npm install

echo Installing Tailwind plugins...
call npm install --save-dev tailwindcss-animate@1.0.7 @tailwindcss/typography@0.5.10

echo Building application...
call npm run build

echo Creating dist/client directory...
if not exist dist\client mkdir dist\client

echo Creating health check endpoint...
echo ^<!DOCTYPE html^>^<html^>^<head^>^<title^>Health Check^</title^>^</head^>^<body^>^<h1^>OK^</h1^>^</body^>^</html^> > dist\client\health.html

echo Creating server.js file...
(
echo import express from 'express';
echo import path from 'path';
echo import { fileURLToPath } from 'url';
echo import compression from 'compression';
echo import helmet from 'helmet';
echo import cors from 'cors';
echo.
echo // ES Module equivalent for __dirname
echo const __filename = fileURLToPath(import.meta.url^);
echo const __dirname = path.dirname(__filename^);
echo.
echo const app = express(^);
echo const PORT = process.env.PORT ^|^| 3000;
echo.
echo // Enable compression
echo app.use(compression(^)^);
echo.
echo // Set security headers
echo app.use(helmet({
echo   contentSecurityPolicy: {
echo     directives: {
echo       defaultSrc: ["'self'"],
echo       scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
echo       styleSrc: ["'self'", "'unsafe-inline'"],
echo       imgSrc: ["'self'", "data:", "https:"],
echo       connectSrc: ["'self'", "https://sdsy2.onrender.com"],
echo       fontSrc: ["'self'", "data:", "https:"],
echo       objectSrc: ["'none'"],
echo       mediaSrc: ["'self'"],
echo       frameSrc: ["'none'"],
echo     },
echo   },
echo }^)^);
echo.
echo // Enable CORS
echo app.use(cors({
echo   origin: process.env.CORS_ORIGIN ^|^| 'https://sdsy2.onrender.com',
echo   credentials: true,
echo }^)^);
echo.
echo // Set proper MIME types for JavaScript modules
echo app.use((req, res, next^) =^> {
echo   if (req.url.endsWith('.js'^)^) {
echo     res.type('application/javascript'^);
echo   }
echo   next(^);
echo }^);
echo.
echo // Health check endpoint
echo app.get('/api/health', (req, res^) =^> {
echo   res.status(200^).json({ status: 'ok' }^);
echo }^);
echo.
echo // Health check HTML endpoint
echo app.get('/health', (req, res^) =^> {
echo   res.sendFile(path.join(__dirname, 'dist/client/health.html'^)^);
echo }^);
echo.
echo // Serve static files from the client build
echo app.use(express.static(path.join(__dirname, 'dist/client'^), {
echo   setHeaders: (res, path^) =^> {
echo     if (path.endsWith('.js'^)^) {
echo       res.setHeader('Content-Type', 'application/javascript'^);
echo     }
echo   }
echo }^)^);
echo.
echo // For all other routes, serve the index.html
echo app.get('*', (req, res^) =^> {
echo   res.sendFile(path.join(__dirname, 'dist/client/index.html'^)^);
echo }^);
echo.
echo app.listen(PORT, (^) =^> {
echo   console.log(`Server running on port ${PORT}`^);
echo }^);
) > server.js

echo Creating server entry point...
if not exist dist\server mkdir dist\server
(
echo import express from 'express';
echo import path from 'path';
echo import { fileURLToPath } from 'url';
echo import compression from 'compression';
echo import helmet from 'helmet';
echo import cors from 'cors';
echo.
echo // ES Module equivalent for __dirname
echo const __filename = fileURLToPath(import.meta.url^);
echo const __dirname = path.dirname(__filename^);
echo.
echo const app = express(^);
echo const PORT = process.env.PORT ^|^| 3000;
echo.
echo // Enable compression
echo app.use(compression(^)^);
echo.
echo // Set security headers
echo app.use(helmet({
echo   contentSecurityPolicy: {
echo     directives: {
echo       defaultSrc: ["'self'"],
echo       scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
echo       styleSrc: ["'self'", "'unsafe-inline'"],
echo       imgSrc: ["'self'", "data:", "https:"],
echo       connectSrc: ["'self'", "https://sdsy2.onrender.com"],
echo       fontSrc: ["'self'", "data:", "https:"],
echo       objectSrc: ["'none'"],
echo       mediaSrc: ["'self'"],
echo       frameSrc: ["'none'"],
echo     },
echo   },
echo }^)^);
echo.
echo // Enable CORS
echo app.use(cors({
echo   origin: process.env.CORS_ORIGIN ^|^| 'https://sdsy2.onrender.com',
echo   credentials: true,
echo }^)^);
echo.
echo // Set proper MIME types for JavaScript modules
echo app.use((req, res, next^) =^> {
echo   if (req.url.endsWith('.js'^)^) {
echo     res.type('application/javascript'^);
echo   }
echo   next(^);
echo }^);
echo.
echo // Health check endpoint
echo app.get('/api/health', (req, res^) =^> {
echo   res.status(200^).json({ status: 'ok' }^);
echo }^);
echo.
echo // Health check HTML endpoint
echo app.get('/health', (req, res^) =^> {
echo   res.sendFile(path.join(__dirname, '../client/health.html'^)^);
echo }^);
echo.
echo // Serve static files from the client build
echo app.use(express.static(path.join(__dirname, '../client'^), {
echo   setHeaders: (res, path^) =^> {
echo     if (path.endsWith('.js'^)^) {
echo       res.setHeader('Content-Type', 'application/javascript'^);
echo     }
echo   }
echo }^)^);
echo.
echo // For all other routes, serve the index.html
echo app.get('*', (req, res^) =^> {
echo   res.sendFile(path.join(__dirname, '../client/index.html'^)^);
echo }^);
echo.
echo app.listen(PORT, (^) =^> {
echo   console.log(`Server running on port ${PORT}`^);
echo }^);
) > dist\server\index.js

echo Checking if index.html exists in dist/client...
if not exist dist\client\index.html (
  echo Creating index.html in dist/client...
  (
  echo ^<!DOCTYPE html^>
  echo ^<html lang="en"^>
  echo   ^<head^>
  echo     ^<meta charset="UTF-8" /^>
  echo     ^<meta name="viewport" content="width=device-width, initial-scale=1.0" /^>
  echo     ^<title^>UniSphere - University Learning Platform^</title^>
  echo     ^<link rel="stylesheet" href="/assets/index.css"^>
  echo   ^</head^>
  echo   ^<body^>
  echo     ^<div id="root"^>^</div^>
  echo     ^<script type="module" src="/assets/index.js"^>^</script^>
  echo   ^</body^>
  echo ^</html^>
  ) > dist\client\index.html
  echo index.html created in dist/client
) else (
  echo index.html already exists in dist/client
)

echo Checking client build output...
if exist dist\client\assets (
  echo Client build assets directory exists
  dir dist\client\assets
) else (
  echo Client build assets directory does not exist, creating it...
  mkdir dist\client\assets
)

echo Checking if index.js exists in dist/client/assets...
if not exist dist\client\assets\index.js (
  echo Creating index.js in dist/client/assets...
  (
  echo import React from 'react';
  echo import ReactDOM from 'react-dom/client';
  echo import App from './App';
  echo.
  echo ReactDOM.createRoot(document.getElementById('root'^)^).render(
  echo   ^<React.StrictMode^>
  echo     ^<App /^>
  echo   ^</React.StrictMode^>
  echo ^);
  ) > dist\client\assets\index.js
  echo index.js created in dist/client/assets
) else (
  echo index.js already exists in dist/client/assets
)

echo Checking if App.js exists in dist/client/assets...
if not exist dist\client\assets\App.js (
  echo Creating App.js in dist/client/assets...
  (
  echo import React from 'react';
  echo.
  echo function App(^) {
  echo   return (
  echo     ^<div className="flex flex-col items-center justify-center min-h-screen bg-gray-100"^>
  echo       ^<h1 className="text-4xl font-bold text-gray-800 mb-4"^>UniSphere^</h1^>
  echo       ^<p className="text-xl text-gray-600"^>University Learning Platform^</p^>
  echo     ^</div^>
  echo   ^);
  echo }
  echo.
  echo export default App;
  ) > dist\client\assets\App.js
  echo App.js created in dist/client/assets
) else (
  echo App.js already exists in dist/client/assets
)

echo Checking if index.css exists in dist/client/assets...
if not exist dist\client\assets\index.css (
  echo Creating index.css in dist/client/assets...
  (
  echo @tailwind base;
  echo @tailwind components;
  echo @tailwind utilities;
  echo.
  echo body {
  echo   margin: 0;
  echo   font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
  echo     'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
  echo     sans-serif;
  echo   -webkit-font-smoothing: antialiased;
  echo   -moz-osx-font-smoothing: grayscale;
  echo }
  ) > dist\client\assets\index.css
  echo index.css created in dist/client/assets
) else (
  echo index.css already exists in dist/client/assets
)

echo Build completed successfully! 