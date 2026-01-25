import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { sendEmail } from '../services/email.service';
import { logger } from '../utils/logger';

const router = Router();

// Validation schema
const contactInquirySchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido'),
  apellido: z.string().min(1, 'El apellido es requerido'),
  whatsapp: z.string().min(1, 'El número de WhatsApp es requerido'),
  email: z.string().email('Correo electrónico inválido'),
  pregunta: z.string().min(1, 'La pregunta es requerida'),
});

// HTML template for contact inquiry
function getContactInquiryHTML(data: {
  nombre: string;
  apellido: string;
  whatsapp: string;
  email: string;
  pregunta: string;
}): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nueva Consulta - Agendux</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background-color: #f0f9ff; padding: 30px; border-radius: 10px;">
    <h1 style="color: #2563eb; margin-bottom: 20px;">Nueva Consulta desde agendux.com</h1>

    <div style="background-color: #fff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2563eb;">
      <p style="margin: 8px 0;"><strong>Nombre:</strong> ${data.nombre} ${data.apellido}</p>
      <p style="margin: 8px 0;"><strong>WhatsApp:</strong> <a href="https://wa.me/${data.whatsapp.replace(/[^0-9]/g, '')}">${data.whatsapp}</a></p>
      <p style="margin: 8px 0;"><strong>Email:</strong> <a href="mailto:${data.email}">${data.email}</a></p>
    </div>

    <div style="background-color: #fff; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <p style="margin: 0 0 10px 0; font-weight: bold; color: #374151;">Pregunta:</p>
      <p style="margin: 0; white-space: pre-wrap;">${data.pregunta}</p>
    </div>

    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">

    <p style="color: #999; font-size: 12px; margin: 0;">
      Consulta recibida el ${new Date().toLocaleString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires' })}
    </p>
  </div>
</body>
</html>
`;
}

// POST /api/contact/inquiry
router.post('/inquiry', async (req: Request, res: Response) => {
  try {
    // Validate request body
    const validationResult = contactInquirySchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        message: 'Datos inválidos',
        errors: validationResult.error.errors,
      });
    }

    const data = validationResult.data;

    // Send email to info@agendux.com
    const emailSent = await sendEmail({
      to: 'info@agendux.com',
      subject: `Nueva consulta de ${data.nombre} ${data.apellido}`,
      html: getContactInquiryHTML(data),
    });

    if (!emailSent) {
      logger.error('Failed to send contact inquiry email', { data });
      return res.status(500).json({
        success: false,
        message: 'Error al enviar el mensaje. Por favor intentá de nuevo.',
      });
    }

    logger.info('Contact inquiry sent successfully', {
      nombre: data.nombre,
      apellido: data.apellido,
      email: data.email
    });

    return res.status(200).json({
      success: true,
      message: 'Consulta enviada exitosamente',
    });
  } catch (error) {
    logger.error('Error processing contact inquiry', { error });
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
    });
  }
});

export default router;
