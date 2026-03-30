import type { Response } from 'express';
import { logger } from '../utils/logger';
import prisma from '../config/database';
import type { AuthRequest } from '../middlewares/auth.middleware';

// ============================================
// PROFESSIONAL PROFILE MANAGEMENT
// Address fields for booking confirmation messages
// ============================================

// Get profile for the logged-in professional
export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'No autorizado'
      });
    }

    const professional = await prisma.professional.findUnique({
      where: { userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        phone: true,
        addressStreet: true,
        addressCity: true
      }
    });

    if (!professional) {
      return res.status(404).json({
        success: false,
        error: 'Profesional no encontrado'
      });
    }

    return res.json({
      success: true,
      data: {
        firstName: professional.firstName,
        lastName: professional.lastName,
        phone: professional.phone,
        addressStreet: professional.addressStreet,
        addressCity: professional.addressCity
      }
    });
  } catch (error) {
    logger.error('Error getting profile:', error);
    return res.status(500).json({
      success: false,
      error: 'Error al obtener perfil'
    });
  }
};

// Update profile
export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { addressStreet, addressCity } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'No autorizado'
      });
    }

    const professional = await prisma.professional.findUnique({
      where: { userId }
    });

    if (!professional) {
      return res.status(404).json({
        success: false,
        error: 'Profesional no encontrado'
      });
    }

    // Build update data (only address fields for now)
    const updateData: Record<string, string | null> = {};

    if (addressStreet !== undefined) {
      updateData.addressStreet = addressStreet ? String(addressStreet).trim() : null;
    }
    if (addressCity !== undefined) {
      updateData.addressCity = addressCity ? String(addressCity).trim() : null;
    }

    const updatedProfessional = await prisma.professional.update({
      where: { id: professional.id },
      data: updateData,
      select: {
        firstName: true,
        lastName: true,
        phone: true,
        addressStreet: true,
        addressCity: true
      }
    });

    return res.json({
      success: true,
      message: 'Perfil actualizado correctamente',
      data: {
        firstName: updatedProfessional.firstName,
        lastName: updatedProfessional.lastName,
        phone: updatedProfessional.phone,
        addressStreet: updatedProfessional.addressStreet,
        addressCity: updatedProfessional.addressCity
      }
    });
  } catch (error) {
    logger.error('Error updating profile:', error);
    return res.status(500).json({
      success: false,
      error: 'Error al actualizar perfil'
    });
  }
};

// Get notification preferences
export const getNotificationPreferences = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, error: 'No autorizado' });

    const professional = await prisma.professional.findUnique({ where: { userId }, select: { id: true } });
    if (!professional) return res.status(404).json({ success: false, error: 'Profesional no encontrado' });

    const settings = await prisma.professionalSettings.findUnique({
      where: { professionalId: professional.id },
      select: { notifyNewBookingEmail: true, notifyNewBookingWhatsapp: true }
    });

    return res.json({
      success: true,
      data: {
        notifyNewBookingEmail: settings?.notifyNewBookingEmail ?? true,
        notifyNewBookingWhatsapp: settings?.notifyNewBookingWhatsapp ?? false
      }
    });
  } catch (error) {
    logger.error('Error getting notification preferences:', error);
    return res.status(500).json({ success: false, error: 'Error al obtener preferencias' });
  }
};

// Update notification preferences
export const updateNotificationPreferences = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, error: 'No autorizado' });

    const professional = await prisma.professional.findUnique({ where: { userId }, select: { id: true } });
    if (!professional) return res.status(404).json({ success: false, error: 'Profesional no encontrado' });

    const { notifyNewBookingEmail, notifyNewBookingWhatsapp } = req.body;

    await prisma.professionalSettings.upsert({
      where: { professionalId: professional.id },
      update: {
        ...(notifyNewBookingEmail !== undefined && { notifyNewBookingEmail }),
        ...(notifyNewBookingWhatsapp !== undefined && { notifyNewBookingWhatsapp })
      },
      create: {
        professionalId: professional.id,
        notifyNewBookingEmail: notifyNewBookingEmail ?? true,
        notifyNewBookingWhatsapp: notifyNewBookingWhatsapp ?? false
      }
    });

    return res.json({ success: true, message: 'Preferencias actualizadas' });
  } catch (error) {
    logger.error('Error updating notification preferences:', error);
    return res.status(500).json({ success: false, error: 'Error al actualizar preferencias' });
  }
};
