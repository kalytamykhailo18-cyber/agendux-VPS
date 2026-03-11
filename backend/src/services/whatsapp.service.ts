import twilio from 'twilio';
import prisma from '../config/database';
import { logger, ServiceLogger } from '../utils/logger';
import { decrypt, hashForLookup } from '../utils/encryption';
import { emitToProfessional, emitToAdmins, WebSocketEvent } from '../config/socket.config';
import { updateCalendarEvent, deleteCalendarEvent } from './google-calendar.service';

type MessageTemplateType = 'BOOKING_CONFIRMATION' | 'REMINDER' | 'CANCELLATION';

// ============================================
// TWILIO CONTENT TEMPLATE SIDs (Approved by Meta)
// ============================================

const CONTENT_SIDS = {
  BOOKING_CONFIRMATION: 'HXe7be3e4acd05384a0fd6e3fb54813dab',
  REMINDER: 'HX260b563104019b45b8bca1318c689141',
  CANCELLATION: 'HXc37685eddfb69ca517755813446f4317',
  RECONFIRMATION: 'HX5dd7099f2136446cc3e05eb0d7c0ef09',
  DEMO: 'HX296e100ba8578ddf18811446db0d52fa'
};

// ============================================
// TWILIO CONFIGURATION (Fallback)
// ============================================

// Twilio client - initialized lazily to handle missing credentials gracefully
let twilioClient: twilio.Twilio | null = null;

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID || '';
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN || '';
const TWILIO_WHATSAPP_NUMBER = process.env.TWILIO_WHATSAPP_NUMBER || '';

// Check if Twilio is properly configured
const isTwilioConfigured = (): boolean => {
  return TWILIO_ACCOUNT_SID.startsWith('AC') && TWILIO_AUTH_TOKEN.length > 0;
};

// Get or create Twilio client
const getTwilioClient = (): twilio.Twilio | null => {
  if (!isTwilioConfigured()) {
    return null;
  }
  if (!twilioClient) {
    twilioClient = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
  }
  return twilioClient;
};

// ============================================
// MESSAGE TEMPLATES
// ============================================

// Default templates (used when professional hasn't customized)
// Include clear CONFIRM/CANCEL instructions for interactive responses
const DEFAULT_TEMPLATES = {
  BOOKING_CONFIRMATION: `Hola {patient_name}! Tu cita ha sido reservada exitosamente.

*Detalles de tu cita:*
Fecha: {date}
Hora: {time}
Profesional: {professional_name}
Dirección: {address}
Referencia: {booking_reference}

Recibirás un recordatorio antes de tu cita.`,

  REMINDER: `Hola {patient_name}! Te recordamos tu cita:

*Detalles:*
Fecha: {date}
Hora: {time}
Profesional: {professional_name}
Dirección: {address}

*Para confirmar tu asistencia responde:* SI o CONFIRMO
*Para cancelar tu cita responde:* NO o CANCELAR

Tu respuesta nos ayuda a gestionar mejor los turnos.`,

  CANCELLATION: `Hola {patient_name}, tu cita ha sido cancelada.

*Detalles de la cita cancelada:*
Fecha: {date}
Hora: {time}
Profesional: {professional_name}
Dirección: {address}
Referencia: {booking_reference}

Si deseas reprogramar, puedes hacerlo en línea en cualquier momento.`
};

// ============================================
// HELPER FUNCTIONS
// ============================================

interface MessageVariables {
  patient_name: string;
  professional_name: string;
  date: string;
  time: string;
  booking_reference: string;
  address: string;
}

function replaceVariables(template: string, variables: MessageVariables): string {
  let message = template;
  message = message.replace(/{patient_name}/g, variables.patient_name);
  message = message.replace(/{professional_name}/g, variables.professional_name);
  message = message.replace(/{date}/g, variables.date);
  message = message.replace(/{time}/g, variables.time);
  message = message.replace(/{booking_reference}/g, variables.booking_reference);
  message = message.replace(/{address}/g, variables.address);
  return message;
}

function formatDateForMessage(date: Date | string): string {
  // PostgreSQL DATE comes as midnight UTC (e.g. 2026-03-02T00:00:00.000Z)
  // Use UTC components to avoid timezone shift (UTC-3 would show previous day)
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const utcDate = new Date(Date.UTC(dateObj.getUTCFullYear(), dateObj.getUTCMonth(), dateObj.getUTCDate(), 12, 0, 0));
  return utcDate.toLocaleDateString('es-AR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC'
  });
}

