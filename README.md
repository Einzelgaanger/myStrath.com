# University Learning Hub

A comprehensive learning management system designed for universities, enabling students to share and access educational content within their academic hierarchy.

## System Architecture

### 1. Database Layer (`server/db.ts`)

The system uses PostgreSQL with Drizzle ORM for database operations. Key components:

```typescript
// Database Configuration
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // How long a client is allowed to remain idle before being closed
  connectionTimeoutMillis: 2000, // How long to wait for a connection
});

// Drizzle ORM Setup
export const db = drizzle(pool, {
  schema: {
    users,
    contents,
    comments,
    // ... other schemas
  }
});
```

Features:
- Connection pooling for efficient resource management
- Automatic retry mechanism for failed queries
- Transaction support for atomic operations
- Health monitoring and statistics
- Query timeout protection
- Migration management

### 2. Storage Layer (`server/storage.ts`)

Implements the `IStorage` interface for all data operations. Key operations:

```typescript
interface IStorage {
  // User Operations
  getUser(id: number): Promise<User | undefined>;
  getUserByAdmissionNumber(admissionNumber: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, data: Partial<User>): Promise<User>;
  
  // Academic Hierarchy Operations
  getCountries(): Promise<Country[]>;
  getUniversities(countryId?: number): Promise<University[]>;
  getPrograms(universityId?: number): Promise<Program[]>;
  // ... other hierarchy operations
  
  // Content Operations
  getContents(unitId: number): Promise<Content[]>;
  createContent(content: InsertContent): Promise<Content>;
  updateContent(id: number, data: Partial<Content>): Promise<Content>;
  
  // User-Content Relations
  getUserContent(userId: number, contentId: number): Promise<UserContent | undefined>;
  updateUserContent(userId: number, contentId: number, data: Partial<UserContent>): Promise<UserContent>;
  
  // Comments
  getComments(contentId: number): Promise<Comment[]>;
  createComment(comment: InsertComment): Promise<Comment>;
  
  // Leaderboard
  getLeaderboard(): Promise<LeaderboardEntry[]>;
}
```

### 3. Authentication System (`server/auth.ts`)

Handles user authentication and authorization:

```typescript
// Password Hashing
export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

// Password Comparison
export async function comparePasswords(supplied: string, stored: string) {
  // Handles both bcrypt and scrypt hashes
  if (stored.startsWith('$2b$')) {
    return bcrypt.compare(supplied, stored);
  }
  // ... scrypt comparison logic
}

// Session Configuration
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === "production",
    maxAge: 24 * 60 * 60 * 1000
  }
}));
```

Features:
- Session-based authentication
- Password hashing with bcrypt/scrypt
- Role-based access control
- Password reset functionality
- Session management
- Security middleware

### 4. API Routes

#### Authentication Routes (`server/routes/auth.ts`)

```typescript
// Registration
POST /api/register
Body: {
  username: string
  admissionNumber: string
  password: string
  countryId: number
  universityId: number
  programId: number
  courseId: number
  yearId: number
  semesterId: number
  groupId: number
}

// Login
POST /api/login
Body: {
  admissionNumber: string
  password: string
}

// Password Change
POST /api/change-password
Body: {
  currentPassword: string
  newPassword: string
}

// Password Reset (Admin only)
POST /api/reset-password
Body: {
  admissionNumber: string
  secretKey: string
}
```

#### Content Routes (`server/routes/content.ts`)

```typescript
// Get Unit Contents
GET /api/contents/unit/:unitId

// Create Content
POST /api/contents
Body: {
  title: string
  description: string
  type: "assignment" | "note" | "pastPaper"
  unitId: number
  dueDate?: string
  files?: File[]
}

// Update Content
PUT /api/contents/:contentId
Body: {
  title?: string
  description?: string
  dueDate?: string
}

// Delete Content
DELETE /api/contents/:contentId

// Add Comment
POST /api/contents/:contentId/comments
Body: {
  text: string
}

// Interact with Content
POST /api/contents/:contentId/interact
Body: {
  action: "like" | "dislike" | "complete"
}
```

#### Notification Routes (`server/routes/notification.ts`)

```typescript
// Get Notifications
GET /api/notifications

// Get Unread Count
GET /api/notifications/unread/count

// Mark as Read
PATCH /api/notifications/:id/read

// Mark All as Read
PATCH /api/notifications/read-all
```

#### Settings Routes (`server/routes/settings.ts`)

```typescript
// Get All Settings
GET /api/settings

// Get Setting by Key
GET /api/settings/:key

// Create Setting
POST /api/settings
Body: {
  key: string
  value: string
  description?: string
}

// Update Setting
PATCH /api/settings/:key
Body: {
  value?: string
  description?: string
}

// Delete Setting
DELETE /api/settings/:key
```

