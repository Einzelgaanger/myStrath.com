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

console.log(`${colors.blue}Starting targeted fix for db.js...${colors.reset}`);

try {
  // Fix the db.js file
  const dbFilePath = path.resolve(__dirname, 'server/db.ts');
  const dbDistFilePath = path.resolve(__dirname, 'dist/server/db.js');
  
  if (fs.existsSync(dbFilePath)) {
    console.log(`${colors.yellow}Processing db.ts file...${colors.reset}`);
    
    let content = fs.readFileSync(dbFilePath, 'utf-8');
    
    // Create a properly formatted JavaScript version
    content = `
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { sql } from "drizzle-orm";
import * as schema from "@shared/schema.js";

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
    
    // Create dist/server directory if it doesn't exist
    const serverDistDir = path.dirname(dbDistFilePath);
    if (!fs.existsSync(serverDistDir)) {
      fs.mkdirSync(serverDistDir, { recursive: true });
    }
    
    // Write the fixed file
    fs.writeFileSync(dbDistFilePath, content);
    console.log(`${colors.green}Fixed db.js file created successfully!${colors.reset}`);
  } else {
    console.error(`${colors.red}Error: db.ts file not found at ${dbFilePath}${colors.reset}`);
    process.exit(1);
  }
  
  console.log(`${colors.green}Fix completed successfully!${colors.reset}`);
} catch (error) {
  console.error(`${colors.red}Fix failed:${colors.reset}`, error);
  process.exit(1);
}
