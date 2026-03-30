import { Router } from 'express';
import { getProfile, updateProfile, getNotificationPreferences, updateNotificationPreferences } from '../controllers/profile.controller';
import { authenticateToken, requireRole } from '../middlewares/auth.middleware';

const router = Router();

// All routes require authentication and professional role
router.use(authenticateToken);
router.use(requireRole(['PROFESSIONAL']));

// GET /api/professional/profile - Get profile
router.get('/', getProfile);

// PUT /api/professional/profile - Update profile
router.put('/', updateProfile);

// GET /api/professional/profile/notifications - Get notification preferences
router.get('/notifications', getNotificationPreferences);

// PUT /api/professional/profile/notifications - Update notification preferences
router.put('/notifications', updateNotificationPreferences);

export default router;
