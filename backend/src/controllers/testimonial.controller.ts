import type { Request, Response } from 'express';
import { logger } from '../utils/logger';
import {
  getActiveTestimonials,
  getAllTestimonials,
  getTestimonialById,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
  reorderTestimonials,
} from '../services/testimonial.service';

// ============================================
// TESTIMONIAL CONTROLLER
// Public endpoints for homepage + Admin CRUD
// Requirement 12: Marketing Features - Testimonials Section
// ============================================

// ============================================
// PUBLIC ENDPOINTS
// ============================================

/**
 * GET /api/testimonials
 * Get all active testimonials for homepage display
 */
export const getPublicTestimonials = async (req: Request, res: Response) => {
  try {
    const testimonials = await getActiveTestimonials();

    // Prevent caching to ensure testimonials are always fresh
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    return res.json({
      success: true,
      data: testimonials,
    });
  } catch (error) {
    logger.error('Get public testimonials error:', error);
    return res.status(500).json({
      success: false,
      error: 'Error al obtener testimonios',
    });
  }
};

// ============================================
// ADMIN ENDPOINTS
// ============================================

/**
 * GET /api/admin/testimonials
 * Get all testimonials (including inactive) for admin management
 */
export const getAdminTestimonials = async (req: Request, res: Response) => {
  try {
    const testimonials = await getAllTestimonials();

    return res.json({
      success: true,
      data: testimonials,
    });
  } catch (error) {
    logger.error('Get admin testimonials error:', error);
    return res.status(500).json({
      success: false,
      error: 'Error al obtener testimonios',
    });
  }
};

/**
 * GET /api/admin/testimonials/:id
 * Get single testimonial by ID
 */
export const getTestimonial = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const testimonial = await getTestimonialById(id);

    if (!testimonial) {
      return res.status(404).json({
        success: false,
        error: 'Testimonio no encontrado',
      });
    }

    return res.json({
      success: true,
      data: testimonial,
    });
  } catch (error) {
    logger.error('Get testimonial error:', error);
    return res.status(500).json({
      success: false,
      error: 'Error al obtener testimonio',
    });
  }
};

/**
 * POST /api/admin/testimonials
 * Create new testimonial
 */
export const createNewTestimonial = async (req: Request, res: Response) => {
  try {
    const { name, profession, rating, review, photo, displayOrder } = req.body;

    // Validation
    if (!name || !profession || !rating || !review) {
      return res.status(400).json({
        success: false,
        error: 'Nombre, profesión, calificación y reseña son requeridos',
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        error: 'La calificación debe estar entre 1 y 5',
      });
    }

    const testimonial = await createTestimonial({
      name,
      profession,
      rating,
      review,
      photo,
      displayOrder,
    });

    return res.status(201).json({
      success: true,
      data: testimonial,
    });
  } catch (error) {
    logger.error('Create testimonial error:', error);
    return res.status(500).json({
      success: false,
      error: 'Error al crear testimonio',
    });
  }
};

/**
 * PUT /api/admin/testimonials/:id
 * Update testimonial
 */
export const updateExistingTestimonial = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, profession, rating, review, photo, isActive, displayOrder } = req.body;

    // Validate rating if provided
    if (rating !== undefined && (rating < 1 || rating > 5)) {
      return res.status(400).json({
        success: false,
        error: 'La calificación debe estar entre 1 y 5',
      });
    }

    const testimonial = await updateTestimonial(id, {
      name,
      profession,
      rating,
      review,
      photo,
      isActive,
      displayOrder,
    });

    return res.json({
      success: true,
      data: testimonial,
    });
  } catch (error) {
    logger.error('Update testimonial error:', error);
    return res.status(500).json({
      success: false,
      error: 'Error al actualizar testimonio',
    });
  }
};

/**
 * DELETE /api/admin/testimonials/:id
 * Delete testimonial
 */
export const deleteExistingTestimonial = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await deleteTestimonial(id);

    return res.json({
      success: true,
      message: 'Testimonio eliminado correctamente',
    });
  } catch (error) {
    logger.error('Delete testimonial error:', error);
    return res.status(500).json({
      success: false,
      error: 'Error al eliminar testimonio',
    });
  }
};

/**
 * POST /api/admin/testimonials/reorder
 * Reorder testimonials
 */
export const reorderTestimonialsHandler = async (req: Request, res: Response) => {
  try {
    const { orders } = req.body;

    if (!Array.isArray(orders) || orders.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'El array de órdenes es requerido',
      });
    }

    // Validate format
    for (const order of orders) {
      if (!order.id || typeof order.displayOrder !== 'number') {
        return res.status(400).json({
          success: false,
          error: 'Formato de orden inválido (requiere id y displayOrder)',
        });
      }
    }

    await reorderTestimonials(orders);

    return res.json({
      success: true,
      message: 'Testimonios reordenados correctamente',
    });
  } catch (error) {
    logger.error('Reorder testimonials error:', error);
    return res.status(500).json({
      success: false,
      error: 'Error al reordenar testimonios',
    });
  }
};
