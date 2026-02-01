import { Request, Response } from 'express';
import prisma from '../config/database';
import { logger } from '../utils/logger';
import type { HeroContent, CTAContent } from '../types/site-content.types';

// ============================================
// DEFAULT CONTENT (Fallback if database is empty)
// ============================================

const DEFAULT_HERO: HeroContent = {
  title: 'Dejá de perder tiempo dando turnos por mensajes y llamadas',
  subtitle: 'Tu link personalizado + código QR para que tus pacientes reserven solos, 24/7',
  linkExample: 'agendux.com/tunombre',
  ctaButtonText: 'Comenzar Gratis - Sin Tarjeta',
  ctaSubtext: '14 días de prueba gratis • Obtené tu link y QR en minutos',
};

const DEFAULT_CTA: CTAContent = {
  title: '¿Listo para dejar de perder tiempo con los turnos?',
  subtitle: 'Obtené tu link y QR en minutos. Empezá hoy mismo sin complicaciones.',
  buttonText: 'Comenzar Gratis - Sin Tarjeta',
  subtext: '14 días de prueba gratis • Sin compromiso • Cancelá cuando quieras',
};

// ============================================
// PUBLIC: Get all site content for landing page
// ============================================

export async function getPublicSiteContent(req: Request, res: Response) {
  try {
    // Get Hero and CTA from SiteContent
    const [heroRow, ctaRow] = await Promise.all([
      prisma.siteContent.findUnique({ where: { section: 'hero' } }),
      prisma.siteContent.findUnique({ where: { section: 'cta' } }),
    ]);

    // Get active Features and FAQs ordered by displayOrder
    const [features, faqs] = await Promise.all([
      prisma.feature.findMany({
        where: { isActive: true },
        orderBy: { displayOrder: 'asc' },
      }),
      prisma.fAQ.findMany({
        where: { isActive: true },
        orderBy: { displayOrder: 'asc' },
      }),
    ]);

    res.json({
      success: true,
      data: {
        hero: (heroRow?.content as HeroContent) || DEFAULT_HERO,
        cta: (ctaRow?.content as CTAContent) || DEFAULT_CTA,
        features,
        faqs,
      },
    });
  } catch (error) {
    logger.error('Error fetching site content:', error);
    res.status(500).json({ success: false, error: 'Error al obtener contenido' });
  }
}

// ============================================
// ADMIN: Hero Content
// ============================================

export async function getAdminHeroContent(req: Request, res: Response) {
  try {
    const hero = await prisma.siteContent.findUnique({ where: { section: 'hero' } });
    res.json({ success: true, data: (hero?.content as HeroContent) || DEFAULT_HERO });
  } catch (error) {
    logger.error('Error fetching hero content:', error);
    res.status(500).json({ success: false, error: 'Error al obtener contenido' });
  }
}

export async function updateHeroContent(req: Request, res: Response) {
  try {
    const content = req.body as HeroContent;
    const adminId = req.userId;

    const hero = await prisma.siteContent.upsert({
      where: { section: 'hero' },
      update: { content, updatedBy: adminId },
      create: { section: 'hero', content, updatedBy: adminId },
    });

    res.json({ success: true, data: hero.content as HeroContent });
  } catch (error) {
    logger.error('Error updating hero content:', error);
    res.status(500).json({ success: false, error: 'Error al actualizar contenido' });
  }
}

// ============================================
// ADMIN: CTA Content
// ============================================

export async function getAdminCTAContent(req: Request, res: Response) {
  try {
    const cta = await prisma.siteContent.findUnique({ where: { section: 'cta' } });
    res.json({ success: true, data: (cta?.content as CTAContent) || DEFAULT_CTA });
  } catch (error) {
    logger.error('Error fetching CTA content:', error);
    res.status(500).json({ success: false, error: 'Error al obtener contenido' });
  }
}

export async function updateCTAContent(req: Request, res: Response) {
  try {
    const content = req.body as CTAContent;
    const adminId = req.userId;

    const cta = await prisma.siteContent.upsert({
      where: { section: 'cta' },
      update: { content, updatedBy: adminId },
      create: { section: 'cta', content, updatedBy: adminId },
    });

    res.json({ success: true, data: cta.content as CTAContent });
  } catch (error) {
    logger.error('Error updating CTA content:', error);
    res.status(500).json({ success: false, error: 'Error al actualizar contenido' });
  }
}

// ============================================
// ADMIN: Features CRUD
// ============================================