function formatTimeForMessage(time: Date | string): string {
  // PostgreSQL TIME comes as UTC (e.g. 1970-01-01T14:30:00.000Z)
  // The stored time IS already the professional's local time, don't convert
  const timeObj = typeof time === 'string' ? new Date(`2000-01-01T${time}`) : time;
  const hours = timeObj.getUTCHours().toString().padStart(2, '0');
  const minutes = timeObj.getUTCMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

// Format WhatsApp number to E.164 format
function formatWhatsAppNumber(number: string): string {
  // Remove all non-digit characters except +
  let cleaned = number.replace(/[^\d+]/g, '');

  // Ensure it starts with +
  if (!cleaned.startsWith('+')) {
    cleaned = '+' + cleaned;
  }

  // Argentina mobile numbers: WhatsApp requires +549 prefix for mobile
  // If number starts with +54 but NOT +549, add the 9
  if (cleaned.startsWith('+54') && !cleaned.startsWith('+549')) {
    cleaned = '+549' + cleaned.slice(3);
  }

  return `whatsapp:${cleaned}`;
}

// ============================================
// SEND WHATSAPP MESSAGE (plain text - for responses)
// ============================================

interface SendMessageParams {
  to: string;
  message: string;
}

export async function sendWhatsAppMessage({ to, message }: SendMessageParams): Promise<boolean> {
  try {
    const client = getTwilioClient();
    if (!client) {
      logger.warn('Twilio not configured - skipping message');
      return false;
    }

    if (!TWILIO_WHATSAPP_NUMBER) {
      logger.error('TWILIO_WHATSAPP_NUMBER not configured');
      return false;
    }

    const formattedTo = formatWhatsAppNumber(to);

    await client.messages.create({
      body: message,
      from: `whatsapp:${TWILIO_WHATSAPP_NUMBER}`,
      to: formattedTo
    });

    ServiceLogger.whatsapp('twilio_message_sent', { to: formattedTo });
    return true;
  } catch (error) {
    logger.error('Error sending WhatsApp message', { error, to });
    return false;
  }
}

// ============================================
// SEND WHATSAPP TEMPLATE MESSAGE (Content API)
// ============================================

interface SendTemplateParams {
  to: string;
  contentSid: string;
  contentVariables: Record<string, string>;
}

export async function sendWhatsAppTemplate({ to, contentSid, contentVariables }: SendTemplateParams): Promise<boolean> {
  try {
    const client = getTwilioClient();
    if (!client) {
      logger.warn('Twilio not configured - skipping template message');
      return false;
    }

    if (!TWILIO_WHATSAPP_NUMBER) {
      logger.error('TWILIO_WHATSAPP_NUMBER not configured');
      return false;
    }

    const formattedTo = formatWhatsAppNumber(to);

    await client.messages.create({
      from: `whatsapp:${TWILIO_WHATSAPP_NUMBER}`,
      to: formattedTo,
      contentSid,
      contentVariables: JSON.stringify(contentVariables)
    });

    ServiceLogger.whatsapp('template_message_sent', { to: formattedTo, contentSid });
    return true;
  } catch (error) {
    logger.error('Error sending WhatsApp template', { error, to, contentSid });
    return false;
  }
}

// ============================================
// SEND BOOKING CONFIRMATION
// ============================================

interface BookingConfirmationParams {
  appointmentId: string;
}

export async function sendBookingConfirmation({ appointmentId }: BookingConfirmationParams): Promise<boolean> {
  try {
    // Get appointment with all related data
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        patient: true,
        professional: {
          include: {
            user: true,
            messageTemplates: {
              where: { type: 'BOOKING_CONFIRMATION', isActive: true }
            }
          }
        }
      }
    });

    if (!appointment) {
      logger.error('Appointment not found', { appointmentId });
      return false;
    }

    // SECURITY FIX: Decrypt patient whatsappNumber before sending
    const decryptedWhatsappNumber = decrypt(appointment.patient.whatsappNumber);

    // Build address string from professional's address fields
    const addressParts = [
      appointment.professional.addressStreet,
      appointment.professional.addressCity
    ].filter(Boolean);
    const address = addressParts.length > 0 ? addressParts.join(', ') : 'A confirmar';

    // Build cancel URL
    const frontendUrl = process.env.FRONTEND_URL || 'https://agendux.com';
    const cancelUrl = `${frontendUrl}/cancel?ref=${appointment.bookingReference}`;

    // Send via approved Content Template
    return await sendWhatsAppTemplate({
      to: decryptedWhatsappNumber,
      contentSid: CONTENT_SIDS.BOOKING_CONFIRMATION,
      contentVariables: {
        '1': `${appointment.patient.firstName} ${appointment.patient.lastName}`,
        '2': formatDateForMessage(appointment.date),
        '3': formatTimeForMessage(appointment.startTime),
        '4': `${appointment.professional.firstName} ${appointment.professional.lastName}`,
        '5': appointment.bookingReference,
        '6': address,
        '7': cancelUrl
      }
    });
  } catch (error) {
    logger.error('Error sending booking confirmation', { error, appointmentId });
    return false;
  }
}

