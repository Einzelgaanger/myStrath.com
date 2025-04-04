import { sql } from 'drizzle-orm';
import { db } from './db';
import { 
  countries, 
  universities, 
  programs, 
  courses, 
  years, 
  semesters, 
  groups, 
  units, 
  users,
} from '../shared/schema';
import { hashPassword } from './auth';

/**
 * Script to seed the database with initial data for development
 */
export async function seedDatabase() {
  console.log('Seeding database...');
  
  try {
    // Create a country
    console.log('Creating country...');
    const [kenya] = await db.insert(countries)
      .values({ name: 'Kenya', code: 'KE' })
      .returning();
    
    // Create universities
    console.log('Creating universities...');
    const [strathmoreUniversity] = await db.insert(universities)
      .values({ 
        name: 'Strathmore University', 
        code: 'STR', 
        countryId: kenya.id 
      })
      .returning();
    
    // Create programs
    console.log('Creating programs...');
    const [computerScience] = await db.insert(programs)
      .values({
        name: 'Bachelor of Science',
        code: 'BSC',
        universityId: strathmoreUniversity.id,
      })
      .returning();
    
    // Create courses
    console.log('Creating courses...');
    const [bsc] = await db.insert(courses)
      .values({
        name: 'Computer Science',
        code: 'CS',
        programId: computerScience.id,
      })
      .returning();
    
    // Create years
    console.log('Creating years...');
    const [yearOne, yearTwo, yearThree, yearFour] = await db.insert(years)
      .values([
        { name: 'Year 1', code: 'Y1', courseId: bsc.id },
        { name: 'Year 2', code: 'Y2', courseId: bsc.id },
        { name: 'Year 3', code: 'Y3', courseId: bsc.id },
        { name: 'Year 4', code: 'Y4', courseId: bsc.id },
      ])
      .returning();
    
    // Create semesters
    console.log('Creating semesters...');
    const [year1Sem1, year1Sem2] = await db.insert(semesters)
      .values([
        { name: 'Semester 1', code: 'S1', yearId: yearOne.id },
        { name: 'Semester 2', code: 'S2', yearId: yearOne.id },
      ])
      .returning();
    
    // Create groups
    console.log('Creating groups...');
    const [group1A] = await db.insert(groups)
      .values({
        name: 'Group A',
        code: 'QUHEHWUW1',
        semesterId: year1Sem1.id,
        adminId: null,
      })
      .returning();
    
    // Create units for the group
    console.log('Creating units...');
    const [programming, calculus, discreteMath] = await db.insert(units)
      .values([
        {
          name: 'Introduction to Programming',
          code: 'CS101',
          groupId: group1A.id,
        },
        {
          name: 'Calculus I',
          code: 'MATH101',
          groupId: group1A.id,
        },
        {
          name: 'Discrete Mathematics',
          code: 'MATH102',
          groupId: group1A.id,
        },
      ])
      .returning();
    
    // Create users - admin, instructor, and students
    console.log('Creating users...');
    
    // First create admin
    const adminPassword = await hashPassword('stratizens#web');
    const [admin] = await db.insert(users)
      .values({
        username: 'admin',
        admissionNumber: '000001',
        password: adminPassword,
        profilePicture: null,
        points: 1000,
        isAdmin: true,
        isSuperAdmin: true,
        countryId: kenya.id,
        universityId: strathmoreUniversity.id,
        programId: computerScience.id,
        courseId: bsc.id,
        yearId: yearOne.id,
        semesterId: year1Sem1.id,
        groupId: group1A.id,
        classCode: 'QUHEHWUW1',
        isUsingDefaultPassword: true,
        createdAt: new Date(),
        lastActiveAt: new Date(),
      })
      .returning();

    // Update the group to have an admin
    await db.update(groups)
      .set({ adminId: admin.id })
      .where(sql`${groups.id} = ${group1A.id}`);
    
    // Create students
    const studentPassword = await hashPassword('stratizens#web');
    
    // Create 5 students with sequential admission numbers starting from 180963
    const studentValues = [];
    for (let i = 0; i < 5; i++) {
      const admissionNumber = (180963 + i).toString();
      studentValues.push({
        username: `student${i + 1}`,
        admissionNumber,
        password: studentPassword,
        profilePicture: null,
        points: Math.floor(Math.random() * 200),
        isAdmin: false,
        isSuperAdmin: false,
        countryId: kenya.id,
        universityId: strathmoreUniversity.id,
        programId: computerScience.id,
        courseId: bsc.id,
        yearId: yearOne.id,
        semesterId: year1Sem1.id,
        groupId: group1A.id,
        classCode: 'QUHEHWUW1',
        isUsingDefaultPassword: true,
        createdAt: new Date(),
        lastActiveAt: new Date(),
      });
    }
    
    await db.insert(users).values(studentValues);
    
    console.log('Database seeded successfully!');
    
    // Return login credentials for easy testing
    return {
      admin: {
        username: 'admin',
        admissionNumber: '000001',
        password: 'stratizens#web',
      },
      student: {
        username: 'student1',
        admissionNumber: '180963',
        password: 'stratizens#web',
      },
    };
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
}

// If this script is called directly (not imported), run the seeder
// In ESM, we can check if this is the main module by comparing import.meta.url
// against the current file URL
const isMainModule = import.meta.url.endsWith(process.argv[1].replace(/^file:\/\//, ''));

if (isMainModule) {
  seedDatabase()
    .then((credentials) => {
      console.log('Login with these credentials:');
      console.log(JSON.stringify(credentials, null, 2));
      process.exit(0);
    })
    .catch((error) => {
      console.error('Failed to seed database:', error);
      process.exit(1);
    });
}