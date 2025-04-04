import express from 'express';
import { AppError } from '../middleware/errorHandler';
import { authenticate } from '../middleware/auth';
import { storage } from '../storage';

const router = express.Router();

// Get all notifications for current user
router.get('/', authenticate, async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return next(new AppError('Not authenticated', 401));
    }

    const userNotifications = await storage.getNotifications(userId);

    res.status(200).json({
      status: 'success',
      data: userNotifications,
    });
  } catch (err) {
    next(err);
  }
});

// Get unread notifications count
router.get('/unread/count', authenticate, async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return next(new AppError('Not authenticated', 401));
    }

    const unreadCount = await storage.getUnreadNotificationCount(userId);

    res.status(200).json({
      status: 'success',
      data: {
        count: unreadCount,
      },
    });
  } catch (err) {
    next(err);
  }
});

// Mark notification as read
router.patch('/:id/read', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    if (!userId) {
      return next(new AppError('Not authenticated', 401));
    }

    // Check if notification exists and belongs to user
    const notification = await storage.getNotification(parseInt(id));
    if (!notification || notification.userId !== userId) {
      return next(new AppError('Notification not found', 404));
    }

    // Update notification
    await storage.markNotificationAsRead(parseInt(id));

    res.status(200).json({
      status: 'success',
      message: 'Notification marked as read',
    });
  } catch (err) {
    next(err);
  }
});

// Mark all notifications as read
router.patch('/read-all', authenticate, async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return next(new AppError('Not authenticated', 401));
    }

    await storage.markAllNotificationsAsRead(userId);

    res.status(200).json({
      status: 'success',
      message: 'All notifications marked as read',
    });
  } catch (err) {
    next(err);
  }
});

export default router; 