// ============================================
// SEND REMINDER
// ============================================

interface SendReminderParams {
  appointmentId: string;
}

export async function sendReminder({ appointmentId }: SendReminderParams): Promise<boolean> {
  try {
    // Get appointment with all related data
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        patient: true,
        professional: {
          include: {
            user: true,
            messageTemplates: {
              where: { type: 'REMINDER', isActive: true }
            }
          }
        }
      }
    });

    if (!appointment) {
      logger.error('Appointment not found', { appointmentId });
      return false;
    }

    // Don't send reminders for cancelled/completed appointments
    if (appointment.status === 'CANCELLED' || appointment.status === 'COMPLETED' || appointment.status === 'NO_SHOW') {
      ServiceLogger.whatsapp('reminder_skipped', { appointmentId, status: appointment.status });
      return true;
    }

    // SECURITY FIX: Decrypt patient whatsappNumber before sending
    const decryptedWhatsappNumber = decrypt(appointment.patient.whatsappNumber);

    // Send via approved Content Template
    const sent = await sendWhatsAppTemplate({
      to: decryptedWhatsappNumber,
      contentSid: CONTENT_SIDS.REMINDER,
      contentVariables: {
        '1': `${appointment.patient.firstName} ${appointment.patient.lastName}`,
        '2': formatDateForMessage(appointment.date),
        '3': formatTimeForMessage(appointment.startTime),
        '4': `${appointment.professional.firstName} ${appointment.professional.lastName}`
      }
    });

    // Update appointment status to REMINDER_SENT if still pending
    if (sent && (appointment.status === 'PENDING' || appointment.status === 'PENDING_PAYMENT')) {
      await prisma.appointment.update({
        where: { id: appointmentId },
        data: { status: 'REMINDER_SENT' }
      });
    }

    return sent;
  } catch (error) {
    logger.error('Error sending reminder', { error, appointmentId });
    return false;
  }
}

// ============================================
// SEND CANCELLATION NOTIFICATION
// ============================================

interface SendCancellationParams {
  appointmentId: string;
}

export async function sendCancellationNotification({ appointmentId }: SendCancellationParams): Promise<boolean> {
  try {
    // Get appointment with all related data
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        patient: true,
        professional: {
          include: {
            user: true,
            messageTemplates: {
              where: { type: 'CANCELLATION', isActive: true }
            }
          }
        }
      }
    });

    if (!appointment) {
      logger.error('Appointment not found', { appointmentId });
      return false;
    }

    // SECURITY FIX: Decrypt patient whatsappNumber before sending
    const decryptedWhatsappNumber = decrypt(appointment.patient.whatsappNumber);

    const patientName = `${appointment.patient.firstName} ${appointment.patient.lastName}`;
    const professionalName = `${appointment.professional.firstName} ${appointment.professional.lastName}`;
    const date = formatDateForMessage(appointment.date);
    const time = formatTimeForMessage(appointment.startTime);

    // Send via approved Content Template, fallback to plain text
    const templateSent = await sendWhatsAppTemplate({
      to: decryptedWhatsappNumber,
      contentSid: CONTENT_SIDS.CANCELLATION,
      contentVariables: {
        '1': patientName,
        '2': date,
        '3': time,
        '4': professionalName,
        '5': appointment.bookingReference
      }
    });

    if (!templateSent) {
      logger.warn('Cancellation template failed, trying plain text', { appointmentId });
      await sendWhatsAppMessage({
        to: decryptedWhatsappNumber,
        message: `Hola ${patientName}, tu cita del ${date} a las ${time} con ${professionalName} ha sido cancelada. Código de reserva: ${appointment.bookingReference}. Si tenés consultas, contactá al profesional.`
      });
    }

    return true;
  } catch (error) {
    logger.error('Error sending cancellation notification', { error, appointmentId });
    return false;
  }
}

