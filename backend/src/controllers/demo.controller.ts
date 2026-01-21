import type { Request, Response } from 'express';
import { logger } from '../utils/logger';
import { sendWhatsAppMessage } from '../services/whatsapp.service';

// ============================================
// WHATSAPP DEMO
// Public endpoint - sends demo message to phone number
// ============================================

export const sendWhatsAppDemo = async (req: Request, res: Response) => {
  try {
    const { countryCode, phoneNumber } = req.body;

    if (!countryCode || !phoneNumber) {
      return res.status(400).json({
        success: false,
        error: 'Código de país y número de teléfono requeridos'
      });
    }

    // Validate phone number format
    const phoneRegex = /^\d{6,15}$/;
    if (!phoneRegex.test(phoneNumber)) {
      return res.status(400).json({
        success: false,
        error: 'Formato de número inválido'
      });
    }

    // Format full WhatsApp number
    const fullNumber = `${countryCode}${phoneNumber}`;

    // Demo message content (exact as per requirements)
    const message = `¡Hola! Este es un mensaje de ejemplo de Agendux. Así es como tus pacientes recibirán recordatorios automáticos de sus citas. 📅`;

    // Send WhatsApp message
    const sent = await sendWhatsAppMessage({
      to: fullNumber,
      message
    });

    if (!sent) {
      return res.status(500).json({
        success: false,
        error: 'No se pudo enviar el mensaje. Verifica que el número sea correcto e intenta nuevamente.'
      });
    }

    logger.info('Demo WhatsApp message sent successfully', {
      to: fullNumber
    });

    return res.json({
      success: true,
      message: 'Mensaje de demostración enviado exitosamente'
    });
  } catch (error) {
    logger.error('Error sending WhatsApp demo:', error);
    return res.status(500).json({
      success: false,
      error: 'Error al enviar el mensaje de demostración'
    });
  }
};