export async function getAdminFeatures(req: Request, res: Response) {
  try {
    const features = await prisma.feature.findMany({
      orderBy: { displayOrder: 'asc' },
    });
    res.json({ success: true, data: features });
  } catch (error) {
    logger.error('Error fetching features:', error);
    res.status(500).json({ success: false, error: 'Error al obtener features' });
  }
}

export async function createFeature(req: Request, res: Response) {
  try {
    const { icon, title, description } = req.body;

    // Get max display order and add 1
    const maxOrder = await prisma.feature.aggregate({ _max: { displayOrder: true } });
    const displayOrder = (maxOrder._max.displayOrder || 0) + 1;

    const feature = await prisma.feature.create({
      data: { icon, title, description, displayOrder },
    });

    res.status(201).json({ success: true, data: feature });
  } catch (error) {
    logger.error('Error creating feature:', error);
    res.status(500).json({ success: false, error: 'Error al crear feature' });
  }
}

export async function updateFeature(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const data = req.body;

    const feature = await prisma.feature.update({
      where: { id },
      data,
    });

    res.json({ success: true, data: feature });
  } catch (error) {
    logger.error('Error updating feature:', error);
    res.status(500).json({ success: false, error: 'Error al actualizar feature' });
  }
}

export async function deleteFeature(req: Request, res: Response) {
  try {
    const { id } = req.params;
    await prisma.feature.delete({ where: { id } });
    res.json({ success: true, message: 'Feature eliminado' });
  } catch (error) {
    logger.error('Error deleting feature:', error);
    res.status(500).json({ success: false, error: 'Error al eliminar feature' });
  }
}

export async function reorderFeatures(req: Request, res: Response) {
  try {
    const { orders } = req.body as { orders: { id: string; displayOrder: number }[] };

    await prisma.$transaction(
      orders.map((item) =>
        prisma.feature.update({
          where: { id: item.id },
          data: { displayOrder: item.displayOrder },
        })
      )
    );

    const features = await prisma.feature.findMany({ orderBy: { displayOrder: 'asc' } });
    res.json({ success: true, data: features });
  } catch (error) {
    logger.error('Error reordering features:', error);
    res.status(500).json({ success: false, error: 'Error al reordenar features' });
  }
}

// ============================================
// ADMIN: FAQs CRUD
// ============================================

export async function getAdminFAQs(req: Request, res: Response) {
  try {
    const faqs = await prisma.fAQ.findMany({
      orderBy: { displayOrder: 'asc' },
    });
    res.json({ success: true, data: faqs });
  } catch (error) {
    logger.error('Error fetching FAQs:', error);
    res.status(500).json({ success: false, error: 'Error al obtener FAQs' });
  }
}

export async function createFAQ(req: Request, res: Response) {
  try {
    const { question, answer } = req.body;

    // Get max display order and add 1
    const maxOrder = await prisma.fAQ.aggregate({ _max: { displayOrder: true } });
    const displayOrder = (maxOrder._max.displayOrder || 0) + 1;

    const faq = await prisma.fAQ.create({
      data: { question, answer, displayOrder },
    });

    res.status(201).json({ success: true, data: faq });
  } catch (error) {
    logger.error('Error creating FAQ:', error);
    res.status(500).json({ success: false, error: 'Error al crear FAQ' });
  }
}

export async function updateFAQ(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const data = req.body;

    const faq = await prisma.fAQ.update({
      where: { id },
      data,
    });

    res.json({ success: true, data: faq });
  } catch (error) {
    logger.error('Error updating FAQ:', error);
    res.status(500).json({ success: false, error: 'Error al actualizar FAQ' });
  }
}

export async function deleteFAQ(req: Request, res: Response) {
  try {
    const { id } = req.params;
    await prisma.fAQ.delete({ where: { id } });
    res.json({ success: true, message: 'FAQ eliminado' });
  } catch (error) {
    logger.error('Error deleting FAQ:', error);
    res.status(500).json({ success: false, error: 'Error al eliminar FAQ' });
  }
}

export async function reorderFAQs(req: Request, res: Response) {
  try {
    const { orders } = req.body as { orders: { id: string; displayOrder: number }[] };

    await prisma.$transaction(
      orders.map((item) =>
        prisma.fAQ.update({
          where: { id: item.id },
          data: { displayOrder: item.displayOrder },
        })
      )
    );

    const faqs = await prisma.fAQ.findMany({ orderBy: { displayOrder: 'asc' } });
    res.json({ success: true, data: faqs });
  } catch (error) {
    logger.error('Error reordering FAQs:', error);
    res.status(500).json({ success: false, error: 'Error al reordenar FAQs' });
  }
}
