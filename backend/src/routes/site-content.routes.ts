import { Router } from 'express';
import {
  getPublicSiteContent,
  getAdminHeroContent,
  updateHeroContent,
  getAdminCTAContent,
  updateCTAContent,
  getAdminFeatures,
  createFeature,
  updateFeature,
  deleteFeature,
  reorderFeatures,
  getAdminFAQs,
  createFAQ,
  updateFAQ,
  deleteFAQ,
  reorderFAQs,
} from '../controllers/site-content.controller';
import { authenticateAdmin } from '../middlewares/auth.middleware';
import { validateBody } from '../middleware/validation.middleware';
import { z } from 'zod';

const router = Router();

// ============================================
// PUBLIC ROUTES (No authentication required)
// ============================================

// GET /api/site-content - Get all content for landing page
router.get('/', getPublicSiteContent);

// ============================================
// ADMIN ROUTES (Require admin authentication)
// ============================================

// --- Hero Section ---
const heroSchema = z.object({
  title: z.string().min(1, 'Título es requerido').max(200),
  subtitle: z.string().min(1, 'Subtítulo es requerido').max(500),
  linkExample: z.string().min(1, 'Ejemplo de link es requerido').max(100),
  ctaButtonText: z.string().min(1, 'Texto del botón es requerido').max(100),
  ctaSubtext: z.string().min(1, 'Texto secundario es requerido').max(200),
});

router.get('/admin/hero', authenticateAdmin, getAdminHeroContent);
router.put('/admin/hero', authenticateAdmin, validateBody(heroSchema), updateHeroContent);

// --- CTA Section ---
const ctaSchema = z.object({
  title: z.string().min(1, 'Título es requerido').max(200),
  subtitle: z.string().min(1, 'Subtítulo es requerido').max(500),
  buttonText: z.string().min(1, 'Texto del botón es requerido').max(100),
  subtext: z.string().min(1, 'Texto secundario es requerido').max(200),
});

router.get('/admin/cta', authenticateAdmin, getAdminCTAContent);
router.put('/admin/cta', authenticateAdmin, validateBody(ctaSchema), updateCTAContent);

// --- Features ---
const createFeatureSchema = z.object({
  icon: z.string().min(1, 'Ícono es requerido').max(50),
  title: z.string().min(1, 'Título es requerido').max(100),
  description: z.string().min(1, 'Descripción es requerida').max(500),
});

const updateFeatureSchema = z.object({
  icon: z.string().min(1).max(50).optional(),
  title: z.string().min(1).max(100).optional(),
  description: z.string().min(1).max(500).optional(),
  isActive: z.boolean().optional(),
  displayOrder: z.number().int().min(0).optional(),
});

const reorderSchema = z.object({
  orders: z.array(
    z.object({
      id: z.string().min(1),
      displayOrder: z.number().int().min(0),
    })
  ).min(1),
});

router.get('/admin/features', authenticateAdmin, getAdminFeatures);
router.post('/admin/features', authenticateAdmin, validateBody(createFeatureSchema), createFeature);
router.put('/admin/features/:id', authenticateAdmin, validateBody(updateFeatureSchema), updateFeature);
router.delete('/admin/features/:id', authenticateAdmin, deleteFeature);
router.post('/admin/features/reorder', authenticateAdmin, validateBody(reorderSchema), reorderFeatures);

// --- FAQs ---
const createFAQSchema = z.object({
  question: z.string().min(1, 'Pregunta es requerida').max(300),
  answer: z.string().min(1, 'Respuesta es requerida').max(2000),
});

const updateFAQSchema = z.object({
  question: z.string().min(1).max(300).optional(),
  answer: z.string().min(1).max(2000).optional(),
  isActive: z.boolean().optional(),
  displayOrder: z.number().int().min(0).optional(),
});

router.get('/admin/faqs', authenticateAdmin, getAdminFAQs);
router.post('/admin/faqs', authenticateAdmin, validateBody(createFAQSchema), createFAQ);
router.put('/admin/faqs/:id', authenticateAdmin, validateBody(updateFAQSchema), updateFAQ);
router.delete('/admin/faqs/:id', authenticateAdmin, deleteFAQ);
router.post('/admin/faqs/reorder', authenticateAdmin, validateBody(reorderSchema), reorderFAQs);

export default router;
