import express from 'express';
import { AppError } from '../middleware/errorHandler';
import { authenticate, restrictTo } from '../middleware/auth';
import { storage } from '../storage';

const router = express.Router();

// Get all settings
router.get('/', authenticate, restrictTo('superadmin'), async (req, res, next) => {
  try {
    const allSettings = await storage.getAllSettings();

    res.status(200).json({
      status: 'success',
      data: allSettings,
    });
  } catch (err) {
    next(err);
  }
});

// Get setting by key
router.get('/:key', authenticate, async (req, res, next) => {
  try {
    const { key } = req.params;
    const userId = req.user?.id;
    if (!userId) {
      return next(new AppError('Not authenticated', 401));
    }

    const setting = await storage.getSetting(key);

    if (!setting) {
      return next(new AppError('Setting not found', 404));
    }

    // Check if setting is public or user has admin access
    if (
      !setting.isPublic &&
      !req.user?.isAdmin &&
      !req.user?.isSuperAdmin
    ) {
      return next(
        new AppError('You do not have permission to access this setting', 403)
      );
    }

    res.status(200).json({
      status: 'success',
      data: setting,
    });
  } catch (err) {
    next(err);
  }
});

// Create new setting
router.post(
  '/',
  authenticate,
  restrictTo('superadmin'),
  async (req, res, next) => {
    try {
      const { key, value, isPublic } = req.body;

      if (!key || value === undefined) {
        return next(new AppError('Please provide key and value', 400));
      }

      // Check if setting already exists
      const existingSetting = await storage.getSetting(key);

      if (existingSetting) {
        return next(new AppError('Setting with this key already exists', 400));
      }

      const newSetting = await storage.createSetting({
        key,
        value,
        isPublic: isPublic || false,
      });

      res.status(201).json({
        status: 'success',
        data: newSetting,
      });
    } catch (err) {
      next(err);
    }
  }
);

// Update setting
router.patch(
  '/:key',
  authenticate,
  restrictTo('superadmin'),
  async (req, res, next) => {
    try {
      const { key } = req.params;
      const { value, isPublic } = req.body;

      if (value === undefined && isPublic === undefined) {
        return next(new AppError('Please provide value or isPublic to update', 400));
      }

      // Check if setting exists
      const existingSetting = await storage.getSetting(key);

      if (!existingSetting) {
        return next(new AppError('Setting not found', 404));
      }

      const updatedSetting = await storage.updateSetting(key, {
        value: value !== undefined ? value : existingSetting.value,
        isPublic: isPublic !== undefined ? isPublic : existingSetting.isPublic,
      });

      res.status(200).json({
        status: 'success',
        data: updatedSetting,
      });
    } catch (err) {
      next(err);
    }
  }
);

// Delete setting
router.delete(
  '/:key',
  authenticate,
  restrictTo('superadmin'),
  async (req, res, next) => {
    try {
      const { key } = req.params;

      // Check if setting exists
      const existingSetting = await storage.getSetting(key);

      if (!existingSetting) {
        return next(new AppError('Setting not found', 404));
      }

      await storage.deleteSetting(key);

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