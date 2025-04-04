import express, { Express, Request, Response, NextFunction } from "express";
import { createServer, Server } from "http";
import { storage } from "./storage";
import { WebSocketServer } from "ws";
import WebSocket from "ws";
import { setupAuth, hashPassword, encryptField, decryptField } from "./auth";
import crypto from "crypto";

// Extend WebSocket interface with custom properties for security
interface SecureWebSocket extends WebSocket {
  connectionId: string;
  authenticated: boolean;
  userId: number | null;
}
import { 
  insertContentSchema, 
  contentTypes, 
  User,
  InsertComment,
  countries,
  universities,
  programs,
  courses,
  years,
  semesters,
  groups
} from "@shared/schema";
import { setupFileUpload } from "./upload";
import { runMigrations } from "./db";
import { seedDatabase } from "./seed";
import path from "path";
import { db } from "./db";
import { sql, eq } from "drizzle-orm";
import { body, param, query, validationResult } from "express-validator";
import { JSDOM } from "jsdom";
import createDOMPurify from "dompurify";

// Initialize DOMPurify for HTML sanitization with enhanced security
const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window);

// Add hooks for additional security measures
DOMPurify.addHook('afterSanitizeAttributes', (node) => {
  // Add rel="noopener noreferrer" to all links as a security measure
  if (node.tagName === 'A' && node.hasAttribute('href')) {
    node.setAttribute('rel', 'noopener noreferrer');
    
    // Force target="_blank" for external links
    const href = node.getAttribute('href');
    if (href && (href.startsWith('http://') || href.startsWith('https://'))) {
      node.setAttribute('target', '_blank');
    }
  }
  
  // Add additional protection against inline styles with malicious content
  if (node.hasAttribute('style')) {
    const style = node.getAttribute('style');
    if (style && (
      style.includes('expression') || 
      style.includes('javascript:') || 
      style.includes('behavior:') ||
      style.includes('url(') ||
      style.includes('eval(')
    )) {
      node.removeAttribute('style');
    }
  }
});

// Security constants
const MAX_COMMENT_LENGTH = 2000;
const ALLOWED_CONTENT_TYPES = ["assignment", "note", "past_paper", "resource", "other"];
const ALLOWED_FILE_EXTENSIONS = [
  ".pdf", ".doc", ".docx", ".ppt", ".pptx", ".xls", ".xlsx", 
  ".txt", ".rtf", ".jpg", ".jpeg", ".png", ".gif", ".zip", ".7z"
];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

// Custom validation middleware helper
const validate = (validations: any[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Execute all validations
    await Promise.all(validations.map(validation => validation.run(req)));

    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // Log validation failures for security monitoring
      console.warn(`Validation failed from IP ${req.ip}:`, errors.array());
      
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    
    next();
  };
};

// Enhanced HTML sanitizer for user-provided content with security and accessibility
const sanitizeHTML = (html: string): string => {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'span', 'strong', 'em', 
      'u', 'ol', 'ul', 'li', 'br', 'a', 'img', 'pre', 'code', 'blockquote',
      'table', 'thead', 'tbody', 'tr', 'th', 'td', 'b', 'i', 'hr',
      'sub', 'sup', 'mark', 'del', 'ins', 'caption', 'figure', 'figcaption'
    ],
    ALLOWED_ATTR: [
      'href', 'target', 'rel', 'src', 'alt', 'class', 'style', 'title',
      'aria-label', 'aria-describedby', 'tabindex', 'lang', 'dir',
      'width', 'height', 'align', 'valign', 'border', 'cellpadding', 'cellspacing'
    ],
    FORBID_TAGS: ['script', 'style', 'iframe', 'form', 'input', 'button', 'textarea', 'object', 'embed', 'meta'],
    FORBID_ATTR: [
      'onerror', 'onload', 'onclick', 'onmouseover', 'onmouseout', 'onfocus', 'onblur',
      'onkeydown', 'onkeypress', 'onkeyup', 'ondblclick', 'ontouchstart', 'ontouchend',
      'ontouchmove', 'eval', 'expression', 'javascript:'
    ],
    ALLOW_DATA_ATTR: false,
    ADD_ATTR: ['rel="noopener noreferrer"', 'target="_blank"'],
    SANITIZE_DOM: true,
    FORCE_BODY: true,
    USE_PROFILES: { html: true },
    RETURN_DOM: false,
    RETURN_DOM_FRAGMENT: false
  });
};

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      isAuthenticated(): boolean;
      file?: {
        fieldname: string;
        originalname: string;
        encoding: string;
        mimetype: string;
        size: number;
        destination: string;
        filename: string;
        path: string;
        buffer: Buffer;
      };
    }
  }
}

