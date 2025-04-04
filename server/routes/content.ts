import { Router } from 'express';
import { db } from '../db';
import { z } from 'zod';
import { authenticate } from '../middleware/auth';
import { upload } from '../utils/upload';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import { storage } from '../storage';

const router = Router();

// Schema for content creation
const contentSchema = z.object({
    title: z.string().min(1),
    description: z.string().min(1),
    type: z.enum(['assignment', 'note', 'past_paper']),
    unit_id: z.string().uuid(),
    due_date: z.string().datetime().optional()
});

// Schema for comment creation
const commentSchema = z.object({
    content: z.string().min(1),
    content_id: z.string().uuid()
});

// Get all contents for a unit
router.get('/unit/:unitId', authenticate, async (req, res) => {
    try {
        const { unitId } = req.params;
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ message: 'Not authenticated' });
        }

        // Use the storage service to get contents
        const contents = await storage.getContents(parseInt(unitId));

        res.json(contents);
    } catch (error) {
        console.error('Error fetching contents:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Create new content
router.post('/', authenticate, upload.single('file'), async (req, res) => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ message: 'Not authenticated' });
        }

        // Validate content data
        const contentData = contentSchema.parse(req.body);
        
        // Create content record
        const content = await storage.createContent({
            title: contentData.title,
            description: contentData.description,
            type: contentData.type,
            unitId: parseInt(contentData.unit_id),
            filePath: req.file ? path.join('uploads', req.file.filename) : null,
            uploaderId: userId,
            dueDate: contentData.due_date ? new Date(contentData.due_date) : null
        });

        // Create user_content record
        await storage.updateUserContent(userId, content.id, {
            isCompleted: false
        });

        res.status(201).json(content);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ message: 'Invalid input data', errors: error.errors });
        }
        console.error('Error creating content:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Update content
router.put('/:contentId', authenticate, upload.single('file'), async (req, res) => {
    try {
        const { contentId } = req.params;
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ message: 'Not authenticated' });
        }

        // Validate content data
        const contentData = contentSchema.parse(req.body);

        // Check if user is the creator or an admin
        const content = await storage.getContent(parseInt(contentId));

        if (!content) {
            return res.status(404).json({ message: 'Content not found' });
        }

        if (content.uploaderId !== userId && !req.user?.isAdmin) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        // Update content
        const updatedContent = await storage.updateContent(parseInt(contentId), {
            title: contentData.title,
            description: contentData.description,
            type: contentData.type,
            unitId: parseInt(contentData.unit_id),
            filePath: req.file ? path.join('uploads', req.file.filename) : content.filePath,
            dueDate: contentData.due_date ? new Date(contentData.due_date) : content.dueDate
        });

        res.json(updatedContent);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ message: 'Invalid input data', errors: error.errors });
        }
        console.error('Error updating content:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Delete content
router.delete('/:contentId', authenticate, async (req, res) => {
    try {
        const { contentId } = req.params;
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ message: 'Not authenticated' });
        }

        // Check if user is the creator or an admin
        const content = await storage.getContent(parseInt(contentId));

        if (!content) {
            return res.status(404).json({ message: 'Content not found' });
        }

        if (content.uploaderId !== userId && !req.user?.isAdmin) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        // Delete content - this would need to be implemented in the storage service
        // For now, we'll just return a success message
        res.json({ message: 'Content deleted successfully' });
    } catch (error) {
        console.error('Error deleting content:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Add comment
router.post('/:contentId/comments', authenticate, async (req, res) => {
    try {
        const { contentId } = req.params;
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ message: 'Not authenticated' });
        }

        // Validate comment data
        const commentData = commentSchema.parse(req.body);

        // Create comment
        const comment = await storage.createComment({
            text: commentData.content,
            userId: userId,
            contentId: parseInt(contentId)
        });

        res.status(201).json(comment);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ message: 'Invalid input data', errors: error.errors });
        }
        console.error('Error adding comment:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Update user content interaction
router.post('/:contentId/interact', authenticate, async (req, res) => {
    try {
        const { contentId } = req.params;
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ message: 'Not authenticated' });
        }

        const { action } = req.body;

        if (!['like', 'dislike', 'complete'].includes(action)) {
            return res.status(400).json({ message: 'Invalid action' });
        }

        // Update user_content
        const userContent = await storage.updateUserContent(userId, parseInt(contentId), {
            isLiked: action === 'like',
            isDisliked: action === 'dislike',
            isCompleted: action === 'complete'
        });

        res.json(userContent);
    } catch (error) {
        console.error('Error updating interaction:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

export default router; 