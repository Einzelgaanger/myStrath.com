import crypto from 'crypto';
import { db } from '../db';

// Password hashing configuration
const SALT_LENGTH = 16;
const HASH_LENGTH = 64;
const ITERATIONS = 10000;
const DIGEST = 'sha512';

// Function to generate a random salt
export const generateSalt = (): string => {
    return crypto.randomBytes(SALT_LENGTH).toString('hex');
};

// Function to hash a password
export const hashPassword = (password: string, salt: string): string => {
    return crypto.pbkdf2Sync(
        password,
        salt,
        ITERATIONS,
        HASH_LENGTH,
        DIGEST
    ).toString('hex');
};

// Function to verify a password
export const verifyPassword = (password: string, hash: string, salt: string): boolean => {
    const hashedPassword = hashPassword(password, salt);
    return hashedPassword === hash;
};

// Function to generate a session token
export const generateSessionToken = (): string => {
    return crypto.randomBytes(32).toString('hex');
};

// Function to hash a session token
export const hashSessionToken = (token: string): string => {
    return crypto.createHash('sha256').update(token).digest('hex');
};

// Function to authenticate a user
export const authenticateUser = async (
    admissionNumber: string,
    password: string,
    country: string,
    university: string,
    program: string,
    course: string,
    year: number,
    semester: string,
    groupCode: string
): Promise<{
    id: string;
    admission_number: string;
    full_name: string;
    email: string;
    role: 'student' | 'admin' | 'superadmin';
    schema_name: string;
} | null> => {
    try {
        // Find the schema name for the class
        const schemaName = `${university.toLowerCase()}_${program.toLowerCase()}_${year}_${semester.toLowerCase()}_${course.toLowerCase()}_${groupCode.toLowerCase()}`;

        // Check if the schema exists
        const schemaExists = await db.query[`${schemaName}.class_metadata`].findFirst();
        if (!schemaExists) {
            return null;
        }

        // Find the user in the schema
        const user = await db.query[`${schemaName}.students`].findFirst({
            where: (students, { eq }) => eq(students.admission_number, admissionNumber)
        });

        if (!user) {
            return null;
        }

        // Verify the password
        const isValid = verifyPassword(password, user.password_hash, user.password_salt);
        if (!isValid) {
            return null;
        }

        return {
            id: user.id,
            admission_number: user.admission_number,
            full_name: user.full_name,
            email: user.email,
            role: user.role,
            schema_name: schemaName
        };
    } catch (error) {
        console.error('Authentication error:', error);
        return null;
    }
};

// Function to create a new user
export const createUser = async (
    admissionNumber: string,
    password: string,
    fullName: string,
    email: string,
    role: 'student' | 'admin' | 'superadmin',
    country: string,
    university: string,
    program: string,
    course: string,
    year: number,
    semester: string,
    groupCode: string
): Promise<{
    id: string;
    admission_number: string;
    full_name: string;
    email: string;
    role: 'student' | 'admin' | 'superadmin';
    schema_name: string;
} | null> => {
    try {
        // Generate schema name
        const schemaName = `${university.toLowerCase()}_${program.toLowerCase()}_${year}_${semester.toLowerCase()}_${course.toLowerCase()}_${groupCode.toLowerCase()}`;

        // Check if the schema exists
        const schemaExists = await db.query[`${schemaName}.class_metadata`].findFirst();
        if (!schemaExists) {
            return null;
        }

        // Check if user already exists
        const existingUser = await db.query[`${schemaName}.students`].findFirst({
            where: (students, { eq }) => eq(students.admission_number, admissionNumber)
        });

        if (existingUser) {
            return null;
        }

        // Generate salt and hash password
        const salt = generateSalt();
        const passwordHash = hashPassword(password, salt);

        // Create user
        const userId = crypto.randomUUID();
        const user = await db.query[`${schemaName}.students`].insert({
            id: userId,
            admission_number: admissionNumber,
            full_name: fullName,
            email: email,
            role: role,
            password_hash: passwordHash,
            password_salt: salt,
            created_at: new Date()
        });

        return {
            id: userId,
            admission_number: admissionNumber,
            full_name: fullName,
            email: email,
            role: role,
            schema_name: schemaName
        };
    } catch (error) {
        console.error('User creation error:', error);
        return null;
    }
};

// Function to update user password
export const updatePassword = async (
    userId: string,
    schemaName: string,
    currentPassword: string,
    newPassword: string
): Promise<boolean> => {
    try {
        // Find the user
        const user = await db.query[`${schemaName}.students`].findFirst({
            where: (students, { eq }) => eq(students.id, userId)
        });

        if (!user) {
            return false;
        }

        // Verify current password
        const isValid = verifyPassword(currentPassword, user.password_hash, user.password_salt);
        if (!isValid) {
            return false;
        }

        // Generate new salt and hash
        const newSalt = generateSalt();
        const newPasswordHash = hashPassword(newPassword, newSalt);

        // Update password
        await db.query[`${schemaName}.students`].update({
            where: (students, { eq }) => eq(students.id, userId),
            data: {
                password_hash: newPasswordHash,
                password_salt: newSalt,
                updated_at: new Date()
            }
        });

        return true;
    } catch (error) {
        console.error('Password update error:', error);
        return false;
    }
}; 