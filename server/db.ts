import { Pool, PoolConfig } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { logger } from "drizzle-orm";
import { sql } from "drizzle-orm";

// Database connection configuration
const poolConfig: PoolConfig = {
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

// Create Drizzle ORM instance
export const db = drizzle(pool, {
  logger: process.env.NODE_ENV === "development" ? logger : false,
});

// Run database migrations
export async function runMigrations(): Promise<void> {
  try {
    console.log("Running database migrations...");
    await migrate(db, { migrationsFolder: "./drizzle" });
    console.log("Database migrations completed successfully");
    
    // Test database connection
    const result = await db.execute(sql`SELECT version()`);
    console.log("Database version:", result[0].version);
  } catch (error) {
    console.error("Error running migrations:", error);
    throw error;
  }
}

// Close database connections
export async function closeConnections(): Promise<void> {
  try {
    await pool.end();
    console.log("Database connections closed");
  } catch (error) {
    console.error("Error closing database connections:", error);
    throw error;
  }
}

// Check database health
export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    await db.execute(sql`SELECT 1`);
    return true;
  } catch (error) {
    console.error("Database health check failed:", error);
    return false;
  }
}

// Execute a transaction
export async function executeTransaction<T>(
  callback: (db: typeof db) => Promise<T>
): Promise<T> {
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
export async function executeQueryWithRetry<T>(
  query: string,
  params: any[] = [],
  maxRetries = 3,
  retryDelay = 1000
): Promise<T> {
  let lastError: Error | undefined;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await db.execute(sql.raw(query, params));
      return result as T;
    } catch (error) {
      lastError = error as Error;
      console.warn(`Query attempt ${attempt} failed:`, error);
      
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      }
    }
  }
  
  throw lastError;
}

// Execute a query with timeout
export async function executeQueryWithTimeout<T>(
  query: string,
  params: any[] = [],
  timeout = 5000
): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query(`SET statement_timeout = ${timeout}`);
    const result = await client.query(query, params);
    return result.rows as T;
  } finally {
    client.release();
  }
}

// Get database statistics
export async function getDatabaseStats(): Promise<{
  totalConnections: number;
  activeConnections: number;
  idleConnections: number;
  waitingClients: number;
}> {
  const stats = await db.execute(sql`
    SELECT
      count(*) as total_connections,
      sum(case when state = 'active' then 1 else 0 end) as active_connections,
      sum(case when state = 'idle' then 1 else 0 end) as idle_connections,
      sum(case when waiting then 1 else 0 end) as waiting_clients
    FROM pg_stat_activity
  `);
  
  return stats[0];
}

// Monitor database performance
export async function monitorDatabasePerformance(): Promise<{
  queryCount: number;
  avgQueryTime: number;
  slowQueries: number;
}> {
  const stats = await db.execute(sql`
    SELECT
      count(*) as query_count,
      avg(extract(epoch from (now() - query_start))) as avg_query_time,
      sum(case when extract(epoch from (now() - query_start)) > 1 then 1 else 0 end) as slow_queries
    FROM pg_stat_activity
    WHERE state = 'active'
  `);
  
  return stats[0];
}

// Clean up old connections
export async function cleanupOldConnections(maxIdleTime = 30000): Promise<void> {
  await db.execute(sql`
    SELECT pg_terminate_backend(pid)
    FROM pg_stat_activity
    WHERE state = 'idle'
    AND state_change < now() - interval '${maxIdleTime}ms'
  `);
}

// Reset database connection pool
export async function resetConnectionPool(): Promise<void> {
  await pool.end();
  Object.assign(pool, new Pool(poolConfig));
}

// Export pool for direct access if needed
export { pool };