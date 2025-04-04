import * as schema from '../shared/schema';
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { sql } from 'drizzle-orm';
import postgres from 'postgres';
import fs from 'fs';
import path from 'path';

// Function to generate schema SQL
async function generateSchemaSQL() {
  // Create SQL statements for all tables
  let sqlScript = `
-- Drop existing tables and types
DROP TABLE IF EXISTS profile_settings CASCADE;
DROP TABLE IF EXISTS dashboard_messages CASCADE;
DROP TABLE IF EXISTS user_contents CASCADE;
DROP TABLE IF EXISTS comments CASCADE;
DROP TABLE IF EXISTS contents CASCADE;
DROP TABLE IF EXISTS units CASCADE;
DROP TABLE IF EXISTS groups CASCADE;
DROP TABLE IF EXISTS semesters CASCADE;
DROP TABLE IF EXISTS years CASCADE;
DROP TABLE IF EXISTS courses CASCADE;
DROP TABLE IF EXISTS programs CASCADE;
DROP TABLE IF EXISTS universities CASCADE;
DROP TABLE IF EXISTS countries CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TYPE IF EXISTS badge_type CASCADE;

-- Create badge_type enum
CREATE TYPE badge_type AS ENUM ('Novice', 'Beginner', 'Contributor', 'Advanced', 'Expert', 'Master', 'Scholar', 'Champion', 'Elite', 'Legend');

-- Create countries table
CREATE TABLE countries (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT NOT NULL
);

-- Create universities table
CREATE TABLE universities (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  country_id INTEGER NOT NULL REFERENCES countries(id),
  code TEXT NOT NULL
);

-- Create programs table
CREATE TABLE programs (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  university_id INTEGER NOT NULL REFERENCES universities(id),
  code TEXT NOT NULL
);

-- Create courses table
CREATE TABLE courses (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  program_id INTEGER NOT NULL REFERENCES programs(id),
  code TEXT NOT NULL
);

-- Create years table
CREATE TABLE years (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  course_id INTEGER NOT NULL REFERENCES courses(id),
  code TEXT NOT NULL
);

-- Create semesters table
CREATE TABLE semesters (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  year_id INTEGER NOT NULL REFERENCES years(id),
  code TEXT NOT NULL
);

-- Create groups table
CREATE TABLE groups (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  semester_id INTEGER NOT NULL REFERENCES semesters(id),
  code TEXT NOT NULL
);

-- Create users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username TEXT NOT NULL,
  password TEXT NOT NULL,
  admission_number TEXT NOT NULL UNIQUE,
  profile_picture TEXT,
  points INTEGER NOT NULL DEFAULT 0,
  is_admin BOOLEAN NOT NULL DEFAULT false,
  is_super_admin BOOLEAN NOT NULL DEFAULT false,
  country_id INTEGER NOT NULL REFERENCES countries(id),
  university_id INTEGER NOT NULL REFERENCES universities(id),
  program_id INTEGER NOT NULL REFERENCES programs(id),
  course_id INTEGER NOT NULL REFERENCES courses(id),
  year_id INTEGER NOT NULL REFERENCES years(id),
  semester_id INTEGER NOT NULL REFERENCES semesters(id),
  group_id INTEGER NOT NULL REFERENCES groups(id),
  class_code TEXT NOT NULL,
  is_using_default_password BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  last_active_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create units table
CREATE TABLE units (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  description TEXT,
  group_id INTEGER NOT NULL REFERENCES groups(id)
);

-- Create contents table
CREATE TABLE contents (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  type TEXT NOT NULL,
  file_path TEXT,
  file_name TEXT,
  due_date TIMESTAMP WITH TIME ZONE,
  year INTEGER,
  uploader_id INTEGER NOT NULL REFERENCES users(id),
  unit_id INTEGER NOT NULL REFERENCES units(id),
  likes INTEGER NOT NULL DEFAULT 0,
  dislikes INTEGER NOT NULL DEFAULT 0,
  uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create user_contents table (relationship and progress tracking)
CREATE TABLE user_contents (
  user_id INTEGER NOT NULL REFERENCES users(id),
  content_id INTEGER NOT NULL REFERENCES contents(id),
  is_completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  is_liked BOOLEAN NOT NULL DEFAULT false,
  is_disliked BOOLEAN NOT NULL DEFAULT false,
  PRIMARY KEY (user_id, content_id)
);

-- Create comments table
CREATE TABLE comments (
  id SERIAL PRIMARY KEY,
  content TEXT NOT NULL,
  user_id INTEGER NOT NULL REFERENCES users(id),
  content_id INTEGER NOT NULL REFERENCES contents(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create dashboard_messages table
CREATE TABLE dashboard_messages (
  id SERIAL PRIMARY KEY,
  message TEXT NOT NULL,
  is_urgent BOOLEAN NOT NULL DEFAULT false,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  end_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create profile_settings table
CREATE TABLE profile_settings (
  user_id INTEGER PRIMARY KEY REFERENCES users(id),
  theme TEXT NOT NULL DEFAULT 'light',
  language TEXT NOT NULL DEFAULT 'en',
  notifications_enabled BOOLEAN NOT NULL DEFAULT true
);

-- Trigger to update last_active_at
CREATE OR REPLACE FUNCTION update_last_active_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_active_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_last_active_trigger
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_last_active_at();

-- Seed data
-- Countries
INSERT INTO countries (name, code) VALUES ('Kenya', 'KE');

-- Universities
INSERT INTO universities (name, country_id, code) VALUES ('University of Nairobi', 1, 'UON');

-- Programs
INSERT INTO programs (name, university_id, code) VALUES ('Bachelor of Science', 1, 'BSC');
INSERT INTO programs (name, university_id, code) VALUES ('Bachelor of Commerce', 1, 'BCOM');

-- Courses
INSERT INTO courses (name, program_id, code) VALUES ('Computer Science', 1, 'CSE');
INSERT INTO courses (name, program_id, code) VALUES ('Finance', 2, 'FIN');

-- Years
INSERT INTO years (name, course_id, code) VALUES ('Year 1', 1, 'Y1');
INSERT INTO years (name, course_id, code) VALUES ('Year 1', 2, 'Y1');

-- Semesters
INSERT INTO semesters (name, year_id, code) VALUES ('Semester 1', 1, 'S1');
INSERT INTO semesters (name, year_id, code) VALUES ('Semester 1', 2, 'S1');

-- Groups
INSERT INTO groups (name, semester_id, code) VALUES ('Group A', 1, 'GA');
INSERT INTO groups (name, semester_id, code) VALUES ('Group A', 2, 'GA');

-- Units
INSERT INTO units (name, code, description, group_id) VALUES 
  ('Introduction to Programming', 'CSE101', 'Learn fundamentals of programming using Python', 1);
INSERT INTO units (name, code, description, group_id) VALUES 
  ('Web Development', 'CSE102', 'Introduction to web technologies', 1);
INSERT INTO units (name, code, description, group_id) VALUES 
  ('Introduction to Accounting', 'FIN101', 'Basic accounting principles', 2);

-- Users
INSERT INTO users (username, password, admission_number, profile_picture, points, is_admin, is_super_admin,
  country_id, university_id, program_id, course_id, year_id, semester_id, group_id, class_code)
VALUES (
  'Admin User', 
  '$2b$10$M1/Y1J9T5X5fCVDrQQTJvO0h0pHIHt1XrJV.U8lKCrQxI5kA.jTJi',  -- hashed 'stratizens#web'
  '000001', 
  NULL, 
  1000, 
  true, 
  true,
  1, 1, 1, 1, 1, 1, 1,
  'ADMIN123'
);

INSERT INTO users (username, password, admission_number, profile_picture, points, is_admin, is_super_admin,
  country_id, university_id, program_id, course_id, year_id, semester_id, group_id, class_code)
VALUES (
  'Student User', 
  '$2b$10$M1/Y1J9T5X5fCVDrQQTJvO0h0pHIHt1XrJV.U8lKCrQxI5kA.jTJi',  -- hashed 'stratizens#web'
  '180963', 
  NULL, 
  50, 
  false, 
  false,
  1, 1, 1, 1, 1, 1, 1,
  'STDNT123'
);

-- Content examples
INSERT INTO contents (title, description, type, unit_id, uploader_id) VALUES 
  ('Introduction to Python', 'Basic syntax and concepts in Python programming', 'notes', 1, 1);
INSERT INTO contents (title, description, type, due_date, unit_id, uploader_id) VALUES 
  ('Programming Assignment 1', 'Create a simple calculator in Python', 'assignment', NOW() + INTERVAL '7 days', 1, 1);
`;

  // Write to file
  const outputPath = path.join(__dirname, '../schema.sql');
  fs.writeFileSync(outputPath, sqlScript, 'utf8');
  console.log(`Schema SQL generated and saved to ${outputPath}`);
}

// Run the function
generateSchemaSQL().catch(console.error);