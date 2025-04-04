import { Request, Response, NextFunction } from 'express';
import { db } from '../db';

// Extend Express Request type to include user
declare global {
    namespace Express {
        interface Request {
            session?: {
                user?: {
                    id: string;
                    admission_number: string;
                    full_name: string;
                    email: string;
                    role: 'student' | 'admin' | 'superadmin';
                    schema_name: string;
                };
            };
        }
    }
}

// Authentication middleware
export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.session?.user) {
            return res.status(401).json({ message: 'Not authenticated' });
        }

        // Verify user still exists in the database
        const user = await db.query[`${req.session.user.schema_name}.students`].findFirst({
            where: (students, { eq }) => eq(students.id, req.session.user.id)
        });

        if (!user) {
            req.session.destroy((err) => {
                if (err) {
                    console.error('Error destroying session:', err);
                }
            });
            return res.status(401).json({ message: 'User not found' });
        }

        next();
    } catch (error) {
        console.error('Authentication error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Role-based middleware
export const requireRole = (roles: ('student' | 'admin' | 'superadmin')[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            if (!req.session?.user) {
                return res.status(401).json({ message: 'Not authenticated' });
            }

            if (!roles.includes(req.session.user.role)) {
                return res.status(403).json({ message: 'Not authorized' });
            }

            next();
        } catch (error) {
            console.error('Role check error:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    };
};

// Admin middleware
export const requireAdmin = requireRole(['admin', 'superadmin']);

// Superadmin middleware
export const requireSuperadmin = requireRole(['superadmin']);

// Class-specific middleware
export const requireClassAccess = (classId: string) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            if (!req.session?.user) {
                return res.status(401).json({ message: 'Not authenticated' });
            }

            // Check if user belongs to the class
            const user = await db.query[`${req.session.user.schema_name}.students`].findFirst({
                where: (students, { eq }) => eq(students.id, req.session.user.id)
            });

            if (!user) {
                return res.status(401).json({ message: 'User not found' });
            }

            // If user is superadmin, allow access
            if (req.session.user.role === 'superadmin') {
                return next();
            }

            // Check if user belongs to the class
            const classMetadata = await db.query[`${req.session.user.schema_name}.class_metadata`].findFirst();

            if (!classMetadata) {
                return res.status(404).json({ message: 'Class not found' });
            }

            next();
        } catch (error) {
            console.error('Class access check error:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    };
}; 