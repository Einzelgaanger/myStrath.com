import { pgTable, text, serial, integer, timestamp, unique, boolean, primaryKey, uuid, jsonb, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull(), // Full name
  password: text("password").notNull(),
  admissionNumber: text("admission_number").notNull().unique(),
  profilePicture: text("profile_picture"),
  points: integer("points").default(0).notNull(),
  isAdmin: boolean("is_admin").default(false).notNull(),
  isSuperAdmin: boolean("is_super_admin").default(false).notNull(),
  countryId: integer("country_id").notNull(),
  universityId: integer("university_id").notNull(),
  programId: integer("program_id").notNull(),
  courseId: integer("course_id").notNull(),
  yearId: integer("year_id").notNull(),
  semesterId: integer("semester_id").notNull(),
  groupId: integer("group_id").notNull(),
  classCode: text("class_code").notNull(), // The unique identifier for the class/group
  isUsingDefaultPassword: boolean("is_using_default_password").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  lastActiveAt: timestamp("last_active_at").defaultNow().notNull(),
});

// Academic Hierarchy
export const countries = pgTable("countries", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  code: text("code").notNull().unique(),
});

export const universities = pgTable("universities", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  code: text("code").notNull().unique(),
  countryId: integer("country_id").notNull(),
});

export const programs = pgTable("programs", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  code: text("code").notNull().unique(),
  universityId: integer("university_id").notNull(),
});

export const courses = pgTable("courses", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  code: text("code").notNull().unique(),
  programId: integer("program_id").notNull(),
});

export const years = pgTable("years", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(), // Year name (2023, etc.)
  code: text("code").notNull().unique(),
  courseId: integer("course_id").notNull(),
});

export const semesters = pgTable("semesters", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(), // Semester name (Fall, Spring, etc.)
  code: text("code").notNull().unique(),
  yearId: integer("year_id").notNull(),
});

export const groups = pgTable("groups", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(), // Group name (CS-101-A, etc.)
  code: text("code").notNull().unique(), // Unique class code like QUHEHWUW1
  semesterId: integer("semester_id").notNull(),
  adminId: integer("admin_id"), // Optional reference to a user who is the admin for this group
});

export const units = pgTable("units", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  code: text("code").notNull().unique(),
  groupId: integer("group_id").notNull(),
});

// Content tables
export const contentTypes = {
  ASSIGNMENT: "assignment",
  NOTE: "note",
  NOTES: "note", // Alias for NOTE
  PAST_PAPER: "past_paper",
  RESOURCE: "resource",
} as const;

export const contents = pgTable("contents", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  type: text("type").notNull(),
  filePath: text("file_path"),
  dueDate: timestamp("due_date"),
  year: integer("year"), // For past papers
  uploaderId: integer("uploader_id").notNull(),
  unitId: integer("unit_id").notNull(),
  likes: integer("likes").default(0).notNull(),
  dislikes: integer("dislikes").default(0).notNull(),
  uploadedAt: timestamp("uploaded_at").defaultNow().notNull(),
});

export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  text: text("text").notNull(),
  userId: integer("user_id").notNull(),
  contentId: integer("content_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const userContents = pgTable("user_contents", {
  userId: integer("user_id").notNull(),
  contentId: integer("content_id").notNull(),
  isCompleted: boolean("is_completed").default(false).notNull(),
  completedAt: timestamp("completed_at"),
  isLiked: boolean("is_liked").default(false),
  isDisliked: boolean("is_disliked").default(false),
}, (t) => ({
  pk: primaryKey(t.userId, t.contentId),
}));

