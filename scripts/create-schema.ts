import { db } from '../server/db';
import * as schema from '../shared/schema';
import postgres from 'postgres';

// Create raw postgres client for executing SQL directly
const connectionString = process.env.DATABASE_URL!;
const sql = postgres(connectionString);

async function createSchema() {
  try {
    console.log('Creating database schema...');
    
    // First create the countries table
    await sql`
    CREATE TABLE IF NOT EXISTS "countries" (
      "id" SERIAL PRIMARY KEY,
      "name" TEXT NOT NULL UNIQUE,
      "code" TEXT NOT NULL UNIQUE
    )`;
    console.log('Created countries table');
    
    // Create universities table
    await sql`
    CREATE TABLE IF NOT EXISTS "universities" (
      "id" SERIAL PRIMARY KEY,
      "name" TEXT NOT NULL,
      "code" TEXT NOT NULL UNIQUE,
      "country_id" INTEGER NOT NULL
    )`;
    console.log('Created universities table');
    
    // Create programs table
    await sql`
    CREATE TABLE IF NOT EXISTS "programs" (
      "id" SERIAL PRIMARY KEY,
      "name" TEXT NOT NULL,
      "code" TEXT NOT NULL UNIQUE,
      "university_id" INTEGER NOT NULL
    )`;
    console.log('Created programs table');
    
    // Create courses table
    await sql`
    CREATE TABLE IF NOT EXISTS "courses" (
      "id" SERIAL PRIMARY KEY,
      "name" TEXT NOT NULL,
      "code" TEXT NOT NULL UNIQUE,
      "program_id" INTEGER NOT NULL
    )`;
    console.log('Created courses table');
    
    // Create years table
    await sql`
    CREATE TABLE IF NOT EXISTS "years" (
      "id" SERIAL PRIMARY KEY,
      "name" TEXT NOT NULL,
      "code" TEXT NOT NULL UNIQUE,
      "course_id" INTEGER NOT NULL
    )`;
    console.log('Created years table');
    
    // Create semesters table
    await sql`
    CREATE TABLE IF NOT EXISTS "semesters" (
      "id" SERIAL PRIMARY KEY,
      "name" TEXT NOT NULL,
      "code" TEXT NOT NULL UNIQUE,
      "year_id" INTEGER NOT NULL
    )`;
    console.log('Created semesters table');
    
    // Create groups table
    await sql`
    CREATE TABLE IF NOT EXISTS "groups" (
      "id" SERIAL PRIMARY KEY,
      "name" TEXT NOT NULL,
      "code" TEXT NOT NULL UNIQUE,
      "semester_id" INTEGER NOT NULL,
      "admin_id" INTEGER
    )`;
    console.log('Created groups table');
    
    // Create units table
    await sql`
    CREATE TABLE IF NOT EXISTS "units" (
      "id" SERIAL PRIMARY KEY,
      "name" TEXT NOT NULL,
      "code" TEXT NOT NULL UNIQUE,
      "group_id" INTEGER NOT NULL
    )`;
    console.log('Created units table');
    
    // Create users table
    await sql`
    CREATE TABLE IF NOT EXISTS "users" (
      "id" SERIAL PRIMARY KEY,
      "username" TEXT NOT NULL,
      "password" TEXT NOT NULL,
      "admission_number" TEXT NOT NULL UNIQUE,
      "profile_picture" TEXT,
      "points" INTEGER NOT NULL DEFAULT 0,
      "is_admin" BOOLEAN NOT NULL DEFAULT false,
      "is_super_admin" BOOLEAN NOT NULL DEFAULT false,
      "country_id" INTEGER NOT NULL,
      "university_id" INTEGER NOT NULL,
      "program_id" INTEGER NOT NULL,
      "course_id" INTEGER NOT NULL,
      "year_id" INTEGER NOT NULL,
      "semester_id" INTEGER NOT NULL,
      "group_id" INTEGER NOT NULL,
      "class_code" TEXT NOT NULL,
      "is_using_default_password" BOOLEAN NOT NULL DEFAULT true,
      "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
      "last_active_at" TIMESTAMP NOT NULL DEFAULT NOW()
    )`;
    console.log('Created users table');
    
    // Create contents table
    await sql`
    CREATE TABLE IF NOT EXISTS "contents" (
      "id" SERIAL PRIMARY KEY,
      "title" TEXT NOT NULL,
      "description" TEXT NOT NULL,
      "type" TEXT NOT NULL,
      "file_path" TEXT,
      "due_date" TIMESTAMP,
      "year" INTEGER,
      "uploader_id" INTEGER NOT NULL,
      "unit_id" INTEGER NOT NULL,
      "likes" INTEGER NOT NULL DEFAULT 0,
      "dislikes" INTEGER NOT NULL DEFAULT 0,
      "uploaded_at" TIMESTAMP NOT NULL DEFAULT NOW()
    )`;
    console.log('Created contents table');
    
    // Create comments table
    await sql`
    CREATE TABLE IF NOT EXISTS "comments" (
      "id" SERIAL PRIMARY KEY,
      "text" TEXT NOT NULL,
      "user_id" INTEGER NOT NULL,
      "content_id" INTEGER NOT NULL,
      "created_at" TIMESTAMP NOT NULL DEFAULT NOW()
    )`;
    console.log('Created comments table');
    
    // Create user_contents junction table
    await sql`
    CREATE TABLE IF NOT EXISTS "user_contents" (
      "user_id" INTEGER NOT NULL,
      "content_id" INTEGER NOT NULL,
      "is_completed" BOOLEAN NOT NULL DEFAULT false,
      "completed_at" TIMESTAMP,
      "is_liked" BOOLEAN DEFAULT false,
      "is_disliked" BOOLEAN DEFAULT false,
      PRIMARY KEY ("user_id", "content_id")
    )`;
    console.log('Created user_contents table');
    
    // Create dashboard_messages table
    await sql`
    CREATE TABLE IF NOT EXISTS "dashboard_messages" (
      "id" SERIAL PRIMARY KEY,
      "message" TEXT NOT NULL,
      "is_active" BOOLEAN NOT NULL DEFAULT true,
      "created_by_id" INTEGER NOT NULL,
      "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
      "updated_at" TIMESTAMP NOT NULL DEFAULT NOW()
    )`;
    console.log('Created dashboard_messages table');
    
    // Create session table for connect-pg-simple
    await sql`
    CREATE TABLE IF NOT EXISTS "session" (
      "sid" VARCHAR NOT NULL COLLATE "default",
      "sess" JSON NOT NULL,
      "expire" TIMESTAMP(6) NOT NULL,
      CONSTRAINT "session_pkey" PRIMARY KEY ("sid")
    )`;
    console.log('Created session table');
    
    console.log('All database tables created successfully');
  } catch (error) {
    console.error('Error creating schema:', error);
    throw error;
  }
}

createSchema()
  .then(() => {
    console.log('Schema creation completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Schema creation failed:', error);
    process.exit(1);
  });