#### User Routes (`server/routes/user.ts`)

```typescript
// Get Current User
GET /api/users/me

// Update Profile
PATCH /api/users/me
Body: {
  username?: string
  profilePicture?: string
}

// Get All Users (Admin only)
GET /api/users

// Get User by Admission Number
GET /api/users/:admissionNumber

// Update User (Admin only)
PATCH /api/users/:admissionNumber
Body: {
  username?: string
  isAdmin?: boolean
  isSuperAdmin?: boolean
}

// Delete User (Admin only)
DELETE /api/users/:admissionNumber
```

### 5. Data Models

#### User Model
```typescript
interface User {
  id: number
  username: string
  password: string
  admissionNumber: string
  profilePicture: string | null
  points: number
  isAdmin: boolean
  isSuperAdmin: boolean
  countryId: number
  universityId: number
  programId: number
  courseId: number
  yearId: number
  semesterId: number
  groupId: number
  classCode: string
  isUsingDefaultPassword: boolean
  createdAt: Date
  lastActiveAt: Date
}
```

#### Content Model
```typescript
interface Content {
  id: number
  title: string
  description: string
  type: "assignment" | "note" | "pastPaper"
  unitId: number
  uploaderId: number
  dueDate?: Date
  createdAt: Date
  updatedAt: Date
}
```

#### User-Content Relation
```typescript
interface UserContent {
  userId: number
  contentId: number
  isCompleted: boolean
  completedAt?: Date
  isLiked: boolean
  isDisliked: boolean
}
```

### 6. Security Features

1. **Authentication**
   - Session-based auth with secure cookies
   - Password hashing with bcrypt/scrypt
   - JWT tokens for API authentication
   - Role-based access control

2. **Data Protection**
   - Input validation using Zod schemas
   - SQL injection prevention via Drizzle ORM
   - XSS protection
   - CSRF protection
   - Rate limiting

3. **File Security**
   - Secure file upload handling
   - File type validation
   - Size limits
   - Virus scanning (if configured)

### 7. Performance Optimizations

1. **Database**
   - Connection pooling
   - Query optimization
   - Indexing strategy
   - Caching layer

2. **Application**
   - Response compression
   - Static file caching
   - Lazy loading
   - Pagination

### 8. Monitoring and Logging

1. **System Health**
   - Database connection monitoring
   - Query performance tracking
   - Error logging
   - User activity tracking

2. **Analytics**
   - User engagement metrics
   - Content popularity
   - System usage statistics
   - Performance metrics

### 9. Deployment Considerations

1. **Environment Setup**
   ```bash
   # Required environment variables
   DATABASE_URL=postgresql://user:password@localhost:5432/dbname
   SESSION_SECRET=your-secret-key
   NODE_ENV=production
   PORT=3000
   ```

2. **Database Setup**
   ```bash
   # Run migrations
   npm run migrate
   
   # Seed initial data
   npm run seed
   ```

3. **Production Configuration**
   - SSL/TLS setup
   - Load balancing
   - CDN configuration
   - Backup strategy

### 10. Development Workflow

1. **Setup**
   ```bash
   # Install dependencies
   npm install
   
   # Start development server
   npm run dev
   ```

2. **Testing**
   ```bash
   # Run unit tests
   npm test
   
   # Run integration tests
   npm run test:integration
   ```

3. **Building**
   ```bash
   # Build for production
   npm run build
   ```

### 11. Error Handling

The system implements comprehensive error handling:

```typescript
// Global error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    message: "Internal server error",
    error: process.env.NODE_ENV === "development" ? err.message : undefined
  });
});

// Custom error classes
class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public isOperational = true
  ) {
    super(message);
  }
}
```

### 12. File Structure

```
/
├── server/
│   ├── auth.ts           # Authentication logic
│   ├── db.ts            # Database configuration
│   ├── storage.ts       # Data access layer
│   ├── utils.ts         # Utility functions
│   └── routes/
│       ├── auth.ts      # Authentication routes
│       ├── content.ts   # Content management
│       ├── notification.ts # Notifications
│       ├── settings.ts  # System settings
│       └── user.ts      # User management
├── shared/
│   └── schema.ts        # Shared type definitions
├── client/              # Frontend application
└── package.json         # Project configuration
```

### 13. API Documentation

Detailed API documentation is available at `/api-docs` when running in development mode.

### 14. Contributing

1. Fork the repository
2. Create a feature branch
3. Commit changes
4. Push to the branch
5. Create a Pull Request

### 15. License

This project is licensed under the MIT License - see the LICENSE file for details.
# myStrath.com
# myStrath.com