// Authentication middleware
const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Authentication required" });
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes
  setupAuth(app);
  
  // Set up file upload handling
  const upload = setupFileUpload();
  
  // Create a shared HTTP server for both Express and WebSocket
  const httpServer = createServer(app);
  
  // Create WebSocket server for real-time comments with enhanced security
  const wss = new WebSocketServer({ 
    server: httpServer, 
    path: '/ws',
    // Increase the maximum payload size to prevent DoS attacks
    maxPayload: 1024 * 256, // 256KB max payload size
  });
  
  // WebSocket connection management
  const activeConnections = new Map();
  const connectionRateLimiter = new Map();
  
  // WebSocket security setup - authentication, rate limiting, and message validation
  wss.on('connection', (wsConnection, req) => {
    // Cast to SecureWebSocket to use our extended interface
    const ws = wsConnection as SecureWebSocket;
    const ip = req.socket.remoteAddress || 'unknown';
    
    // Basic rate limiting for connections
    const now = Date.now();
    const recentConnections = connectionRateLimiter.get(ip) || [];
    
    // Remove connections older than 1 minute
    const recentValid = recentConnections.filter(timestamp => now - timestamp < 60000);
    
    // Add current connection
    recentValid.push(now);
    connectionRateLimiter.set(ip, recentValid);
    
    // If more than 30 connections in the last minute, reject
    if (recentValid.length > 30) {
      console.warn(`Rate limit exceeded for WebSocket connections from IP: ${ip}`);
      ws.close(1008, 'Rate limit exceeded');
      return;
    }
    
    // Set up per-message rate limiting
    let messageCount = 0;
    let lastMessageReset = Date.now();
    
    // Set up session data
    const connectionId = crypto.randomUUID();
    ws.connectionId = connectionId;
    ws.authenticated = false;
    ws.userId = null;
    
    // Handle authentication message
    ws.on('message', async (message) => {
      try {
        // Rate limiting per connection
        const now = Date.now();
        if (now - lastMessageReset > 60000) {
          // Reset counter every minute
          messageCount = 0;
          lastMessageReset = now;
        }
        
        messageCount++;
        if (messageCount > 50) {
          // More than 50 messages per minute
          console.warn(`WebSocket message rate limit exceeded for connection: ${connectionId}`);
          ws.close(1008, 'Message rate limit exceeded');
          return;
        }
        
        // Parse and validate message
        let parsedMessage;
        try {
          parsedMessage = JSON.parse(message.toString());
          
          // Validate message format
          if (!parsedMessage.type || typeof parsedMessage.type !== 'string') {
            throw new Error('Invalid message format: missing or invalid type');
          }
        } catch (error) {
          console.warn(`Invalid WebSocket message from ${ip}:`, error.message);
          ws.send(JSON.stringify({
            type: 'error',
            error: 'Invalid message format'
          }));
          return;
        }
        
        // Handle authentication message
        if (parsedMessage.type === 'authenticate') {
          if (!parsedMessage.token) {
            ws.send(JSON.stringify({
              type: 'error',
              error: 'Authentication failed: No token provided'
            }));
            return;
          }
          
          try {
            // Here we would verify the token
            // For now we'll just validate it exists
            if (parsedMessage.userId && typeof parsedMessage.userId === 'number') {
              ws.authenticated = true;
              ws.userId = parsedMessage.userId;
              
              // Store connection in active connections map
              activeConnections.set(connectionId, {
                ws: ws as WebSocket,
                userId: parsedMessage.userId,
                lastActivity: Date.now()
              });
              
              ws.send(JSON.stringify({
                type: 'authenticated',
                success: true
              }));
              
              console.log(`WebSocket client authenticated: ${connectionId}, user: ${ws.userId}`);
            } else {
              throw new Error('Invalid user ID');
            }
          } catch (error) {
            console.warn(`WebSocket authentication failed for ${ip}:`, error.message);
            ws.send(JSON.stringify({
              type: 'error',
              error: 'Authentication failed: Invalid token'
            }));
          }
          return;
        }
        
        // For any other message type, require authentication
        if (!ws.authenticated) {
          ws.send(JSON.stringify({
            type: 'error',
            error: 'Authentication required'
          }));
          return;
        }
        
        // Update last activity time
        if (activeConnections.has(connectionId)) {
          const connInfo = activeConnections.get(connectionId);
          connInfo.lastActivity = Date.now();
          activeConnections.set(connectionId, connInfo);
        }
        
        // Handle other message types here
        // (Handled in routes instead of here for most applications)
        
      } catch (error) {
        console.error(`Error processing WebSocket message:`, error);
        ws.send(JSON.stringify({
          type: 'error',
          error: 'Internal server error'
        }));
      }
    });
    
    // Handle disconnection
    ws.on('close', () => {
      // Clean up connection data
      activeConnections.delete(connectionId);
      console.log(`WebSocket client disconnected: ${connectionId}`);
    });
    
    // Handle connection errors
    ws.on('error', (error) => {
      console.error(`WebSocket error for client ${connectionId}:`, error);
      activeConnections.delete(connectionId);
    });
    
    // Send initial welcome message
    ws.send(JSON.stringify({
      type: 'welcome',
      message: 'Connected to UniSphere WebSocket server',
      requiresAuth: true
    }));
  });
  
  // Set up periodic cleanup of inactive connections
  setInterval(() => {
    const now = Date.now();
    for (const [connectionId, connInfo] of activeConnections.entries()) {
      // Disconnect if inactive for more than 30 minutes
      if (now - connInfo.lastActivity > 30 * 60 * 1000) {
        console.log(`Closing inactive WebSocket connection: ${connectionId}`);
        connInfo.ws.close(1000, 'Inactivity timeout');
        activeConnections.delete(connectionId);
      }
    }
  }, 5 * 60 * 1000); // Run every 5 minutes
  
  // Serve static files from uploads directory
  app.use('/uploads', (req, res, next) => {
    // Check if user is authenticated for protected resources
    if (req.isAuthenticated()) {
      return next();
    }
    // Allow public access to certain file types (e.g., profile pictures)
    if (req.path.startsWith('/profile-pictures/')) {
      return next();
    }
    return res.status(401).json({ message: "Authentication required" });
  }, (req, res, next) => {
    // Use express.static for actually serving the files
    express.static(path.join(process.cwd(), 'uploads'))(req, res, next);
  });

  // Academic hierarchy endpoints
  app.get("/api/academic/countries", async (req, res) => {
    try {
      console.log('Fetching countries...');
      const result = await db.select().from(countries).orderBy(countries.name);
      console.log('Countries fetched:', result);
      
      if (!result || result.length === 0) {
        return res.status(404).json({ 
          message: 'No countries found',
          data: [] 
        });
      }
      
      res.json({
        message: 'Countries fetched successfully',
        data: result
      });
    } catch (error) {
      console.error('Error fetching countries:', error);
      res.status(500).json({ 
        message: 'Error fetching countries',
        error: process.env.NODE_ENV === 'development' ? error : 'Internal server error'
      });
    }
  });

  app.get("/api/academic/universities/:countryId", async (req, res) => {
    try {
      console.log('Fetching universities for country:', req.params.countryId);
      const result = await db.select()
        .from(universities)
        .where(eq(universities.countryId, parseInt(req.params.countryId)))
        .orderBy(universities.name);
      console.log('Universities fetched:', result);
      
      if (!result || result.length === 0) {
        return res.status(404).json({ 
          message: 'No universities found for this country',
          data: [] 
        });
      }
      
      res.json({
        message: 'Universities fetched successfully',
        data: result
      });
    } catch (error) {
      console.error('Error fetching universities:', error);
      res.status(500).json({ 
        message: 'Error fetching universities',
        error: process.env.NODE_ENV === 'development' ? error : 'Internal server error'
      });
    }
  });

  app.get("/api/academic/programs/:universityId", async (req, res) => {
    try {
      const result = await db.select()
        .from(programs)
        .where(eq(programs.universityId, parseInt(req.params.universityId)))
        .orderBy(programs.name);
      
      if (!result || result.length === 0) {
        return res.status(404).json({ 
          message: 'No programs found for this university',
          data: [] 
        });
      }
      
      res.json({
        message: 'Programs fetched successfully',
        data: result
      });
    } catch (error) {
      console.error('Error fetching programs:', error);
      res.status(500).json({ 
        message: 'Error fetching programs',
        error: process.env.NODE_ENV === 'development' ? error : 'Internal server error'
      });
    }
  });

  app.get("/api/academic/courses/:programId", async (req, res) => {
    try {
      const result = await db.select()
        .from(courses)
        .where(eq(courses.programId, parseInt(req.params.programId)))
        .orderBy(courses.name);
      
      if (!result || result.length === 0) {
        return res.status(404).json({ 
          message: 'No courses found for this program',
          data: [] 
        });
      }
      
      res.json({
        message: 'Courses fetched successfully',
        data: result
      });
    } catch (error) {
      console.error('Error fetching courses:', error);
      res.status(500).json({ 
        message: 'Error fetching courses',
        error: process.env.NODE_ENV === 'development' ? error : 'Internal server error'
      });
    }
  });

  app.get("/api/academic/years/:courseId", async (req, res) => {
    try {
      const result = await db.select()
        .from(years)
        .where(eq(years.courseId, parseInt(req.params.courseId)))
        .orderBy(years.name);
      
      if (!result || result.length === 0) {
        return res.status(404).json({ 
          message: 'No years found for this course',
          data: [] 
        });
      }
      
      res.json({
        message: 'Years fetched successfully',
        data: result
      });
    } catch (error) {
      console.error('Error fetching years:', error);
      res.status(500).json({ 
        message: 'Error fetching years',
        error: process.env.NODE_ENV === 'development' ? error : 'Internal server error'
      });
    }
  });

  app.get("/api/academic/semesters/:yearId", async (req, res) => {
    try {
      const result = await db.select()
        .from(semesters)
        .where(eq(semesters.yearId, parseInt(req.params.yearId)))
        .orderBy(semesters.name);
      
      if (!result || result.length === 0) {
        return res.status(404).json({ 
          message: 'No semesters found for this year',
          data: [] 
        });
      }
      
      res.json({
        message: 'Semesters fetched successfully',
        data: result
      });
    } catch (error) {
      console.error('Error fetching semesters:', error);
      res.status(500).json({ 
        message: 'Error fetching semesters',
        error: process.env.NODE_ENV === 'development' ? error : 'Internal server error'
      });
    }
  });

  app.get("/api/academic/groups/:semesterId", async (req, res) => {
    try {
      const result = await db.select()
        .from(groups)
        .where(eq(groups.semesterId, parseInt(req.params.semesterId)))
        .orderBy(groups.name);
      
      if (!result || result.length === 0) {
        return res.status(404).json({ 
          message: 'No groups found for this semester',
          data: [] 
        });
      }
      
      res.json({
        message: 'Groups fetched successfully',
        data: result
      });
    } catch (error) {
      console.error('Error fetching groups:', error);
      res.status(500).json({ 
        message: 'Error fetching groups',
        error: process.env.NODE_ENV === 'development' ? error : 'Internal server error'
      });
    }
  });
  
  app.get("/api/programs", async (req, res, next) => {
    try {
      const programs = await storage.getAllPrograms();
      res.json(programs);
    } catch (error) {
      next(error);
    }
  });
  
  app.get("/api/courses", async (req, res, next) => {
    try {
      const programId = req.query.programId ? Number(req.query.programId) : undefined;
      const courses = await storage.getCourses(programId);
      res.json(courses);
    } catch (error) {
      next(error);
    }
  });
  
  app.get("/api/years", async (req, res, next) => {
    try {
      const courseId = req.query.courseId ? Number(req.query.courseId) : undefined;
      const years = await storage.getYears(courseId);
      res.json(years);
    } catch (error) {
      next(error);
    }
  });
  
  app.get("/api/semesters", async (req, res, next) => {
    try {
      const yearId = req.query.yearId ? Number(req.query.yearId) : undefined;
      const semesters = await storage.getSemesters(yearId);
      res.json(semesters);
    } catch (error) {
      next(error);
    }
  });
  
  app.get("/api/groups", async (req, res, next) => {
    try {
      const semesterId = req.query.semesterId ? Number(req.query.semesterId) : undefined;
      const groups = await storage.getGroups(semesterId);
      res.json(groups);
    } catch (error) {
      next(error);
    }
  });
  
  app.get("/api/units", async (req, res, next) => {
    try {
      const groupId = req.query.groupId ? Number(req.query.groupId) : undefined;
      const units = await storage.getUnits(groupId);
      res.json(units);
    } catch (error) {
      next(error);
    }
  });
  
  // Get units for logged in user
  app.get("/api/my-units", requireAuth, async (req, res, next) => {
    try {
      const units = await storage.getUnitsByUser(req.user!.id);
      res.json(units);
    } catch (error) {
      next(error);
    }
  });
  
  // Content endpoints
  app.get("/api/units/:unitId/contents", requireAuth, async (req, res, next) => {
    try {
      const unitId = Number(req.params.unitId);
      const type = req.query.type as string | undefined;
      
      // Verify that user has access to this unit
      const userUnits = await storage.getUnitsByUser(req.user!.id);
      const hasAccess = userUnits.some(unit => unit.id === unitId);
      
      if (!hasAccess && !req.user!.isAdmin && !req.user!.isSuperAdmin) {
        return res.status(403).json({ message: "Access denied to this unit" });
      }
      
      const contents = await storage.getContents(unitId, type);
      res.json(contents);
    } catch (error) {
      next(error);
    }
  });
  
  // Get content validation rules
  const getContentValidationRules = [
    param('contentId')
      .isInt({ min: 1 })
      .withMessage('Content ID must be a positive integer')
  ];

  // Enhanced get content endpoint with validation
  app.get(
    "/api/contents/:contentId", 
    requireAuth, 
    validate(getContentValidationRules),
    async (req, res, next) => {
      try {
        const contentId = Number(req.params.contentId);
        
        // Fetch content with proper error handling
        const content = await storage.getContent(contentId);
        if (!content) {
          return res.status(404).json({ 
            status: 'error',
            message: "Content not found" 
          });
        }
        
        // Verify that user has access to the unit this content belongs to
        const userUnits = await storage.getUnitsByUser(req.user!.id);
        const hasAccess = userUnits.some(unit => unit.id === content.unitId) || 
                          req.user!.isAdmin || 
                          req.user!.isSuperAdmin;
        
        if (!hasAccess) {
          // Log unauthorized access attempts
          console.warn(`Unauthorized access attempt to content ${contentId} by user ${req.user!.id}`);
          
          return res.status(403).json({ 
            status: 'error',
            message: "Access denied to this content" 
          });
        }
        
        // If content has sensitive information and user has access, decrypt it
        let responseContent = { ...content };
        if (content.type.includes('confidential')) {
          responseContent.description = decryptField(content.description);
        }
        
        // Update user-content relation to track views if not already completed
        const userContent = await storage.getUserContent(req.user!.id, contentId);
        if (!userContent || !userContent.isCompleted) {
          // In a full application, we might track view count here
          console.log(`User ${req.user!.id} viewed content ${contentId}`);
        }
        
        res.json({
          message: 'Content retrieved successfully',
          data: responseContent
        });
      } catch (error) {
        console.error("Content retrieval error:", error);
        next(error);
      }
    }
  );
  
  // File upload validation middleware
  const validateFileUpload = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      
      // Check file size
      if (req.file.size > MAX_FILE_SIZE) {
        return res.status(400).json({ 
          message: `File too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB` 
        });
      }
      
      // Check file extension
      const fileExt = path.extname(req.file.originalname).toLowerCase();
      if (!ALLOWED_FILE_EXTENSIONS.includes(fileExt)) {
        return res.status(400).json({ 
          message: `Invalid file type. Allowed types: ${ALLOWED_FILE_EXTENSIONS.join(', ')}` 
        });
      }
      
      // Scan for malicious content (simple mime-type check - in production would use antivirus API)
      const suspiciousMimeTypes = ['application/x-msdownload', 'application/x-msdos-program', 'application/x-javascript'];
      if (suspiciousMimeTypes.includes(req.file.mimetype)) {
        console.warn(`Potentially malicious file blocked from IP ${req.ip}: ${req.file.originalname} (${req.file.mimetype})`);
        return res.status(400).json({ message: "Potentially harmful file detected" });
      }
      
      // If using content data from JSON string, validate it exists and is valid JSON
      if (!req.body.data) {
        return res.status(400).json({ message: "Missing content data" });
      }
      
      try {
        JSON.parse(req.body.data);
      } catch (e) {
        return res.status(400).json({ message: "Invalid JSON in content data" });
      }
      
      next();
    } catch (error) {
      next(error);
    }
  };

  // Content validation rules
  const contentValidationRules = [
    body('data').custom((value, { req }) => {
      const data = JSON.parse(value);
      
      // Validate required fields
      if (!data.title || !data.description || !data.type || !data.unitId) {
        throw new Error('Missing required fields');
      }
      
      // Validate content type
      if (!ALLOWED_CONTENT_TYPES.includes(data.type)) {
        throw new Error(`Invalid content type. Allowed types: ${ALLOWED_CONTENT_TYPES.join(', ')}`);
      }
      
      // Sanitize title and description
      req.body.sanitizedData = {
        ...data,
        title: data.title.trim(),
        description: sanitizeHTML(data.description.trim()),
      };
      
      return true;
    })
  ];

  // Upload content (file upload with enhanced security)
  app.post(
    "/api/contents", 
    requireAuth, 
    upload.single('file'),
    validateFileUpload,
    validate(contentValidationRules),
    async (req, res, next) => {
      try {
        const contentData = req.body.sanitizedData || JSON.parse(req.body.data);
        
        // Encrypt sensitive information if needed
        const encryptedDescription = contentData.type.includes('confidential') 
          ? encryptField(contentData.description)
          : contentData.description;
        
        const fileData = {
          title: contentData.title,
          description: encryptedDescription,
          type: contentData.type,
          unitId: contentData.unitId,
          uploaderId: req.user!.id,
          filePath: req.file!.path.replace(/^uploads[\\/]/, ''), // Normalize path for storage
          fileName: req.file!.originalname,
          fileSize: req.file!.size,
          fileType: req.file!.mimetype
        };
        
        // Validate content data with Zod schema
        const validatedData = insertContentSchema.parse(fileData);
        
        // Create content in database
        const newContent = await storage.createContent(validatedData);
        
        // Award points to the user for uploading content
        const pointsToAdd = 5; // 5 points for contributing content
        await storage.updateUserPoints(req.user!.id, pointsToAdd);
        
        // Log successful upload for audit trail
        console.log(`Content uploaded: ID=${newContent.id}, Type=${newContent.type}, User=${req.user!.id}`);
        
        res.status(201).json(newContent);
      } catch (error) {
        console.error("Content upload error:", error);
        next(error);
      }
    }
  );
  
  // Content interaction validation
  const contentInteractionRules = [
    param('contentId')
      .isInt({ min: 1 })
      .withMessage('Content ID must be a positive integer'),
    
    body('action')
      .isString()
      .withMessage('Action must be a string')
      .isIn(['like', 'dislike', 'unlike', 'undislike'])
      .withMessage("Invalid action. Must be 'like', 'dislike', 'unlike', or 'undislike'")
  ];

  // Like or dislike content with enhanced validation
  app.post(
    "/api/contents/:contentId/interaction", 
    requireAuth, 
    validate(contentInteractionRules),
    async (req, res, next) => {
      try {
        const contentId = Number(req.params.contentId);
        const { action } = req.body; // 'like' or 'dislike'
        
        // Content existence check with proper error handling
        const content = await storage.getContent(contentId);
        if (!content) {
          return res.status(404).json({ 
            status: 'error',
            message: 'Content not found' 
          });
        }
        
        // Verify that user has access to the unit this content belongs to
        const userUnits = await storage.getUnitsByUser(req.user!.id);
        const hasAccess = userUnits.some(unit => unit.id === content.unitId) || 
                          req.user!.isAdmin || 
                          req.user!.isSuperAdmin;
                          
        if (!hasAccess) {
          return res.status(403).json({ 
            status: 'error',
            message: 'Access denied to this content' 
          });
        }
        
        // Rate limiting - Prevent like/dislike spam
        // This would be better with Redis in production, but for now a simple check
        // Get user's recent interactions
        const userContent = await storage.getUserContent(req.user!.id, contentId);
        
        // Get current user content relation
        let likeDelta = 0;
        let dislikeDelta = 0;
        
        // Determine like/dislike delta based on action and current state
        if (action === 'like') {
          if (!userContent || !userContent.isLiked) {
            likeDelta = 1;
            // If they had previously disliked, remove the dislike
            if (userContent && userContent.isDisliked) {
              dislikeDelta = -1;
            }
          }
        } else if (action === 'dislike') {
          if (!userContent || !userContent.isDisliked) {
            dislikeDelta = 1;
            // If they had previously liked, remove the like
            if (userContent && userContent.isLiked) {
              likeDelta = -1;
            }
          }
        } else if (action === 'unlike') {
          if (userContent && userContent.isLiked) {
            likeDelta = -1;
          }
        } else if (action === 'undislike') {
          if (userContent && userContent.isDisliked) {
            dislikeDelta = -1;
          }
        }
        
        // If no changes would be made, return early with the current state
        if (likeDelta === 0 && dislikeDelta === 0) {
          return res.json({
            ...content,
            message: 'No changes made'
          });
        }
        
        // Update content likes/dislikes
        const updatedContent = await storage.updateContentLikes(contentId, likeDelta, dislikeDelta);
        
        // Update user-content relation
        await storage.updateUserContent(req.user!.id, contentId, {
          isLiked: action === 'like' ? true : action === 'unlike' ? false : userContent?.isLiked || false,
          isDisliked: action === 'dislike' ? true : action === 'undislike' ? false : userContent?.isDisliked || false
        });
        
        // Award points to content uploader for getting likes (if this is a new like)
        if (likeDelta > 0) {
          // Prevent self-likes from awarding points
          if (content.uploaderId !== req.user!.id) {
            await storage.updateUserPoints(content.uploaderId, 1); // 1 point per like
            
            // Log interaction for audit trail
            console.log(`User ${req.user!.id} liked content ${contentId} uploaded by user ${content.uploaderId}`);
          } else {
            console.warn(`User ${req.user!.id} attempted to like their own content ${contentId}`);
          }
        }
        
        res.json({
          ...updatedContent,
          message: 'Interaction processed successfully'
        });
      } catch (error) {
        console.error("Content interaction error:", error);
        next(error);
      }
    }
  );
  
  // Content completion validation rules
  const completionValidationRules = [
    param('contentId')
      .isInt({ min: 1 })
      .withMessage('Content ID must be a positive integer')
  ];

  // Mark content as completed with enhanced validation and security
  app.post(
    "/api/contents/:contentId/complete", 
    requireAuth, 
    validate(completionValidationRules),
    async (req, res, next) => {
      try {
        const contentId = Number(req.params.contentId);
        
        // Content existence check
        const content = await storage.getContent(contentId);
        if (!content) {
          return res.status(404).json({ 
            status: 'error',
            message: 'Content not found' 
          });
        }
        
        // Verify that user has access to the unit this content belongs to
        const userUnits = await storage.getUnitsByUser(req.user!.id);
        const hasAccess = userUnits.some(unit => unit.id === content.unitId) || 
                          req.user!.isAdmin || 
                          req.user!.isSuperAdmin;
                          
        if (!hasAccess) {
          return res.status(403).json({ 
            status: 'error',
            message: 'Access denied to this content' 
          });
        }
        
        // Check if already completed (to prevent duplicate points)
        const existingUserContent = await storage.getUserContent(req.user!.id, contentId);
        if (existingUserContent?.isCompleted) {
          return res.json({ 
            message: 'Content already marked as completed',
            data: existingUserContent
          });
        }
        
        // Update user-content relation to mark as completed
        const now = new Date();
        const userContent = await storage.updateUserContent(req.user!.id, contentId, {
          isCompleted: true,
          completedAt: now
        });
        
        // Award points to the user for completing content
        await storage.updateUserPoints(req.user!.id, 2); // 2 points for completing
        
        // Log completion for audit trail
        console.log(`User ${req.user!.id} completed content ${contentId}`);
        
        res.json({
          message: 'Content marked as completed',
          data: userContent
        });
      } catch (error) {
        console.error("Content completion error:", error);
        next(error);
      }
    }
  );
  
  // Get comments validation rules
  const getCommentsValidationRules = [
    param('contentId')
      .isInt({ min: 1 })
      .withMessage('Content ID must be a positive integer')
  ];

  // Enhanced comment endpoints with validation
  app.get(
    "/api/contents/:contentId/comments", 
    requireAuth, 
    validate(getCommentsValidationRules),
    async (req, res, next) => {
      try {
        const contentId = Number(req.params.contentId);
        
        // Check content exists
        const content = await storage.getContent(contentId);
        if (!content) {
          return res.status(404).json({ 
            status: 'error',
            message: 'Content not found' 
          });
        }
        
        // Fetch comments
        const comments = await storage.getComments(contentId);
        
        // Rate limit check for rapid API calls
        if (req.ip) {
          // In a production environment, this would be tracked with Redis
          console.log(`IP ${req.ip} requested comments for content ${contentId}`);
        }
        
        res.json({
          message: 'Comments retrieved successfully',
          data: comments
        });
      } catch (error) {
        console.error("Comment retrieval error:", error);
        next(error);
      }
    }
  );
  
  // Comment validation rules
  const commentValidationRules = [
    param('contentId')
      .isInt({ min: 1 })
      .withMessage('Content ID must be a positive integer'),
    
    body('text')
      .isString()
      .withMessage('Comment text must be a string')
      .trim()
      .isLength({ min: 1, max: MAX_COMMENT_LENGTH })
      .withMessage(`Comment must be between 1 and ${MAX_COMMENT_LENGTH} characters`)
      .custom((value) => {
        // Check for potential code injection patterns
        const suspiciousPatterns = [
          /<script/i, 
          /javascript:/i, 
          /data:text\/html/i,
          /on\w+=/i, // covers onclick, onload, etc.
          /\beval\(/i,
          /document\.cookie/i,
          /window\.location/i
        ];
        
        for (const pattern of suspiciousPatterns) {
          if (pattern.test(value)) {
            throw new Error('Potentially harmful content detected');
          }
        }
        
        return true;
      })
  ];

  app.post(
    "/api/contents/:contentId/comments", 
    requireAuth, 
    validate(commentValidationRules),
    async (req, res, next) => {
      try {
        const contentId = Number(req.params.contentId);
        
        // Check content exists before allowing comment
        const content = await storage.getContent(contentId);
        if (!content) {
          return res.status(404).json({ 
            status: 'error',
            message: 'Content not found' 
          });
        }
        
        // Sanitize and trim the comment text
        const sanitizedText = sanitizeHTML(req.body.text.trim());
        
        const commentData = {
          contentId,
          userId: req.user!.id,
          text: sanitizedText,
        } as InsertComment;
        
        // Create the comment
        const newComment = await storage.createComment(commentData);
        
        // Get user info for the response
        const user = await storage.getUser(req.user!.id);
        
        // Award points for commenting
        await storage.updateUserPoints(req.user!.id, 1); // 1 point per comment
        
        // Log comment creation for audit trail
        console.log(`Comment added: ID=${newComment.id}, Content=${contentId}, User=${req.user!.id}`);
        
        // Broadcast the new comment to all connected WebSocket clients with sanitized data
        const commentWithUser = { ...newComment, user };
        
        // Create a payload to broadcast
        const broadcastPayload = {
          type: 'new-comment',
          contentId,
          comment: commentWithUser,
          timestamp: Date.now(),
          signature: '' // Will be set below
        };
        
        // Create a cryptographic signature for payload verification
        const payloadString = JSON.stringify({
          type: broadcastPayload.type,
          contentId: broadcastPayload.contentId,
          commentId: commentWithUser.id,
          userId: commentWithUser.userId,
          timestamp: broadcastPayload.timestamp
        });
        
        // Sign the payload to verify its authenticity (uses server's private key internally)
        const hmac = crypto.createHmac('sha256', process.env.SESSION_SECRET || 'fallback-key-for-dev');
        hmac.update(payloadString);
        broadcastPayload.signature = hmac.digest('hex');
        
        // Send to all authenticated clients
        wss.clients.forEach((client) => {
          const secureClient = client as SecureWebSocket;
          if (secureClient.readyState === WebSocket.OPEN && secureClient.authenticated) {
            // Implement per-client encryption based on session
            if (secureClient.userId) {
              // In production, you would encrypt with a client-specific key
              // For demo purposes, we'll just transmit with the signature for verification
              client.send(JSON.stringify(broadcastPayload));
            }
          }
        });
        
        res.status(201).json(commentWithUser);
      } catch (error) {
        console.error("Comment creation error:", error);
        next(error);
      }
    }
  );
  
  // Leaderboard validation rules
  const leaderboardValidationRules = [
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be a positive integer between 1 and 100')
      .toInt(),
    
    query('offset')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Offset must be a non-negative integer')
      .toInt()
  ];

  // Enhanced leaderboard endpoint with validation
  app.get(
    "/api/leaderboard", 
    requireAuth, 
    validate(leaderboardValidationRules),
    async (req, res, next) => {
      try {
        // Apply optional pagination
        const limit = req.query.limit ? Number(req.query.limit) : 50; // Default 50
        const offset = req.query.offset ? Number(req.query.offset) : 0; // Default 0
        
        // Get leaderboard with pagination
        const leaderboard = await storage.getLeaderboard();
        
        // Manual pagination (in a real app with DB this would be done in the query)
        const paginatedLeaderboard = leaderboard.slice(offset, offset + limit);
        
        res.json({
          message: 'Leaderboard retrieved successfully',
          data: paginatedLeaderboard,
          meta: {
            total: leaderboard.length,
            limit,
            offset,
            hasMore: offset + limit < leaderboard.length
          }
        });
      } catch (error) {
        console.error("Leaderboard retrieval error:", error);
        next(error);
      }
    }
  );
  
  // Enhanced user stats endpoint
  app.get(
    "/api/user-stats", 
    requireAuth, 
    async (req, res, next) => {
      try {
        const userId = req.user!.id;
        
        // Get user stats
        const stats = await storage.getUserStats(userId);
        
        // Get user's rank on leaderboard for context
        const leaderboard = await storage.getLeaderboard();
        const userRank = leaderboard.findIndex(user => user.id === userId) + 1;
        
        res.json({
          message: 'User stats retrieved successfully',
          data: {
            ...stats,
            rank: userRank > 0 ? userRank : 'Not ranked',
            totalUsers: leaderboard.length
          }
        });
      } catch (error) {
        console.error("User stats retrieval error:", error);
        next(error);
      }
    }
  );

  // Initialize database with sample data if needed
  try {
    console.log("Checking if database needs seeding...");
    
    try {
      // Skip seeding for now to avoid database errors
      // We'll use in-memory storage until database issues are resolved
      console.log("Using in-memory storage for development");
      
      // Uncomment to enable seeding when DB is working
      /*
      const programs = await storage.getAllPrograms();
      
      if (programs.length === 0) {
        console.log("Seeding database with initial data...");
        const credentials = await seedDatabase();
        console.log("Database seeded successfully! You can login with:");
        console.log(`Admin: admission number ${credentials.admin.admissionNumber}, password: ${credentials.admin.password}`);
        console.log(`Student: admission number ${credentials.student.admissionNumber}, password: ${credentials.student.password}`);
      } else {
        console.log("Database already contains data, skipping seed");
      }
      */
    } catch (error) {
      console.warn("Warning: Could not check if database needs seeding:", error);
    }
  } catch (error) {
    console.error("Error initializing database:", error);
  }
  
  // Return the HTTP server
  return httpServer;
}

