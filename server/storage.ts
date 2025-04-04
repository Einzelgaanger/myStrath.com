import { 
  User, InsertUser, Country, InsertCountry, University, InsertUniversity,
  Program, InsertProgram, Course, InsertCourse, Year, InsertYear,
  Semester, InsertSemester, Group, InsertGroup,
  Unit, InsertUnit, Content, InsertContent, Comment, InsertComment,
  DashboardMessage, InsertDashboardMessage,
  users, contents, comments, userContents, dashboardMessages,
  countries, universities, programs, courses, years, semesters, groups, units
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";
import { db, pool } from "./db";
import { and, eq, desc, asc, sql, gt, lt, gte, lte, isNull, not } from "drizzle-orm";
// Use require for modules without type declarations
const pgConnect = require("connect-pg-simple");
import { hashPassword } from "./auth";

const MemoryStore = createMemoryStore(session);
// Get the PgStore class constructor from connect-pg-simple
const PgStore = pgConnect(session);
// Initialize session store with the correct constructor
// Use explicit type annotation to avoid TypeScript error
export const sessionStore = new (PgStore as any)({
  pool,
  tableName: "session"
});

// Define type for user-content relation
type UserContent = {
  userId: number;
  contentId: number;
  isCompleted: boolean;
  completedAt?: Date | null;
  isLiked: boolean;
  isDisliked: boolean;
};

// Define type for user statistics
type UserStats = {
  totalPoints: number;
  rank: number;
  badge: string;
  totalContributions: number;
  contributionBreakdown: {
    assignments: number;
    notes: number;
    pastPapers: number;
  };
};

// Define type for leaderboard entry
type LeaderboardEntry = User & {
  totalContributions: number;
  badge: string;
};

export interface IStorage {
  // Session store
  sessionStore: any; // session.Store type

  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByAdmissionNumber(admissionNumber: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, data: Partial<User>): Promise<User>;
  updateUserPoints(id: number, points: number): Promise<User>;
  getUserStats(id: number): Promise<UserStats>;

  // Academic hierarchy operations
  getCountries(): Promise<Country[]>;
  getCountry(id: number): Promise<Country | undefined>;
  createCountry(country: InsertCountry): Promise<Country>;
  
  getUniversities(countryId?: number): Promise<University[]>;
  getUniversity(id: number): Promise<University | undefined>;
  createUniversity(university: InsertUniversity): Promise<University>;
  
  getPrograms(universityId?: number): Promise<Program[]>;
  getAllPrograms(): Promise<Program[]>;
  getProgram(id: number): Promise<Program | undefined>;
  createProgram(program: InsertProgram): Promise<Program>;
  
  getCourses(programId?: number): Promise<Course[]>;
  getCourse(id: number): Promise<Course | undefined>;
  createCourse(course: InsertCourse): Promise<Course>;
  
  getYears(courseId?: number): Promise<Year[]>;
  getYear(id: number): Promise<Year | undefined>;
  createYear(year: InsertYear): Promise<Year>;
  
  getSemesters(yearId?: number): Promise<Semester[]>;
  getSemester(id: number): Promise<Semester | undefined>;
  createSemester(semester: InsertSemester): Promise<Semester>;
  
  getGroups(semesterId?: number): Promise<Group[]>;
  getGroup(id: number): Promise<Group | undefined>;
  createGroup(group: InsertGroup): Promise<Group>;
  
  getUnits(groupId?: number): Promise<Unit[]>;
  getUnit(id: number): Promise<Unit | undefined>;
  createUnit(unit: InsertUnit): Promise<Unit>;

  // Content operations
  getContents(unitId: number, type?: string): Promise<Content[]>;
  getContent(id: number): Promise<Content | undefined>;
  createContent(content: InsertContent): Promise<Content>;
  updateContent(id: number, data: Partial<Content>): Promise<Content>;
  updateContentLikes(id: number, likeDelta: number, dislikeDelta: number): Promise<Content>;
  deleteContent(id: number): Promise<void>;
  
  // Unit access operations
  getUnitsByUser(userId: number): Promise<Unit[]>;

  // User-content relation operations
  getUserContent(userId: number, contentId: number): Promise<UserContent | undefined>;
  updateUserContent(userId: number, contentId: number, data: Partial<UserContent>): Promise<UserContent>;
  getUserContents(userId: number): Promise<UserContent[]>;

  // Comment operations
  getComments(contentId: number): Promise<Comment[]>;
  getComment(id: number): Promise<Comment | undefined>;
  createComment(comment: InsertComment): Promise<Comment>;
  updateComment(id: number, data: Partial<Comment>): Promise<Comment>;
  deleteComment(id: number): Promise<void>;

  // Dashboard message operations
  getDashboardMessages(): Promise<DashboardMessage[]>;
  getDashboardMessage(id: number): Promise<DashboardMessage | undefined>;
  createDashboardMessage(message: InsertDashboardMessage): Promise<DashboardMessage>;
  updateDashboardMessage(id: number, data: Partial<DashboardMessage>): Promise<DashboardMessage>;
  deleteDashboardMessage(id: number): Promise<void>;

  // Leaderboard operations
  getLeaderboard(): Promise<LeaderboardEntry[]>;
}

class Storage implements IStorage {
  sessionStore: any;

  constructor() {
    // Use the sessionStore that was initialized at the top of the file
    this.sessionStore = sessionStore;
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.id, id)
    });
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.username, username)
    });
  }

  async getUserByAdmissionNumber(admissionNumber: string): Promise<User | undefined> {
    return await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.admissionNumber, admissionNumber)
    });
  }

  async createUser(user: InsertUser): Promise<User> {
    // Hash password before storing
    const hashedPassword = await hashPassword(user.password);
    
    // Create a base object with properties that are definitely in the schema
    const baseUserData = {
      username: user.username || '',
      password: hashedPassword,
      admissionNumber: user.admissionNumber || '',
      profilePicture: user.profilePicture || '',
      isAdmin: user.isAdmin || false,
      isSuperAdmin: user.isSuperAdmin || false,
      countryId: user.countryId || null,
      universityId: user.universityId || null,
      programId: user.programId || null,
      courseId: user.courseId || null,
      yearId: user.yearId || null,
      semesterId: user.semesterId || null,
      groupId: user.groupId || null,
      classCode: user.classCode || '',
      isUsingDefaultPassword: user.isUsingDefaultPassword || true
    };
    
    // Add points property using type assertion to avoid TypeScript errors
    const userData = {
      ...baseUserData,
      points: ('points' in user) ? user.points || 0 : 0
    } as any;
    
    const [newUser] = await db.insert(users)
      .values(userData)
      .returning();
    return newUser;
  }

  async updateUser(id: number, data: Partial<User>): Promise<User> {
    // Create a clean update object with only valid fields
    const updateData: Partial<User> = {};
    
    if (data.username !== undefined) updateData.username = data.username;
    if (data.password !== undefined) updateData.password = data.password;
    if (data.admissionNumber !== undefined) updateData.admissionNumber = data.admissionNumber;
    if (data.profilePicture !== undefined) updateData.profilePicture = data.profilePicture;
    if (data.isAdmin !== undefined) updateData.isAdmin = data.isAdmin;
    if (data.isSuperAdmin !== undefined) updateData.isSuperAdmin = data.isSuperAdmin;
    if (data.countryId !== undefined) updateData.countryId = data.countryId;
    if (data.universityId !== undefined) updateData.universityId = data.universityId;
    if (data.programId !== undefined) updateData.programId = data.programId;
    if (data.courseId !== undefined) updateData.courseId = data.courseId;
    if (data.yearId !== undefined) updateData.yearId = data.yearId;
    if (data.semesterId !== undefined) updateData.semesterId = data.semesterId;
    if (data.groupId !== undefined) updateData.groupId = data.groupId;
    if (data.classCode !== undefined) updateData.classCode = data.classCode;
    // Handle points separately to avoid TypeScript error
    if ('points' in data && data.points !== undefined) {
      (updateData as any).points = data.points;
    }
    if (data.isUsingDefaultPassword !== undefined) updateData.isUsingDefaultPassword = data.isUsingDefaultPassword;
    
    const [updatedUser] = await db.update(users)
      .set(updateData)
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }

  async updateUserPoints(id: number, points: number): Promise<User> {
    // Use raw SQL to update points to avoid type issues
    const [updatedUser] = await db.update(users)
      .set({ 
        points: sql`${points}` 
      } as any)
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }

  async getUserStats(id: number): Promise<UserStats> {
    const user = await this.getUser(id);
    if (!user) {
      throw new Error('User not found');
    }

    const contributions = await db.query.contents.findMany({
      where: (contents, { eq }) => eq(contents.uploaderId, id)
    });

    const totalContributions = contributions.length;
    const contributionBreakdown = {
      assignments: contributions.filter(c => c.type === 'assignment').length,
      notes: contributions.filter(c => c.type === 'note').length,
      pastPapers: contributions.filter(c => c.type === 'past_paper').length
    };

    // Get user's rank
    const allUsers = await db.query.users.findMany({
      orderBy: (users, { desc }) => [desc(users.points)]
    });
    const rank = allUsers.findIndex(u => u.id === id) + 1;

    // Determine badge based on points
    let badge = 'Novice';
    if (user.points >= 1000) badge = 'Expert';
    else if (user.points >= 500) badge = 'Advanced';
    else if (user.points >= 100) badge = 'Intermediate';

    return {
      totalPoints: user.points,
      rank,
      badge,
      totalContributions,
      contributionBreakdown
    };
  }

  // Academic hierarchy operations
  async getCountries(): Promise<Country[]> {
    const countries = await db.query.countries.findMany();
    return countries as Country[];
  }

  async getCountry(id: number): Promise<Country | undefined> {
    return await db.query.countries.findFirst({
      where: (countries, { eq }) => eq(countries.id, id)
    });
  }

  async createCountry(country: InsertCountry): Promise<Country> {
    // Ensure all required properties are present
    const countryData = {
      name: country.name || '',
      code: country.code || ''
    };
    
    const [newCountry] = await db.insert(countries)
      .values(countryData)
      .returning();
    return newCountry;
  }

  async getUniversities(countryId?: number): Promise<University[]> {
    if (countryId) {
      const universities = await db.query.universities.findMany({
        where: (universities, { eq }) => eq(universities.countryId, countryId)
      });
      return universities as University[];
    }
    const universities = await db.query.universities.findMany();
    return universities as University[];
  }

  async getUniversity(id: number): Promise<University | undefined> {
    return await db.query.universities.findFirst({
      where: (universities, { eq }) => eq(universities.id, id)
    });
  }

  async createUniversity(university: InsertUniversity): Promise<University> {
    // Ensure all required properties are present
    const universityData = {
      name: university.name || '',
      countryId: university.countryId || 0,
      code: university.code || ''
    };
    
    const [newUniversity] = await db.insert(universities)
      .values(universityData)
      .returning();
    return newUniversity;
  }

  async getPrograms(universityId?: number): Promise<Program[]> {
    if (universityId) {
      const programs = await db.query.programs.findMany({
        where: (programs, { eq }) => eq(programs.universityId, universityId)
      });
      return programs as Program[];
    }
    const programs = await db.query.programs.findMany();
    return programs as Program[];
  }

  async getAllPrograms(): Promise<Program[]> {
    const programs = await db.query.programs.findMany();
    return programs as Program[];
  }

  async getProgram(id: number): Promise<Program | undefined> {
    return await db.query.programs.findFirst({
      where: (programs, { eq }) => eq(programs.id, id)
    });
  }

  async createProgram(program: InsertProgram): Promise<Program> {
    // Ensure all required properties are present
    const programData = {
      name: program.name || '',
      universityId: program.universityId || 0,
      code: program.code || ''
    };
    
    const [newProgram] = await db.insert(programs)
      .values(programData)
      .returning();
    return newProgram;
  }

  async getCourses(programId?: number): Promise<Course[]> {
    if (programId) {
      const courses = await db.query.courses.findMany({
        where: (courses, { eq }) => eq(courses.programId, programId)
      });
      return courses as Course[];
    }
    const courses = await db.query.courses.findMany();
    return courses as Course[];
  }

  async getCourse(id: number): Promise<Course | undefined> {
    return await db.query.courses.findFirst({
      where: (courses, { eq }) => eq(courses.id, id)
    });
  }

  async createCourse(course: InsertCourse): Promise<Course> {
    // Ensure all required properties are present
    const courseData = {
      name: course.name || '',
      programId: course.programId || 0,
      code: course.code || ''
    };
    
    const [newCourse] = await db.insert(courses)
      .values(courseData)
      .returning();
    return newCourse;
  }

  async getYears(courseId?: number): Promise<Year[]> {
    if (courseId) {
      const years = await db.query.years.findMany({
        where: (years, { eq }) => eq(years.courseId, courseId)
      });
      return years as Year[];
    }
    const years = await db.query.years.findMany();
    return years as Year[];
  }

  async getYear(id: number): Promise<Year | undefined> {
    return await db.query.years.findFirst({
      where: (years, { eq }) => eq(years.id, id)
    });
  }

  async createYear(year: InsertYear): Promise<Year> {
    // Ensure all required properties are present
    const yearData = {
      name: year.name || '',
      courseId: year.courseId || 0,
      code: year.code || ''
    };
    
    const [newYear] = await db.insert(years)
      .values(yearData)
      .returning();
    return newYear;
  }

  async getSemesters(yearId?: number): Promise<Semester[]> {
    if (yearId) {
      const semesters = await db.query.semesters.findMany({
        where: (semesters, { eq }) => eq(semesters.yearId, yearId)
      });
      return semesters as Semester[];
    }
    const semesters = await db.query.semesters.findMany();
    return semesters as Semester[];
  }

  async getSemester(id: number): Promise<Semester | undefined> {
    return await db.query.semesters.findFirst({
      where: (semesters, { eq }) => eq(semesters.id, id)
    });
  }

  async createSemester(semester: InsertSemester): Promise<Semester> {
    // Ensure all required properties are present
    const semesterData = {
      name: semester.name || '',
      yearId: semester.yearId || 0,
      code: semester.code || '',
      adminId: ('adminId' in semester) ? semester.adminId || 0 : 0
    };
    
    const [newSemester] = await db.insert(semesters)
      .values(semesterData)
      .returning();
    return newSemester;
  }

  async getGroups(semesterId?: number): Promise<Group[]> {
    if (semesterId) {
      const groups = await db.query.groups.findMany({
        where: (groups, { eq }) => eq(groups.semesterId, semesterId)
      });
      return groups as Group[];
    }
    const groups = await db.query.groups.findMany();
    return groups as Group[];
  }

  async getGroup(id: number): Promise<Group | undefined> {
    return await db.query.groups.findFirst({
      where: (groups, { eq }) => eq(groups.id, id)
    });
  }

  async createGroup(group: InsertGroup): Promise<Group> {
    // Ensure all required properties are present
    const groupData = {
      name: group.name || '',
      semesterId: group.semesterId || 0,
      code: group.code || '',
      adminId: ('adminId' in group) ? group.adminId || 0 : 0
    };
    
    const [newGroup] = await db.insert(groups)
      .values(groupData)
      .returning();
    return newGroup;
  }

  async getUnits(groupId?: number): Promise<Unit[]> {
    if (groupId) {
      const units = await db.query.units.findMany({
        where: (units, { eq }) => eq(units.groupId, groupId)
      });
      return units as Unit[];
    }
    const units = await db.query.units.findMany();
    return units as Unit[];
  }

  async getUnit(id: number): Promise<Unit | undefined> {
    return await db.query.units.findFirst({
      where: (units, { eq }) => eq(units.id, id)
    });
  }

  async createUnit(unit: InsertUnit): Promise<Unit> {
    // Ensure all required properties are present
    const unitData = {
      name: unit.name || '',
      groupId: unit.groupId || 0,
      code: unit.code || ''
    };
    
    const [newUnit] = await db.insert(units)
      .values(unitData)
      .returning();
    return newUnit;
  }

  // Content operations
  async getContents(unitId: number, type?: string): Promise<Content[]> {
    if (type) {
      return await db.query.contents.findMany({
        where: (contents, { eq, and }) => and(
          eq(contents.unitId, unitId),
          eq(contents.type, type)
        )
      });
    }
    return await db.query.contents.findMany({
      where: (contents, { eq }) => eq(contents.unitId, unitId)
    });
  }

  async getContent(id: number): Promise<Content | undefined> {
    return await db.query.contents.findFirst({
      where: (contents, { eq }) => eq(contents.id, id)
    });
  }

  async createContent(content: InsertContent): Promise<Content> {
    // Ensure all required properties are present
    // Use type assertion to handle properties that might not be in the schema
    const contentData: any = {
      title: content.title || '',
      description: content.description || '',
      type: content.type || '',
      uploaderId: content.uploaderId || 0,
      unitId: content.unitId || 0,
      likes: 0,
      dislikes: 0
    };
    
    const [newContent] = await db.insert(contents)
      .values(contentData)
      .returning();
    return newContent;
  }

  async updateContent(id: number, data: Partial<Content>): Promise<Content> {
    // Remove non-schema properties
    const contentData: Partial<Content> = {};
    
    if (data.title !== undefined) contentData.title = data.title;
    if (data.description !== undefined) contentData.description = data.description;
    if (data.type !== undefined) contentData.type = data.type;
    if (data.uploaderId !== undefined) contentData.uploaderId = data.uploaderId;
    if (data.unitId !== undefined) contentData.unitId = data.unitId;
    // Handle likes and dislikes separately to avoid TypeScript error
    if ('likes' in data && data.likes !== undefined) {
      (contentData as any).likes = data.likes;
    }
    if ('dislikes' in data && data.dislikes !== undefined) {
      (contentData as any).dislikes = data.dislikes;
    }
    
    const [updatedContent] = await db.update(contents)
      .set(contentData)
      .where(eq(contents.id, id))
      .returning();
    
    return updatedContent;
  }

  async deleteContent(id: number): Promise<void> {
    await db.delete(contents).where(eq(contents.id, id));
  }
  
  async updateContentLikes(id: number, likeDelta: number, dislikeDelta: number): Promise<Content> {
    const content = await this.getContent(id);
    if (!content) throw new Error(`Content with id ${id} not found`);
    
    // Use type assertion to handle properties that might not be in the schema
    const [updatedContent] = await db.update(contents)
      .set({
        likes: (content as any).likes + likeDelta,
        dislikes: (content as any).dislikes + dislikeDelta
      } as any)
      .where(eq(contents.id, id))
      .returning();
    
    return updatedContent;
  }
  
  async getUnitsByUser(userId: number): Promise<Unit[]> {
    const user = await this.getUser(userId);
    if (!user) {
      throw new Error("User not found");
    }
    
    // Get units based on user's group
    return await db.query.units.findMany({
      where: (units, { eq }) => eq(units.groupId, user.groupId)
    });
  }

  // User-content relation operations
  async getUserContent(userId: number, contentId: number): Promise<UserContent | undefined> {
    return await db.query.userContents.findFirst({
      where: (userContents, { and, eq }) => and(
        eq(userContents.userId, userId),
        eq(userContents.contentId, contentId)
      )
    });
  }

  async updateUserContent(userId: number, contentId: number, data: Partial<UserContent>): Promise<UserContent> {
    const [updatedUserContent] = await db.update(userContents)
      .set(data)
      .where(and(
        eq(userContents.userId, userId),
        eq(userContents.contentId, contentId)
      ))
      .returning();
    return updatedUserContent;
  }

  async getUserContents(userId: number): Promise<UserContent[]> {
    return await db.query.userContents.findMany({
      where: (userContents, { eq }) => eq(userContents.userId, userId)
    });
  }

  // Comment operations
  async getComments(contentId: number): Promise<Comment[]> {
    return await db.query.comments.findMany({
      where: (comments, { eq }) => eq(comments.contentId, contentId)
    });
  }

  async getComment(id: number): Promise<Comment | undefined> {
    return await db.query.comments.findFirst({
      where: (comments, { eq }) => eq(comments.id, id)
    });
  }

  async createComment(comment: InsertComment): Promise<Comment> {
    // Ensure all required properties are present
    const commentData = {
      text: comment.text || '',
      userId: comment.userId || 0,
      contentId: comment.contentId || 0
    };
    
    const [newComment] = await db.insert(comments)
      .values(commentData)
      .returning();
    return newComment;
  }

  async updateComment(id: number, data: Partial<Comment>): Promise<Comment> {
    const [updatedComment] = await db.update(comments)
      .set(data)
      .where(eq(comments.id, id))
      .returning();
    return updatedComment;
  }

  async deleteComment(id: number): Promise<void> {
    await db.delete(comments).where(eq(comments.id, id));
  }

  // Dashboard message operations
  async getDashboardMessages(): Promise<DashboardMessage[]> {
    const messages = await db.query.dashboardMessages.findMany();
    return messages as DashboardMessage[];
  }

  async getDashboardMessage(id: number): Promise<DashboardMessage | undefined> {
    return await db.query.dashboardMessages.findFirst({
      where: (dashboardMessages, { eq }) => eq(dashboardMessages.id, id)
    });
  }

  async createDashboardMessage(message: InsertDashboardMessage): Promise<DashboardMessage> {
    // Ensure all required properties are present
    const messageData = {
      message: message.message || '',
      createdById: message.createdById || 0
    };
    
    const [newMessage] = await db.insert(dashboardMessages)
      .values(messageData)
      .returning();
    return newMessage;
  }

  async updateDashboardMessage(id: number, data: Partial<DashboardMessage>): Promise<DashboardMessage> {
    const [updatedMessage] = await db.update(dashboardMessages)
      .set(data)
      .where(eq(dashboardMessages.id, id))
      .returning();
    return updatedMessage;
  }

  async deleteDashboardMessage(id: number): Promise<void> {
    await db.delete(dashboardMessages).where(eq(dashboardMessages.id, id));
  }

  // Leaderboard operations
  async getLeaderboard(): Promise<LeaderboardEntry[]> {
    const usersResult = await db.select().from(users).orderBy(desc(users.points));

    const leaderboardEntries = await Promise.all(
      usersResult.map(async (user) => {
        const contributions = await db.select().from(contents).where(eq(contents.uploaderId, user.id));

        let badge = 'Novice';
        if (user.points >= 1000) badge = 'Expert';
        else if (user.points >= 500) badge = 'Advanced';
        else if (user.points >= 100) badge = 'Intermediate';

        return {
          ...user,
          totalContributions: contributions.length,
          badge
        };
      })
    );

    return leaderboardEntries;
  }
}

export const storage = new Storage();
