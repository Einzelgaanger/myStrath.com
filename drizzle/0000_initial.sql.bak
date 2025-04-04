CREATE TABLE IF NOT EXISTS "programs" (
    "id" SERIAL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT
);

CREATE TABLE IF NOT EXISTS "courses" (
    "id" SERIAL PRIMARY KEY,
    "program_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT
);

CREATE TABLE IF NOT EXISTS "years" (
    "id" SERIAL PRIMARY KEY,
    "course_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT
);

CREATE TABLE IF NOT EXISTS "semesters" (
    "id" SERIAL PRIMARY KEY,
    "year_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT
);

CREATE TABLE IF NOT EXISTS "groups" (
    "id" SERIAL PRIMARY KEY,
    "semester_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "admin_id" INTEGER
);

CREATE TABLE IF NOT EXISTS "units" (
    "id" SERIAL PRIMARY KEY,
    "group_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "instructor" TEXT
);

CREATE TABLE IF NOT EXISTS "users" (
    "id" SERIAL PRIMARY KEY,
    "username" TEXT NOT NULL,
    "email" TEXT,
    "admission_number" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "pin" TEXT,
    "profile_picture" TEXT,
    "points" INTEGER NOT NULL DEFAULT 0,
    "is_admin" BOOLEAN NOT NULL DEFAULT false,
    "is_super_admin" BOOLEAN NOT NULL DEFAULT false,
    "program_id" INTEGER NOT NULL,
    "course_id" INTEGER NOT NULL,
    "year_id" INTEGER NOT NULL,
    "semester_id" INTEGER NOT NULL,
    "group_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_active_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "contents" (
    "id" SERIAL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "file_path" TEXT,
    "year" TEXT,
    "due_date" TIMESTAMP,
    "uploader_id" INTEGER NOT NULL,
    "unit_id" INTEGER NOT NULL,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "dislikes" INTEGER NOT NULL DEFAULT 0,
    "uploaded_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "comments" (
    "id" SERIAL PRIMARY KEY,
    "text" TEXT NOT NULL,
    "user_id" INTEGER NOT NULL,
    "content_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "user_contents" (
    "user_id" INTEGER NOT NULL,
    "content_id" INTEGER NOT NULL,
    "is_completed" BOOLEAN NOT NULL DEFAULT false,
    "completed_at" TIMESTAMP,
    "is_liked" BOOLEAN NOT NULL DEFAULT false,
    "is_disliked" BOOLEAN NOT NULL DEFAULT false,
    PRIMARY KEY ("user_id", "content_id")
);

CREATE TABLE IF NOT EXISTS "dashboard_messages" (
    "id" SERIAL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS "courses_program_id_idx" ON "courses"("program_id");
CREATE INDEX IF NOT EXISTS "years_course_id_idx" ON "years"("course_id");
CREATE INDEX IF NOT EXISTS "semesters_year_id_idx" ON "semesters"("year_id");
CREATE INDEX IF NOT EXISTS "groups_semester_id_idx" ON "groups"("semester_id");
CREATE INDEX IF NOT EXISTS "units_group_id_idx" ON "units"("group_id");
CREATE INDEX IF NOT EXISTS "users_admission_number_idx" ON "users"("admission_number");
CREATE INDEX IF NOT EXISTS "users_group_id_idx" ON "users"("group_id");
CREATE INDEX IF NOT EXISTS "contents_unit_id_idx" ON "contents"("unit_id");
CREATE INDEX IF NOT EXISTS "contents_uploader_id_idx" ON "contents"("uploader_id");
CREATE INDEX IF NOT EXISTS "comments_content_id_idx" ON "comments"("content_id");
CREATE INDEX IF NOT EXISTS "comments_user_id_idx" ON "comments"("user_id");