// ============================================
// SCHEDULE REMINDERS FOR APPOINTMENT
// ============================================

interface ScheduleRemindersParams {
  appointmentId: string;
  professionalId: string;
  appointmentDate: Date;
  appointmentTime: Date;
}

export async function scheduleRemindersForAppointment({
  appointmentId,
  professionalId,
  appointmentDate,
  appointmentTime
}: ScheduleRemindersParams): Promise<void> {
  try {
    // Get professional's reminder settings
    const reminderSettings = await prisma.reminderSetting.findMany({
      where: { professionalId, isActive: true },
      orderBy: { reminderNumber: 'asc' }
    });

    // If no settings, use default (24 hours before)
    if (reminderSettings.length === 0) {
      const appointmentDateTime = combineDateTime(appointmentDate, appointmentTime);
      const reminderTime = new Date(appointmentDateTime.getTime() - 24 * 60 * 60 * 1000);

      await prisma.scheduledReminder.create({
        data: {
          appointmentId,
          scheduledFor: reminderTime,
          status: 'pending'
        }
      });
      return;
    }

    // Get professional timezone
    const professional = await prisma.professional.findUnique({
      where: { id: professionalId },
      select: { timezone: true }
    });
    const timezone = professional?.timezone || 'America/Argentina/Buenos_Aires';

    // Create scheduled reminders based on settings
    for (const setting of reminderSettings) {
      const appointmentDateTime = combineDateTime(appointmentDate, appointmentTime);
      let reminderTime = new Date(appointmentDateTime.getTime() - setting.hoursBefore * 60 * 60 * 1000);

      // Handle night-before option for early morning appointments
      if (setting.enableNightBefore) {
        const appointmentHour = appointmentDateTime.getUTCHours();

        // If appointment is before 10 AM and reminder would be very early (before 7 AM)
        if (appointmentHour < 10 && reminderTime.getUTCHours() < 7) {
          // Send reminder the night before at 20:00 (8 PM)
          reminderTime = new Date(appointmentDateTime);
          reminderTime.setUTCDate(reminderTime.getUTCDate() - 1);
          reminderTime.setUTCHours(20, 0, 0, 0);
        }
      }

      // Only schedule if reminder time is in the future
      if (reminderTime > new Date()) {
        await prisma.scheduledReminder.create({
          data: {
            appointmentId,
            scheduledFor: reminderTime,
            status: 'pending'
          }
        });
      }
    }
  } catch (error) {
    logger.error('Error scheduling reminders', { error, appointmentId });
  }
}

function combineDateTime(date: Date, time: Date): Date {
  const combined = new Date(date);
  const timeDate = new Date(time);
  combined.setUTCHours(timeDate.getUTCHours(), timeDate.getUTCMinutes(), 0, 0);
  return combined;
}

// ============================================
// CANCEL SCHEDULED REMINDERS
// ============================================

export async function cancelScheduledReminders(appointmentId: string): Promise<void> {
  try {
    await prisma.scheduledReminder.updateMany({
      where: {
        appointmentId,
        status: 'pending'
      },
      data: {
        status: 'cancelled'
      }
    });
  } catch (error) {
    logger.error('Error cancelling scheduled reminders', { error, appointmentId });
  }
}

// ============================================
// PROCESS INCOMING WHATSAPP MESSAGE
// ============================================

interface IncomingMessageParams {
  from: string; // WhatsApp number
  body: string; // Message content
}

interface ProcessMessageResult {
  success: boolean;
  action?: 'CONFIRMED' | 'CANCELLED' | 'UNKNOWN';
  appointmentId?: string;
  message?: string;
}

