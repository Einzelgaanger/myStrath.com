import { Router } from 'express';
import { z } from 'zod';
import { verifyPassword } from '../utils/auth';
import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { AppError } from '../middleware/errorHandler';
import { authenticate } from '../middleware/auth';
import { storage } from '../storage';

const router = Router();

// Schema for academic section form
const academicFormSchema = z.object({
    country: z.string().min(1),
    university: z.string().min(1),
    program: z.string().min(1),
    course: z.string().min(1),
    year: z.number().int().min(2000).max(2100),
    semester: z.enum(['Spring', 'Summer', 'Fall', 'Winter']),
    group_code: z.string().min(1)
});

// Schema for login form
const loginSchema = z.object({
    admission_number: z.string().min(1),
    password: z.string().min(1)
});

// Get available countries
router.get('/countries', async (req, res) => {
    try {
        const countries = await storage.getAvailableCountries();
        res.json(countries);
    } catch (error) {
        console.error('Error fetching countries:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Get universities by country
router.get('/universities/:country', async (req, res) => {
    try {
        const universities = await storage.getUniversitiesByCountry(req.params.country);
        res.json(universities);
    } catch (error) {
        console.error('Error fetching universities:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Get programs by university
router.get('/programs/:country/:university', async (req, res) => {
    try {
        const programs = await storage.getProgramsByUniversity(req.params.country, req.params.university);
        res.json(programs);
    } catch (error) {
        console.error('Error fetching programs:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Get courses by program
router.get('/courses/:country/:university/:program', async (req, res) => {
    try {
        const courses = await storage.getCoursesByProgram(req.params.country, req.params.university, req.params.program);
        res.json(courses);
    } catch (error) {
        console.error('Error fetching courses:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Get groups by course
router.get('/groups/:country/:university/:program/:course', async (req, res) => {
    try {
        const groups = await storage.getGroupsByCourse(req.params.country, req.params.university, req.params.program, req.params.course);
        res.json(groups);
    } catch (error) {
        console.error('Error fetching groups:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Register new user
router.post('/register', async (req, res) => {
    try {
        const { admission_number, password, full_name, email } = req.body;

        // Validate input
        if (!admission_number || !password || !full_name || !email) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Check if user already exists
        const existingUser = await storage.getUserByAdmissionNumber(admission_number);
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Create user
        const user = await storage.createUser({
            admissionNumber: admission_number,
            fullName: full_name,
            email: email,
            password: password,
            role: 'student'
        });

        // Generate JWT token
        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '1d' }
        );

        res.status(201).json({
            message: 'User registered successfully',
            token,
            user: {
                id: user.id,
                admissionNumber: user.admissionNumber,
                fullName: user.fullName,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Login user
router.post('/login', async (req, res) => {
    try {
        const { admission_number, password } = loginSchema.parse(req.body);

        // Get user
        const user = await storage.getUserByAdmissionNumber(admission_number);
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Verify password
        const isValidPassword = await verifyPassword(password, user.passwordHash);
        if (!isValidPassword) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '1d' }
        );

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                admissionNumber: user.admissionNumber,
                fullName: user.fullName,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ message: 'Invalid input data', errors: error.errors });
        }
        console.error('Error logging in:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Change password
router.post('/change-password', authenticate, async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ message: 'Not authenticated' });
        }

        const { current_password, new_password } = req.body;

        // Validate input
        if (!current_password || !new_password) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Get user
        const user = await storage.getUser(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Verify current password
        const isValidPassword = await verifyPassword(current_password, user.passwordHash);
        if (!isValidPassword) {
            return res.status(401).json({ message: 'Current password is incorrect' });
        }

        // Update password
        await storage.updateUser(userId, { password: new_password });

        res.json({ message: 'Password changed successfully' });
    } catch (error) {
        console.error('Error changing password:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Reset password
router.post('/reset-password', async (req, res) => {
    try {
        const { admission_number, email } = req.body;

        // Validate input
        if (!admission_number || !email) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Get user
        const user = await storage.getUserByAdmissionNumber(admission_number);
        if (!user || user.email !== email) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Generate reset token
        const resetToken = jwt.sign(
            { id: user.id },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '1h' }
        );

        // TODO: Send reset email with token
        // For now, just return the token
        res.json({
            message: 'Password reset instructions sent to email',
            resetToken
        });
    } catch (error) {
        console.error('Error resetting password:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

export default router; 