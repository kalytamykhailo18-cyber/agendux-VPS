import prisma from '../config/database';
import { logger } from '../utils/logger';

// ============================================
// TESTIMONIAL SERVICE
// Handles CRUD operations for homepage testimonials
// Requirement 12: Marketing Features - Testimonials Section
// ============================================

export interface CreateTestimonialData {
  name: string;
  profession: string;
  rating: number;
  review: string;
  photo?: string;
  displayOrder?: number;
}

export interface UpdateTestimonialData {
  name?: string;
  profession?: string;
  rating?: number;
  review?: string;
  photo?: string;
  isActive?: boolean;
  displayOrder?: number;
}

/**
 * Get all active testimonials (public endpoint)
 * Ordered by displayOrder ASC
 */
export const getActiveTestimonials = async () => {
  try {
    const testimonials = await prisma.testimonial.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: 'asc' },
      select: {
        id: true,
        name: true,
        profession: true,
        rating: true,
        review: true,
        photo: true,
      },
    });

    return testimonials;
  } catch (error) {
    logger.error('Get active testimonials error:', error);
    throw new Error('Error al obtener testimonios');
  }
};

/**
 * Get all testimonials (admin endpoint)
 * Includes inactive ones
 */
export const getAllTestimonials = async () => {
  try {
    const testimonials = await prisma.testimonial.findMany({
      orderBy: { displayOrder: 'asc' },
    });

    return testimonials;
  } catch (error) {
    logger.error('Get all testimonials error:', error);
    throw new Error('Error al obtener todos los testimonios');
  }
};

/**
 * Get testimonial by ID
 */
export const getTestimonialById = async (id: string) => {
  try {
    const testimonial = await prisma.testimonial.findUnique({
      where: { id },
    });

    return testimonial;
  } catch (error) {
    logger.error('Get testimonial by ID error:', error);
    throw new Error('Error al obtener testimonio');
  }
};

/**
 * Create testimonial (admin only)
 */
export const createTestimonial = async (data: CreateTestimonialData) => {
  try {
    // Auto-increment displayOrder if not provided
    if (data.displayOrder === undefined) {
      const maxOrder = await prisma.testimonial.aggregate({
        _max: { displayOrder: true },
      });
      data.displayOrder = (maxOrder._max.displayOrder || 0) + 1;
    }

    const testimonial = await prisma.testimonial.create({
      data: {
        name: data.name,
        profession: data.profession,
        rating: data.rating,
        review: data.review,
        photo: data.photo,
        displayOrder: data.displayOrder,
      },
    });

    logger.info('Testimonial created', { id: testimonial.id });
    return testimonial;
  } catch (error) {
    logger.error('Create testimonial error:', error);
    throw new Error('Error al crear testimonio');
  }
};

/**
 * Update testimonial (admin only)
 */
export const updateTestimonial = async (id: string, data: UpdateTestimonialData) => {
  try {
    const testimonial = await prisma.testimonial.update({
      where: { id },
      data,
    });

    logger.info('Testimonial updated', { id: testimonial.id });
    return testimonial;
  } catch (error) {
    logger.error('Update testimonial error:', error);
    throw new Error('Error al actualizar testimonio');
  }
};

/**
 * Delete testimonial (admin only)
 */
export const deleteTestimonial = async (id: string) => {
  try {
    await prisma.testimonial.delete({
      where: { id },
    });

    logger.info('Testimonial deleted', { id });
    return true;
  } catch (error) {
    logger.error('Delete testimonial error:', error);
    throw new Error('Error al eliminar testimonio');
  }
};

/**
 * Reorder testimonials (admin only)
 * Updates displayOrder for multiple testimonials at once
 */
export const reorderTestimonials = async (orders: { id: string; displayOrder: number }[]) => {
  try {
    await prisma.$transaction(
      orders.map((order) =>
        prisma.testimonial.update({
          where: { id: order.id },
          data: { displayOrder: order.displayOrder },
        })
      )
    );

    logger.info('Testimonials reordered', { count: orders.length });
    return true;
  } catch (error) {
    logger.error('Reorder testimonials error:', error);
    throw new Error('Error al reordenar testimonios');
  }
};