export async function processIncomingMessage({ from, body }: IncomingMessageParams): Promise<ProcessMessageResult> {
  try {
    // Clean the phone number (remove whatsapp: prefix if present)
    const cleanNumber = from.replace('whatsapp:', '').replace(/[^\d+]/g, '');

    // SECURITY FIX: WhatsApp numbers are encrypted in DB, so we can't use 'contains'
    // Instead, search by hash which is indexed and searchable
    const phoneHash = hashForLookup(cleanNumber);

    // Argentina mobile numbers: Twilio sends +549XXXX but we store +54XXXX
    // Try alternate format if primary lookup fails
    let alternateHash: string | null = null;
    if (cleanNumber.startsWith('+549')) {
      // Remove the 9: +5492613630080 → +542613630080
      alternateHash = hashForLookup('+54' + cleanNumber.slice(4));
    } else if (cleanNumber.startsWith('+54') && !cleanNumber.startsWith('+549')) {
      // Add the 9: +542613630080 → +5492613630080
      alternateHash = hashForLookup('+549' + cleanNumber.slice(3));
    }

    // Use today at midnight UTC for date filter to avoid excluding same-day appointments
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const appointmentFilter = {
      where: {
        status: {
          in: ['PENDING', 'REMINDER_SENT', 'PENDING_PAYMENT'] as string[]
        },
        date: {
          gte: today
        }
      },
      orderBy: { date: 'asc' as const },
      take: 1,
      include: {
        professional: true
      }
    };

    // Find the patient by WhatsApp number hash (try primary, then alternate)
    let patient = await prisma.patient.findFirst({
      where: {
        whatsappNumberHash: phoneHash
      },
      include: {
        appointments: appointmentFilter
      }
    });

    // If not found, try alternate Argentine format
    if ((!patient || patient.appointments.length === 0) && alternateHash) {
      patient = await prisma.patient.findFirst({
        where: {
          whatsappNumberHash: alternateHash
        },
        include: {
          appointments: appointmentFilter
        }
      });
    }

    if (!patient || patient.appointments.length === 0) {
      // Send a helpful reply so the patient gets feedback
      await sendWhatsAppMessage({
        to: cleanNumber,
        message: 'No encontramos una cita pendiente asociada a este número. Si creés que es un error, contactá directamente al profesional.'
      });
      return {
        success: false,
        action: 'UNKNOWN',
        message: 'No se encontró una cita pendiente para este número.'
      };
    }

    const appointment = patient.appointments[0];
    const normalizedBody = body.toLowerCase().trim();

    // SECURITY FIX: Decrypt patient whatsappNumber for sending responses
    const decryptedWhatsappNumber = decrypt(patient.whatsappNumber);

    // Check for confirmation keywords
    const confirmKeywords = ['si', 'sí', 'confirmo', 'confirmar', 'ok', 'yes', 'confirm', '1'];
    const cancelKeywords = ['no', 'cancelo', 'cancelar', 'cancel', '2'];

    if (confirmKeywords.some(keyword => normalizedBody.includes(keyword))) {
      // Confirm the appointment
      const confirmedAppointment = await prisma.appointment.update({
        where: { id: appointment.id },
        data: { status: 'CONFIRMED' }
      });

      // Notify professional dashboard in real-time
      emitToProfessional(appointment.professionalId, WebSocketEvent.APPOINTMENT_CONFIRMED, {
        appointmentId: confirmedAppointment.id,
        bookingReference: confirmedAppointment.bookingReference,
        status: confirmedAppointment.status,
        confirmedVia: 'whatsapp'
      });

      // Update Google Calendar event color to green (CONFIRMED)
      if (appointment.googleEventId) {
        updateCalendarEvent({
          professionalId: appointment.professionalId,
          googleEventId: appointment.googleEventId,
          status: 'CONFIRMED'
        }).catch(err => {
          logger.error('Google Calendar color update error (non-blocking):', err);
        });
      }

      // Send reconfirmation response - try template first, fallback to plain text
      const reconfirmSent = await sendWhatsAppTemplate({
        to: decryptedWhatsappNumber,
        contentSid: CONTENT_SIDS.RECONFIRMATION,
        contentVariables: {
          '1': `${patient.firstName} ${patient.lastName}`,
          '2': formatDateForMessage(appointment.date),
          '3': formatTimeForMessage(appointment.startTime),
          '4': `${appointment.professional.firstName} ${appointment.professional.lastName}`
        }
      });

      // Fallback to plain text if template fails
      if (!reconfirmSent) {
        await sendWhatsAppMessage({
          to: decryptedWhatsappNumber,
          message: `✅ Tu cita del ${formatDateForMessage(appointment.date)} a las ${formatTimeForMessage(appointment.startTime)} con ${appointment.professional.firstName} ${appointment.professional.lastName} ha sido confirmada. ¡Te esperamos!`
        });
      }

      return {
        success: true,
        action: 'CONFIRMED',
        appointmentId: appointment.id
      };
    }

    if (cancelKeywords.some(keyword => normalizedBody.includes(keyword))) {
      // Cancel the appointment
      const updatedAppointment = await prisma.appointment.update({
        where: { id: appointment.id },
        data: {
          status: 'CANCELLED',
          cancelledAt: new Date(),
          cancelledBy: 'patient',
          cancellationReason: 'Cancelado via WhatsApp'
        }
      });

      // Cancel any scheduled reminders
      await cancelScheduledReminders(appointment.id);

      // Emit WebSocket event to professional dashboard
      emitToProfessional(appointment.professionalId, WebSocketEvent.APPOINTMENT_CANCELLED, {
        appointmentId: updatedAppointment.id,
        bookingReference: updatedAppointment.bookingReference,
        status: updatedAppointment.status,
        cancelledAt: updatedAppointment.cancelledAt,
        cancellationReason: updatedAppointment.cancellationReason,
        cancelledBy: updatedAppointment.cancelledBy
      });

      // Emit WebSocket event to admin dashboard
      emitToAdmins(WebSocketEvent.APPOINTMENT_CANCELLED, {
        professionalId: appointment.professionalId,
        appointmentId: updatedAppointment.id
      });

      // Update Google Calendar event to red (CANCELLED) instead of deleting (non-blocking)
      if (appointment.googleEventId) {
        updateCalendarEvent({
          professionalId: appointment.professionalId,
          googleEventId: appointment.googleEventId,
          status: 'CANCELLED'
        }).catch(err => {
          logger.error('Google Calendar cancel update error (non-blocking):', err);
        });
      }

      // Send cancellation response
      await sendWhatsAppMessage({
        to: decryptedWhatsappNumber,
        message: `Tu cita del ${formatDateForMessage(appointment.date)} ha sido cancelada. Si deseas reprogramar, puedes hacerlo en línea.`
      });

      return {
        success: true,
        action: 'CANCELLED',
        appointmentId: appointment.id
      };
    }

    // Unknown response
    await sendWhatsAppMessage({
      to: decryptedWhatsappNumber,
      message: 'No entendí tu respuesta. Por favor responde "SI" para confirmar o "NO" para cancelar tu cita.'
    });

    return {
      success: false,
      action: 'UNKNOWN',
      message: 'Respuesta no reconocida'
    };
  } catch (error) {
    logger.error('Error processing incoming message', { error });
    return {
      success: false,
      message: 'Error procesando mensaje'
    };
  }
}

