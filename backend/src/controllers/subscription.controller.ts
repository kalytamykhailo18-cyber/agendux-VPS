import { Request, Response } from 'express';
import { logger } from '../utils/logger';
import prisma from '../config/database';
import {
  createRecurringSubscription,
  createSubscriptionPreference,
  getSubscriptionStatus,
  cancelRecurringSubscription,
  cancelSubscription,
  getAvailablePlans,
  getRecurringSubscriptionStatus
} from '../services/mercadopago.service';

// ============================================
// GET AVAILABLE PLANS
// ============================================

export async function getPlans(req: Request, res: Response) {
  try {
    const plans = await getAvailablePlans();
    res.json({ success: true, plans });
  } catch (error) {
    logger.error('Error fetching plans:', error);
    res.status(500).json({ success: false, error: 'Error al obtener planes' });
  }
}

// ============================================
// GET CURRENT SUBSCRIPTION STATUS
// ============================================

export async function getMySubscription(req: Request, res: Response) {
  try {
    // SECURITY FIX: req.user?.id is userId, not professionalId
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, error: 'No autorizado' });
    }

    // Get professional record from userId
    const professional = await prisma.professional.findUnique({
      where: { userId },
      select: { id: true }
    });

    if (!professional) {
      return res.status(404).json({ success: false, error: 'Profesional no encontrado' });
    }

    const subscription = await getSubscriptionStatus(professional.id);
    res.json({ success: true, subscription });
  } catch (error) {
    logger.error('Error fetching subscription:', error);
    res.status(500).json({ success: false, error: 'Error al obtener suscripción' });
  }
}

// ============================================
// CREATE SUBSCRIPTION PAYMENT - RECURRING (AUTOMATIC)
// ============================================

export async function createSubscriptionPayment(req: Request, res: Response) {
  try {
    // SECURITY FIX: req.user?.id is userId, not professionalId
    const userId = req.user?.id;
    const { planId, billingPeriod, useRecurring = true } = req.body;

    if (!userId) {
      return res.status(401).json({ success: false, error: 'No autorizado' });
    }

    if (!planId || !billingPeriod) {
      return res.status(400).json({
        success: false,
        error: 'Plan y período de facturación son requeridos'
      });
    }

    if (!['MONTHLY', 'ANNUAL'].includes(billingPeriod)) {
      return res.status(400).json({
        success: false,
        error: 'Período de facturación inválido'
      });
    }

    // Get professional info for payment (lookup by userId first)
    const professional = await prisma.professional.findUnique({
      where: { userId },
      select: { id: true, firstName: true, lastName: true, user: { select: { email: true } } }
    });

    if (!professional) {
      return res.status(404).json({ success: false, error: 'Profesional no encontrado' });
    }

    // Use recurring subscription by default (automatic renewal)
    // Fall back to one-time payment if useRecurring=false (manual renewal)
    if (useRecurring) {
      const subscription = await createRecurringSubscription({
        professionalId: professional.id,
        planId,
        billingPeriod,
        email: professional.user.email,
        name: `${professional.firstName} ${professional.lastName}`
      });

      // CRITICAL FIX: Frontend expects 'preference' key, not 'subscription'
      res.json({ success: true, preference: subscription, recurring: true });
    } else {
      const preference = await createSubscriptionPreference({
        professionalId: professional.id,
        planId,
        billingPeriod,
        email: professional.user.email,
        name: `${professional.firstName} ${professional.lastName}`
      });

      res.json({ success: true, preference, recurring: false });
    }
  } catch (error: any) {
    logger.error('Error creating subscription payment:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error al crear pago de suscripción'
    });
  }
}

// ============================================
// CANCEL SUBSCRIPTION
// ============================================

export async function cancelMySubscription(req: Request, res: Response) {
  try {
    // SECURITY FIX: req.user?.id is userId, not professionalId
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, error: 'No autorizado' });
    }

    // Get professional record from userId
    const professional = await prisma.professional.findUnique({
      where: { userId },
      select: { id: true }
    });

    if (!professional) {
      return res.status(404).json({ success: false, error: 'Profesional no encontrado' });
    }

    // Check if subscription has MercadoPago subscription ID (recurring)
    const subscription = await prisma.subscription.findUnique({
      where: { professionalId: professional.id }
    });

    if (subscription?.mercadoPagoSubscriptionId) {
      // Cancel recurring subscription in MercadoPago
      const result = await cancelRecurringSubscription(professional.id);
      res.json(result);
    } else {
      // Cancel local subscription only (one-time payment)
      const result = await cancelSubscription(professional.id);
      res.json(result);
    }
  } catch (error: any) {
    logger.error('Error cancelling subscription:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error al cancelar suscripción'
    });
  }
}

// ============================================
// UPGRADE/CHANGE SUBSCRIPTION PLAN
// ============================================

export async function changePlan(req: Request, res: Response) {
  try {
    // SECURITY FIX: req.user?.id is userId, not professionalId
    const userId = req.user?.id;
    const { planId, billingPeriod, useRecurring = true } = req.body;

    if (!userId) {
      return res.status(401).json({ success: false, error: 'No autorizado' });
    }

    if (!planId || !billingPeriod) {
      return res.status(400).json({
        success: false,
        error: 'Plan y período de facturación son requeridos'
      });
    }

    // Get professional info
    const professional = await prisma.professional.findUnique({
      where: { userId },
      select: { id: true, firstName: true, lastName: true, user: { select: { email: true } } }
    });

    if (!professional) {
      return res.status(404).json({ success: false, error: 'Profesional no encontrado' });
    }

    // Check if they have an existing recurring subscription
    const existingSubscription = await prisma.subscription.findUnique({
      where: { professionalId: professional.id }
    });

    // If changing from recurring subscription, cancel the old one first
    if (existingSubscription?.mercadoPagoSubscriptionId) {
      try {
        await cancelRecurringSubscription(professional.id);
        logger.info(`Cancelled old recurring subscription for professional ${professional.id}`);
      } catch (error) {
        logger.error('Failed to cancel old subscription:', error);
        // Continue anyway - will create new subscription
      }
    }

    // Create new recurring subscription or one-time payment
    if (useRecurring) {
      const subscription = await createRecurringSubscription({
        professionalId: professional.id,
        planId,
        billingPeriod,
        email: professional.user.email,
        name: `${professional.firstName} ${professional.lastName}`
      });

      // CRITICAL FIX: Frontend expects 'preference' key, not 'subscription'
      res.json({ success: true, preference: subscription, recurring: true });
    } else {
      const preference = await createSubscriptionPreference({
        professionalId: professional.id,
        planId,
        billingPeriod,
        email: professional.user.email,
        name: `${professional.firstName} ${professional.lastName}`
      });

      res.json({ success: true, preference, recurring: false });
    }
  } catch (error: any) {
    logger.error('Error changing plan:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error al cambiar plan'
    });
  }
}
