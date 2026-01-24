import { Router } from 'express';
import {
  getPublicTestimonials,
  getAdminTestimonials,
  getTestimonial,
  createNewTestimonial,
  updateExistingTestimonial,
  deleteExistingTestimonial,
  reorderTestimonialsHandler,
} from '../controllers/testimonial.controller';
import { authenticateAdmin } from '../middlewares/auth.middleware';
import { validateBody } from '../middleware/validation.middleware';
import { z } from 'zod';

const router = Router();

// ============================================
// PUBLIC ROUTES (No authentication required)
// ============================================

// GET /api/testimonials - Get active testimonials for homepage
router.get('/', getPublicTestimonials);

// ============================================
// ADMIN ROUTES (Require admin authentication)
// ============================================

// Validation schemas
const createTestimonialSchema = z.object({
  name: z.string().min(1, 'Nombre es requerido').max(100),
  profession: z.string().min(1, 'Profesión es requerida').max(100),
  rating: z.number().int().min(1).max(5),
  review: z.string().min(10, 'La reseña debe tener al menos 10 caracteres').max(1000),
  photo: z.string().url('URL de foto inválida').optional(),
  displayOrder: z.number().int().min(0).optional(),
});

const updateTestimonialSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  profession: z.string().min(1).max(100).optional(),
  rating: z.number().int().min(1).max(5).optional(),
  review: z.string().min(10).max(1000).optional(),
  photo: z.string().url().optional().nullable().or(z.literal('')),
  isActive: z.boolean().optional(),
  displayOrder: z.number().int().min(0).optional(),
});

const reorderTestimonialsSchema = z.object({
  orders: z.array(
    z.object({
      id: z.string().uuid(),
      displayOrder: z.number().int().min(0),
    })
  ).min(1),
});

// Admin routes - all require authentication
router.get('/admin', authenticateAdmin, getAdminTestimonials);
router.get('/admin/:id', authenticateAdmin, getTestimonial);
router.post(
  '/admin',
  authenticateAdmin,
  validateBody(createTestimonialSchema),
  createNewTestimonial
);
router.put(
  '/admin/:id',
  authenticateAdmin,
  validateBody(updateTestimonialSchema),
  updateExistingTestimonial
);
router.delete('/admin/:id', authenticateAdmin, deleteExistingTestimonial);
router.post(
  '/admin/reorder',
  authenticateAdmin,
  validateBody(reorderTestimonialsSchema),
  reorderTestimonialsHandler
);

export default router;
