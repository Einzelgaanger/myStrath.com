import pkg from 'pg';
const { Pool } = pkg;
import { drizzle } from "drizzle-orm/node-postgres";
import bcrypt from "bcrypt";
import { users } from "./shared/schema.js";
import { eq } from "drizzle-orm";

async function createTestUser() {
  // Connect to database
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false
  });
  
  const db = drizzle(pool);
  
  try {
    console.log("Creating test user...");
    
    // Hash password
    const password = "password123"; // Simple password for testing
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Check if test user already exists
    const existingUser = await db.select().from(users).where(eq(users.admissionNumber, "TEST001"));
    
    if (existingUser.length > 0) {
      console.log("Test user already exists with admission number TEST001");
      return;
    }
    
    // Create test user
    await db.insert(users).values({
      username: "Test User",
      password: hashedPassword,
      admissionNumber: "TEST001",
      profilePicture: null,
      points: 0,
      isAdmin: false,
      isSuperAdmin: false,
      countryId: 1,
      universityId: 1,
      programId: 1,
      courseId: 1,
      yearId: 1,
      semesterId: 1,
      groupId: 1,
      classCode: "TEST",
      isUsingDefaultPassword: true,
      createdAt: new Date(),
      lastActiveAt: new Date()
    });
    
    console.log("Test user created successfully:");
    console.log("Admission Number: TEST001");
    console.log("Password: password123");
    
  } catch (error) {
    console.error("Error creating test user:", error);
  } finally {
    await pool.end();
  }
}

createTestUser();