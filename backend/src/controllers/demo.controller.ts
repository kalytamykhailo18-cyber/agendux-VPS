import type { Request, Response } from 'express';
import { logger } from '../utils/logger';
import { sendWhatsAppTemplate } from '../services/whatsapp.service';

// ============================================
// WHATSAPP DEMO
// Public endpoint - sends demo message to phone number
// Uses approved Content Template (WhatsApp Business API
// requires templates for business-initiated messages)
// ============================================

// Demo template ContentSid (approved by Meta)
const DEMO_CONTENT_SID = 'HX00f305cf702bfcc6fe2cc29f1cf693bf';

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

    // Send WhatsApp demo via approved template (no variables - static content)
    const sent = await sendWhatsAppTemplate({
      to: fullNumber,
      contentSid: DEMO_CONTENT_SID,
      contentVariables: {}
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
