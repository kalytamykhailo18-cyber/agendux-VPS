import { Router } from 'express';
import { sendWhatsAppDemo } from '../controllers/demo.controller';
import { validateBody } from '../middleware/validator.middleware';
import { z } from 'zod';

const router = Router();

// Validation schema for WhatsApp demo
const whatsAppDemoSchema = z.object({
  countryCode: z.string().regex(/^\+\d{1,4}$/, 'Código de país inválido'),
  phoneNumber: z.string().regex(/^\d{6,15}$/, 'Número de teléfono inválido (6-15 dígitos)')
});

// POST /api/demo/whatsapp - Send WhatsApp demo message
router.post(
  '/whatsapp',
  validateBody(whatsAppDemoSchema),
  sendWhatsAppDemo
);

export default router;
