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
import connectPg from "connect-pg-simple";
import { hashPassword } from "./auth";

const MemoryStore = createMemoryStore(session);
const PostgresSessionStore = connectPg(session);

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
    // Use memory store in development, postgres store in production
    if (process.env.NODE_ENV === 'production') {
      this.sessionStore = new PostgresSessionStore(pool);
    } else {
      this.sessionStore = new MemoryStore({
        checkPeriod: 86400000 // prune expired entries every 24h
      });
    }
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
    const hashedPassword = await hashPassword(user.password);
    const [newUser] = await db.insert(users).values({
      ...user,
      password: hashedPassword // Use 'password' field as defined in schema
    }).returning();
    return newUser;
  }

  async updateUser(id: number, data: Partial<User>): Promise<User> {
    const [updatedUser] = await db.update(users)
      .set(data)
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }

  async updateUserPoints(id: number, points: number): Promise<User> {
    // Use raw SQL to update points to avoid type issues
    const [updatedUser] = await db.update(users)
      .set({ 
        points: sql`${users.points} + ${points}` 
      })
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
    return await db.query.countries.findMany();
  }

  async getCountry(id: number): Promise<Country | undefined> {
    return await db.query.countries.findFirst({
      where: (countries, { eq }) => eq(countries.id, id)
    });
  }

  async createCountry(country: InsertCountry): Promise<Country> {
    const [newCountry] = await db.insert(countries)
      .values(country)
      .returning();
    return newCountry;
  }

  async getUniversities(countryId?: number): Promise<University[]> {
    if (countryId) {
      return await db.query.universities.findMany({
        where: (universities, { eq }) => eq(universities.countryId, countryId)
      });
    }
    return await db.query.universities.findMany();
  }

  async getUniversity(id: number): Promise<University | undefined> {
    return await db.query.universities.findFirst({
      where: (universities, { eq }) => eq(universities.id, id)
    });
  }

  async createUniversity(university: InsertUniversity): Promise<University> {
    const [newUniversity] = await db.insert(universities)
      .values(university)
      .returning();
    return newUniversity;
  }

  async getPrograms(universityId?: number): Promise<Program[]> {
    if (universityId) {
      return await db.query.programs.findMany({
        where: (programs, { eq }) => eq(programs.universityId, universityId)
      });
    }
    return await db.query.programs.findMany();
  }

  async getAllPrograms(): Promise<Program[]> {
    return await db.query.programs.findMany();
  }

  async getProgram(id: number): Promise<Program | undefined> {
    return await db.query.programs.findFirst({
      where: (programs, { eq }) => eq(programs.id, id)
    });
  }

  async createProgram(program: InsertProgram): Promise<Program> {
    const [newProgram] = await db.insert(programs)
      .values(program)
      .returning();
    return newProgram;
  }

  async getCourses(programId?: number): Promise<Course[]> {
    if (programId) {
      return await db.query.courses.findMany({
        where: (courses, { eq }) => eq(courses.programId, programId)
      });
    }
    return await db.query.courses.findMany();
  }

  async getCourse(id: number): Promise<Course | undefined> {
    return await db.query.courses.findFirst({
      where: (courses, { eq }) => eq(courses.id, id)
    });
  }

  async createCourse(course: InsertCourse): Promise<Course> {
    const [newCourse] = await db.insert(courses)
      .values(course)
      .returning();
    return newCourse;
  }

  async getYears(courseId?: number): Promise<Year[]> {
    if (courseId) {
      return await db.query.years.findMany({
        where: (years, { eq }) => eq(years.courseId, courseId)
      });
    }
    return await db.query.years.findMany();
  }

  async getYear(id: number): Promise<Year | undefined> {
    return await db.query.years.findFirst({
      where: (years, { eq }) => eq(years.id, id)
    });
  }

  async createYear(year: InsertYear): Promise<Year> {
    const [newYear] = await db.insert(years)
      .values(year)
      .returning();
    return newYear;
  }

  async getSemesters(yearId?: number): Promise<Semester[]> {
    if (yearId) {
      return await db.query.semesters.findMany({
        where: (semesters, { eq }) => eq(semesters.yearId, yearId)
      });
    }
    return await db.query.semesters.findMany();
  }

  async getSemester(id: number): Promise<Semester | undefined> {
    return await db.query.semesters.findFirst({
      where: (semesters, { eq }) => eq(semesters.id, id)
    });
  }

  async createSemester(semester: InsertSemester): Promise<Semester> {
    const [newSemester] = await db.insert(semesters)
      .values(semester)
      .returning();
    return newSemester;
  }

  async getGroups(semesterId?: number): Promise<Group[]> {
    if (semesterId) {
      return await db.query.groups.findMany({
        where: (groups, { eq }) => eq(groups.semesterId, semesterId)
      });
    }
    return await db.query.groups.findMany();
  }

  async getGroup(id: number): Promise<Group | undefined> {
    return await db.query.groups.findFirst({
      where: (groups, { eq }) => eq(groups.id, id)
    });
  }

  async createGroup(group: InsertGroup): Promise<Group> {
    const [newGroup] = await db.insert(groups)
      .values(group)
      .returning();
    return newGroup;
  }

  async getUnits(groupId?: number): Promise<Unit[]> {
    if (groupId) {
      return await db.query.units.findMany({
        where: (units, { eq }) => eq(units.groupId, groupId)
      });
    }
    return await db.query.units.findMany();
  }

  async getUnit(id: number): Promise<Unit | undefined> {
    return await db.query.units.findFirst({
      where: (units, { eq }) => eq(units.id, id)
    });
  }

  async createUnit(unit: InsertUnit): Promise<Unit> {
    const [newUnit] = await db.insert(units)
      .values(unit)
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
    const [newContent] = await db.insert(contents)
      .values(content)
      .returning();
    return newContent;
  }

  async updateContent(id: number, data: Partial<Content>): Promise<Content> {
    const [updatedContent] = await db.update(contents)
      .set(data)
      .where(eq(contents.id, id))
      .returning();
    return updatedContent;
  }

  async deleteContent(id: number): Promise<void> {
    await db.delete(contents).where(eq(contents.id, id));
  }
  
  async updateContentLikes(id: number, likeDelta: number, dislikeDelta: number): Promise<Content> {
    const content = await this.getContent(id);
    if (!content) {
      throw new Error("Content not found");
    }
    
    // Update using SQL to avoid type issues
    const [updatedContent] = await db.update(contents)
      .set({
        likes: sql`${contents.likes} + ${likeDelta}`,
        dislikes: sql`${contents.dislikes} + ${dislikeDelta}`
      })
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
    const [newComment] = await db.insert(comments)
      .values(comment)
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
    return await db.query.dashboardMessages.findMany();
  }

  async getDashboardMessage(id: number): Promise<DashboardMessage | undefined> {
    return await db.query.dashboardMessages.findFirst({
      where: (dashboardMessages, { eq }) => eq(dashboardMessages.id, id)
    });
  }

  async createDashboardMessage(message: InsertDashboardMessage): Promise<DashboardMessage> {
    const [newMessage] = await db.insert(dashboardMessages)
      .values(message)
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
    const users = await db.query.users.findMany({
      orderBy: (users, { desc }) => [desc(users.points)]
    });

    const leaderboardEntries = await Promise.all(
      users.map(async (user) => {
        const contributions = await db.query.contents.findMany({
          where: (contents, { eq }) => eq(contents.uploaderId, user.id)
        });

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