// ============================================
// GET PROFESSIONAL'S MESSAGE TEMPLATES
// ============================================

export async function getMessageTemplates(professionalId: string) {
  const templates = await prisma.messageTemplate.findMany({
    where: { professionalId },
    orderBy: { type: 'asc' }
  });

  // Return templates with defaults filled in
  const templateTypes: MessageTemplateType[] = ['BOOKING_CONFIRMATION', 'REMINDER', 'CANCELLATION'];

  return templateTypes.map(type => {
    const existing = templates.find(t => t.type === type);
    return {
      type,
      messageText: existing?.messageText || DEFAULT_TEMPLATES[type],
      isCustom: !!existing,
      isActive: existing?.isActive ?? true
    };
  });
}

// ============================================
// UPDATE MESSAGE TEMPLATE
// ============================================

interface UpdateTemplateParams {
  professionalId: string;
  type: MessageTemplateType;
  messageText: string;
}

export async function updateMessageTemplate({ professionalId, type, messageText }: UpdateTemplateParams) {
  return prisma.messageTemplate.upsert({
    where: {
      professionalId_type: { professionalId, type }
    },
    update: {
      messageText,
      isActive: true
    },
    create: {
      professionalId,
      type,
      messageText,
      isActive: true
    }
  });
}

// ============================================
// GET REMINDER SETTINGS
// ============================================

export async function getReminderSettings(professionalId: string) {
  return prisma.reminderSetting.findMany({
    where: { professionalId },
    orderBy: { reminderNumber: 'asc' }
  });
}

// ============================================
// UPDATE REMINDER SETTINGS
// ============================================

interface ReminderSettingInput {
  reminderNumber: number;
  hoursBefore: number;
  enableNightBefore: boolean;
  isActive: boolean;
}

export async function updateReminderSettings(
  professionalId: string,
  settings: ReminderSettingInput[]
) {
  // Delete existing settings
  await prisma.reminderSetting.deleteMany({
    where: { professionalId }
  });

  // Create new settings
  if (settings.length > 0) {
    await prisma.reminderSetting.createMany({
      data: settings.map(s => ({
        professionalId,
        reminderNumber: s.reminderNumber,
        hoursBefore: s.hoursBefore,
        enableNightBefore: s.enableNightBefore,
        isActive: s.isActive
      }))
    });
  }

  return prisma.reminderSetting.findMany({
    where: { professionalId },
    orderBy: { reminderNumber: 'asc' }
  });
}
