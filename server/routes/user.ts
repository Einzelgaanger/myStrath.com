import express from 'express';
import { AppError } from '../middleware/errorHandler';
import { authenticate, restrictTo } from '../middleware/auth';
import { storage } from '../storage';

const router = express.Router();

// Get current user profile
router.get('/me', authenticate, async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return next(new AppError('Not authenticated', 401));
    }

    const user = await storage.getUser(userId);

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    const { passwordHash, ...userWithoutPassword } = user;

    res.status(200).json({
      status: 'success',
      data: userWithoutPassword,
    });
  } catch (err) {
    next(err);
  }
});

// Update user profile
router.patch('/me', authenticate, async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return next(new AppError('Not authenticated', 401));
    }

    const { fullName, email } = req.body;

    if (!fullName && !email) {
      return next(new AppError('Please provide at least one field to update', 400));
    }

    const updateData: { fullName?: string; email?: string } = {};
    if (fullName) updateData.fullName = fullName;
    if (email) updateData.email = email;

    const updatedUser = await storage.updateUser(userId, updateData);

    if (!updatedUser) {
      return next(new AppError('User not found', 404));
    }

    const { passwordHash, ...userWithoutPassword } = updatedUser;

    res.status(200).json({
      status: 'success',
      data: userWithoutPassword,
    });
  } catch (err) {
    next(err);
  }
});

// Get all users (admin only)
router.get(
  '/',
  authenticate,
  restrictTo('admin', 'superadmin'),
  async (req, res, next) => {
    try {
      const users = await storage.getAllUsers();

      const usersWithoutPassword = users.map(({ passwordHash, ...rest }) => rest);

      res.status(200).json({
        status: 'success',
        data: usersWithoutPassword,
      });
    } catch (err) {
      next(err);
    }
  }
);

// Get user by admission number (admin only)
router.get(
  '/:admissionNumber',
  authenticate,
  restrictTo('admin', 'superadmin'),
  async (req, res, next) => {
    try {
      const { admissionNumber } = req.params;

      const user = await storage.getUserByAdmissionNumber(admissionNumber);

      if (!user) {
        return next(new AppError('User not found', 404));
      }

      const { passwordHash, ...userWithoutPassword } = user;

      res.status(200).json({
        status: 'success',
        data: userWithoutPassword,
      });
    } catch (err) {
      next(err);
    }
  }
);

// Create new user (admin only)
router.post(
  '/',
  authenticate,
  restrictTo('admin', 'superadmin'),
  async (req, res, next) => {
    try {
      const { admissionNumber, fullName, email, role } = req.body;

      if (!admissionNumber || !fullName || !email || !role) {
        return next(
          new AppError(
            'Please provide admission number, full name, email, and role',
            400
          )
        );
      }

      // Check if user already exists
      const existingUser = await storage.getUserByAdmissionNumber(admissionNumber);

      if (existingUser) {
        return next(
          new AppError('User with this admission number already exists', 400)
        );
      }

      // Create user with default password (admission number)
      const newUser = await storage.createUser({
        admissionNumber,
        fullName,
        email,
        role,
      });

      const { passwordHash, ...userWithoutPassword } = newUser;

      res.status(201).json({
        status: 'success',
        data: userWithoutPassword,
      });
    } catch (err) {
      next(err);
    }
  }
);

// Update user (admin only)
router.patch(
  '/:admissionNumber',
  authenticate,
  restrictTo('admin', 'superadmin'),
  async (req, res, next) => {
    try {
      const { admissionNumber } = req.params;
      const { fullName, email, role } = req.body;

      if (!fullName && !email && !role) {
        return next(new AppError('Please provide at least one field to update', 400));
      }

      const updateData: { fullName?: string; email?: string; role?: string } = {};
      if (fullName) updateData.fullName = fullName;
      if (email) updateData.email = email;
      if (role) updateData.role = role;

      const user = await storage.getUserByAdmissionNumber(admissionNumber);

      if (!user) {
        return next(new AppError('User not found', 404));
      }

      const updatedUser = await storage.updateUser(user.id, updateData);

      if (!updatedUser) {
        return next(new AppError('Failed to update user', 500));
      }

      const { passwordHash, ...userWithoutPassword } = updatedUser;

      res.status(200).json({
        status: 'success',
        data: userWithoutPassword,
      });
    } catch (err) {
      next(err);
    }
  }
);

// Delete user (admin only)
router.delete(
  '/:admissionNumber',
  authenticate,
  restrictTo('admin', 'superadmin'),
  async (req, res, next) => {
    try {
      const { admissionNumber } = req.params;

      const user = await storage.getUserByAdmissionNumber(admissionNumber);

      if (!user) {
        return next(new AppError('User not found', 404));
      }

      await storage.deleteUser(user.id);

      res.status(204).json({
        status: 'success',
        data: null,
      });
    } catch (err) {
      next(err);
    }
  }
);

export default router; 