// Dashboard message table for super admin
export const dashboardMessages = pgTable("dashboard_messages", {
  id: serial("id").primaryKey(),
  message: text("message").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdById: integer("created_by_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Zod schemas for validation
export const insertUserSchema = createInsertSchema(users, {
  points: z.coerce.number().optional(),
  createdAt: z.coerce.date().optional(),
  lastActiveAt: z.coerce.date().optional(),
  id: z.coerce.number().optional(),
}).omit({
  id: true,
  createdAt: true,
  lastActiveAt: true,
  points: true,
});

export const passwordLoginSchema = z.object({
  admissionNumber: z.string().min(1, "Admission number is required"),
  password: z.string().min(1, "Password is required"),
});

export const adminResetSchema = z.object({
  admissionNumber: z.string().min(1, "Admission number is required"),
  secretKey: z.string().min(1, "Secret key is required"),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "New password must be at least 8 characters"),
});

export const insertCountrySchema = createInsertSchema(countries, {
  id: z.coerce.number().optional(),
}).omit({ id: true });

export const insertUniversitySchema = createInsertSchema(universities, {
  id: z.coerce.number().optional(),
}).omit({ id: true });

export const insertProgramSchema = createInsertSchema(programs, {
  id: z.coerce.number().optional(),
}).omit({ id: true });

export const insertCourseSchema = createInsertSchema(courses, {
  id: z.coerce.number().optional(),
}).omit({ id: true });

export const insertYearSchema = createInsertSchema(years, {
  id: z.coerce.number().optional(),
}).omit({ id: true });

export const insertSemesterSchema = createInsertSchema(semesters, {
  id: z.coerce.number().optional(),
}).omit({ id: true });

export const insertGroupSchema = createInsertSchema(groups, {
  id: z.coerce.number().optional(),
  adminId: z.coerce.number().optional(),
}).omit({ id: true, adminId: true });

export const insertUnitSchema = createInsertSchema(units, {
  id: z.coerce.number().optional(),
}).omit({ id: true });

export const insertContentSchema = createInsertSchema(contents, {
  id: z.coerce.number().optional(),
  likes: z.coerce.number().optional(),
  dislikes: z.coerce.number().optional(),
  uploadedAt: z.coerce.date().optional(),
}).omit({ 
  id: true, 
  likes: true, 
  dislikes: true, 
  uploadedAt: true 
});

export const insertCommentSchema = createInsertSchema(comments, {
  id: z.coerce.number().optional(),
  createdAt: z.coerce.date().optional(),
}).omit({
  id: true,
  createdAt: true,
});

export const insertDashboardMessageSchema = createInsertSchema(dashboardMessages, {
  id: z.coerce.number().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Export types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type PasswordLoginUser = z.infer<typeof passwordLoginSchema>;
export type AdminReset = z.infer<typeof adminResetSchema>;
export type ChangePassword = z.infer<typeof changePasswordSchema>;

export type Country = typeof countries.$inferSelect;
export type InsertCountry = z.infer<typeof insertCountrySchema>;

export type University = typeof universities.$inferSelect;
export type InsertUniversity = z.infer<typeof insertUniversitySchema>;

export type Program = typeof programs.$inferSelect;
export type InsertProgram = z.infer<typeof insertProgramSchema>;

export type Course = typeof courses.$inferSelect;
export type InsertCourse = z.infer<typeof insertCourseSchema>;

export type Year = typeof years.$inferSelect;
export type InsertYear = z.infer<typeof insertYearSchema>;

export type Semester = typeof semesters.$inferSelect;
export type InsertSemester = z.infer<typeof insertSemesterSchema>;

export type Group = typeof groups.$inferSelect;
export type InsertGroup = z.infer<typeof insertGroupSchema>;

export type Unit = typeof units.$inferSelect;
export type InsertUnit = z.infer<typeof insertUnitSchema>;

export type Content = typeof contents.$inferSelect;
export type InsertContent = z.infer<typeof insertContentSchema>;

export type Comment = typeof comments.$inferSelect;
export type InsertComment = z.infer<typeof insertCommentSchema>;

export type DashboardMessage = typeof dashboardMessages.$inferSelect;
export type InsertDashboardMessage = z.infer<typeof insertDashboardMessageSchema>;

// Enums
export const userRoleEnum = pgEnum('user_role', ['student', 'admin', 'superadmin']);
export const contentTypeEnum = pgEnum('content_type', ['assignment', 'note', 'past_paper']);
export const semesterTypeEnum = pgEnum('semester_type', ['Spring', 'Summer', 'Fall', 'Winter']);

// Class metadata table
export const classMetadata = pgTable('class_metadata', {
    id: uuid('id').primaryKey().defaultRandom(),
    country: text('country').notNull(),
    university: text('university').notNull(),
    program: text('program').notNull(),
    course: text('course').notNull(),
    year: integer('year').notNull(),
    semester: semesterTypeEnum('semester').notNull(),
    group_code: text('group_code').notNull(),
    created_at: timestamp('created_at').defaultNow(),
    updated_at: timestamp('updated_at').defaultNow()
});

// Students table
export const students = pgTable('students', {
    id: uuid('id').primaryKey().defaultRandom(),
    admission_number: text('admission_number').notNull().unique(),
    full_name: text('full_name').notNull(),
    email: text('email').notNull().unique(),
    role: userRoleEnum('role').notNull().default('student'),
    password_hash: text('password_hash').notNull(),
    password_salt: text('password_salt').notNull(),
    created_at: timestamp('created_at').defaultNow(),
    updated_at: timestamp('updated_at').defaultNow()
});

// Notifications table
export const notifications = pgTable('notifications', {
    id: uuid('id').primaryKey().defaultRandom(),
    user_id: uuid('user_id').references(() => students.id).notNull(),
    title: text('title').notNull(),
    message: text('message').notNull(),
    type: text('type').notNull(),
    is_read: boolean('is_read').default(false),
    metadata: jsonb('metadata'),
    created_at: timestamp('created_at').defaultNow()
});

// Settings table
export const settings = pgTable('settings', {
    id: uuid('id').primaryKey().defaultRandom(),
    key: text('key').notNull().unique(),
    value: jsonb('value').notNull(),
    created_at: timestamp('created_at').defaultNow(),
    updated_at: timestamp('updated_at').defaultNow()
});

// Export all tables
export const tables = {
    classMetadata,
    units,
    students,
    contents,
    comments,
    userContents,
    notifications,
    settings
};

// Export all enums
export const enums = {
    userRoleEnum,
    contentTypeEnum,
    semesterTypeEnum
};
