import { z } from "zod";

// Content types
export const contentTypes = {
  ASSIGNMENT: "assignment",
  NOTE: "note",
  NOTES: "note", // Alias for NOTE
  PAST_PAPER: "past_paper",
  RESOURCE: "resource",
} as const;

// User types
export interface User {
  id: number;
  username: string;
  admissionNumber: string;
  profilePicture: string | null;
  points: number;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  countryId: number;
  universityId: number;
  programId: number;
  courseId: number;
  yearId: number;
  semesterId: number;
  groupId: number;
  classCode: string;
  isUsingDefaultPassword: boolean;
  createdAt: Date;
  lastActiveAt: Date;
}

// Academic hierarchy types
export interface AcademicHierarchy {
  id: number;
  type: "country" | "university" | "program" | "course" | "year" | "semester" | "group";
  name: string;
  code: string | null;
  parentId: number | null;
  createdAt: Date;
}

// Content types
export interface Content {
  id: number;
  title: string;
  description: string | null;
  type: string;
  url: string | null;
  hierarchyId: number;
  createdBy: number;
  createdAt: Date;
}

// Academic selection types
export interface AcademicSelection {
  countryId: number;
  universityId: number;
  programId: number;
  courseId: number;
  yearId: number;
  semesterId: number;
  groupId: number;
}

// Login types
export interface LoginCredentials {
  admissionNumber: string;
  password: string;
  academicSelection?: AcademicSelection;
}

export interface LoginResponse {
  user: User;
  message: string;
}

// Password reset types
export interface PasswordResetRequest {
  admissionNumber: string;
  secretKey: string;
}

export interface PasswordResetResponse {
  message: string;
  whatsappNumber: string;
  defaultPassword: string;
}

// Password change types
export interface PasswordChangeRequest {
  currentPassword: string;
  newPassword: string;
}

export interface PasswordChangeResponse {
  message: string;
}

export type Country = {
  id: number;
  name: string;
  code: string;
};

export type University = {
  id: number;
  name: string;
  code: string;
  countryId: number;
};

export type Program = {
  id: number;
  name: string;
  code: string;
  universityId: number;
};

export type Course = {
  id: number;
  name: string;
  code: string;
  programId: number;
};

export type Year = {
  id: number;
  name: string;
  code: string;
  courseId: number;
};

export type Semester = {
  id: number;
  name: string;
  code: string;
  yearId: number;
};

export type Group = {
  id: number;
  name: string;
  code: string;
  semesterId: number;
  adminId?: number;
};

export type Unit = {
  id: number;
  name: string;
  code: string;
  groupId: number;
};

export type Comment = {
  id: number;
  content: string;
  contentId: number;
  userId: number;
  createdAt: Date;
  updatedAt: Date;
};

export type DashboardMessage = {
  id: number;
  title: string;
  content: string;
  groupId: number;
  userId: number;
  createdAt: Date;
  updatedAt: Date;
}; 