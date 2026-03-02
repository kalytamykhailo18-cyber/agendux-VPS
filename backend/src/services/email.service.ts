import { Resend } from 'resend';
import prisma from '../config/database';
import { logger, ServiceLogger } from '../utils/logger';
import { decrypt } from '../utils/encryption';

// Initialize Resend client
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const EMAIL_FROM = process.env.EMAIL_FROM || 'noreply@example.com';

// ============================================
// EMAIL TEMPLATES
// ============================================

interface EmailVariables {
  patient_name: string;
  professional_name: string;
  date: string;
  time: string;
  booking_reference: string;
  cancel_url?: string;
}

function getBookingConfirmationHTML(variables: EmailVariables): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirmacion de Cita</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background-color: #f8f9fa; padding: 30px; border-radius: 10px;">
    <h1 style="color: #2563eb; margin-bottom: 20px;">Cita Confirmada</h1>

    <p>Hola <strong>${variables.patient_name}</strong>,</p>

    <p>Tu cita ha sido reservada exitosamente.</p>

    <div style="background-color: #fff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2563eb;">
      <p style="margin: 5px 0;"><strong>Fecha:</strong> ${variables.date}</p>
      <p style="margin: 5px 0;"><strong>Hora:</strong> ${variables.time}</p>
      <p style="margin: 5px 0;"><strong>Profesional:</strong> ${variables.professional_name}</p>
      <p style="margin: 5px 0;"><strong>Referencia:</strong> <code style="background: #e5e7eb; padding: 2px 6px; border-radius: 4px;">${variables.booking_reference}</code></p>
    </div>

    <p style="color: #666; font-size: 14px;">
      Guarda tu codigo de referencia. Lo necesitaras si deseas modificar o cancelar tu cita.
    </p>

    ${variables.cancel_url ? `
    <p style="margin-top: 20px;">
      <a href="${variables.cancel_url}" style="color: #dc2626; text-decoration: underline;">Cancelar esta cita</a>
    </p>
    ` : ''}

    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">

    <p style="color: #999; font-size: 12px; margin: 0;">
      Este es un mensaje automatico. Por favor no respondas a este email.
    </p>
  </div>
</body>
</html>
`;
}

function getReminderHTML(variables: EmailVariables): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Recordatorio de Cita</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background-color: #fef3c7; padding: 30px; border-radius: 10px;">
    <h1 style="color: #d97706; margin-bottom: 20px;">Recordatorio de Cita</h1>

    <p>Hola <strong>${variables.patient_name}</strong>,</p>

    <p>Te recordamos que tienes una cita proxima:</p>

    <div style="background-color: #fff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #d97706;">
      <p style="margin: 5px 0;"><strong>Fecha:</strong> ${variables.date}</p>
      <p style="margin: 5px 0;"><strong>Hora:</strong> ${variables.time}</p>
      <p style="margin: 5px 0;"><strong>Profesional:</strong> ${variables.professional_name}</p>
      <p style="margin: 5px 0;"><strong>Referencia:</strong> <code style="background: #e5e7eb; padding: 2px 6px; border-radius: 4px;">${variables.booking_reference}</code></p>
    </div>

    <p style="color: #666; font-size: 14px;">
      Por favor confirma tu asistencia o cancela si no podras asistir.
    </p>

    ${variables.cancel_url ? `
    <p style="margin-top: 20px;">
      <a href="${variables.cancel_url}" style="color: #dc2626; text-decoration: underline;">Cancelar esta cita</a>
    </p>
    ` : ''}

    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">

    <p style="color: #999; font-size: 12px; margin: 0;">
      Este es un mensaje automatico. Por favor no respondas a este email.
    </p>
  </div>
</body>
</html>
`;
}

function getCancellationHTML(variables: EmailVariables): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Cita Cancelada</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background-color: #fef2f2; padding: 30px; border-radius: 10px;">
    <h1 style="color: #dc2626; margin-bottom: 20px;">Cita Cancelada</h1>

    <p>Hola <strong>${variables.patient_name}</strong>,</p>

    <p>Tu cita ha sido cancelada.</p>

    <div style="background-color: #fff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
      <p style="margin: 5px 0;"><strong>Fecha:</strong> ${variables.date}</p>
      <p style="margin: 5px 0;"><strong>Hora:</strong> ${variables.time}</p>
      <p style="margin: 5px 0;"><strong>Profesional:</strong> ${variables.professional_name}</p>
      <p style="margin: 5px 0;"><strong>Referencia:</strong> <code style="background: #e5e7eb; padding: 2px 6px; border-radius: 4px;">${variables.booking_reference}</code></p>
    </div>

    <p style="color: #666; font-size: 14px;">
      Si deseas reprogramar tu cita, puedes hacerlo en linea en cualquier momento.
    </p>

    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">

    <p style="color: #999; font-size: 12px; margin: 0;">
      Este es un mensaje automatico. Por favor no respondas a este email.
    </p>
  </div>
</body>
</html>
`;
}

function getPaymentFailedHTML(professionalName: string, planName: string, renewalUrl: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Problema con el pago de tu suscripcion</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background-color: #fef2f2; padding: 30px; border-radius: 10px;">
    <h1 style="color: #dc2626; margin-bottom: 20px;">Problema con tu suscripcion</h1>

    <p>Hola <strong>${professionalName}</strong>,</p>

    <p>No pudimos procesar el pago de tu suscripcion <strong>${planName}</strong>. Como resultado, tu pagina de turnos ha sido desactivada temporalmente.</p>

    <div style="background-color: #fff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
      <p style="margin: 5px 0;"><strong>Estado:</strong> Pago fallido</p>
      <p style="margin: 5px 0;"><strong>Plan:</strong> ${planName}</p>
    </div>

    <p>Para reactivar tu cuenta y volver a recibir turnos, podes renovar tu suscripcion haciendo click en el boton de abajo:</p>

    <p style="text-align: center; margin: 30px 0;">
      <a href="${renewalUrl}" style="background-color: #dc2626; color: #fff; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Renovar suscripcion</a>
    </p>

    <p style="color: #666; font-size: 14px;">
      Si tenes algun problema o preguntas, no dudes en contactarnos.
    </p>

    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">

    <p style="color: #999; font-size: 12px; margin: 0;">
      Este es un mensaje automatico de Agendux. Por favor no respondas a este email.
    </p>
  </div>
</body>
</html>
`;
}

function getRenewalLinkHTML(professionalName: string, planName: string, billingPeriod: string, renewalUrl: string): string {
  const periodLabel = billingPeriod === 'ANNUAL' ? 'anual' : 'mensual';
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Tu suscripcion esta por vencer</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background-color: #fef3c7; padding: 30px; border-radius: 10px;">
    <h1 style="color: #d97706; margin-bottom: 20px;">Tu suscripcion esta por vencer</h1>

    <p>Hola <strong>${professionalName}</strong>,</p>

    <p>Tu suscripcion <strong>${planName}</strong> (${periodLabel}) esta proxima a vencer. Para continuar recibiendo turnos sin interrupciones, renova tu suscripcion antes de que expire.</p>

    <div style="background-color: #fff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #d97706;">
      <p style="margin: 5px 0;"><strong>Plan:</strong> ${planName}</p>
      <p style="margin: 5px 0;"><strong>Periodo:</strong> ${periodLabel}</p>
    </div>

    <p style="text-align: center; margin: 30px 0;">
      <a href="${renewalUrl}" style="background-color: #d97706; color: #fff; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Renovar ahora</a>
    </p>

    <p style="color: #666; font-size: 14px;">
      Si no renovas tu suscripcion, tu pagina de turnos sera desactivada automaticamente.
    </p>

    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">

    <p style="color: #999; font-size: 12px; margin: 0;">
      Este es un mensaje automatico de Agendux. Por favor no respondas a este email.
    </p>
  </div>
</body>
</html>
`;
}

function getSubscriptionCancelledHTML(professionalName: string, planName: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Tu suscripcion fue cancelada</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background-color: #f3f4f6; padding: 30px; border-radius: 10px;">
    <h1 style="color: #374151; margin-bottom: 20px;">Suscripcion cancelada</h1>

    <p>Hola <strong>${professionalName}</strong>,</p>

    <p>Tu suscripcion <strong>${planName}</strong> ha sido cancelada debido a falta de pago. Tu pagina de turnos permanece desactivada.</p>

    <div style="background-color: #fff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #374151;">
      <p style="margin: 5px 0;"><strong>Estado:</strong> Cancelada</p>
      <p style="margin: 5px 0;"><strong>Plan:</strong> ${planName}</p>
    </div>

    <p>Si deseas volver a usar Agendux, podes suscribirte nuevamente desde tu panel de profesional.</p>

    <p style="color: #666; font-size: 14px;">
      Si crees que esto es un error o necesitas ayuda, contactanos.
    </p>

    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">

    <p style="color: #999; font-size: 12px; margin: 0;">
      Este es un mensaje automatico de Agendux. Por favor no respondas a este email.
    </p>
  </div>
</body>
</html>
`;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function formatDateForEmail(date: Date | string): string {
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

function formatTimeForEmail(time: Date | string): string {
  // PostgreSQL TIME comes as UTC (e.g. 1970-01-01T14:30:00.000Z)
  // The stored time IS already the professional's local time, don't convert
  const timeObj = typeof time === 'string' ? new Date(`2000-01-01T${time}`) : time;
  const hours = timeObj.getUTCHours().toString().padStart(2, '0');
  const minutes = timeObj.getUTCMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

// ============================================
// SEND EMAIL FUNCTION
// ============================================

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
}

export async function sendEmail({ to, subject, html, replyTo }: SendEmailParams): Promise<boolean> {
  try {
    if (!resend) {
      logger.info('Email service not configured (RESEND_API_KEY missing). Skipping email.');
      return true; // Return true to not block the flow
    }

    await resend.emails.send({
      from: EMAIL_FROM,
      to,
      subject,
      html,
      ...(replyTo ? { reply_to: replyTo } : {})
    });

    logger.info(`Email sent to ${to}: ${subject}`);
    return true;
  } catch (error) {
    logger.error('Error sending email', { error });
    return false;
  }
}

// ============================================
// SEND BOOKING CONFIRMATION EMAIL
// ============================================

interface BookingConfirmationParams {
  appointmentId: string;
}

export async function sendBookingConfirmationEmail({ appointmentId }: BookingConfirmationParams): Promise<boolean> {
  try {
    // Get appointment with all related data
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        patient: true,
        professional: true
      }
    });

    if (!appointment) {
      logger.error('Appointment not found', { appointmentId });
      return false;
    }

    // SECURITY FIX: Decrypt patient email before sending
    const decryptedEmail = decrypt(appointment.patient.email);

    // Prepare variables
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const variables: EmailVariables = {
      patient_name: `${appointment.patient.firstName} ${appointment.patient.lastName}`,
      professional_name: `${appointment.professional.firstName} ${appointment.professional.lastName}`,
      date: formatDateForEmail(appointment.date),
      time: formatTimeForEmail(appointment.startTime),
      booking_reference: appointment.bookingReference,
      cancel_url: `${frontendUrl}/cancel?ref=${appointment.bookingReference}`
    };

    // Send email
    return await sendEmail({
      to: decryptedEmail,
      subject: `Confirmacion de cita - ${variables.date}`,
      html: getBookingConfirmationHTML(variables)
    });
  } catch (error) {
    logger.error('Error sending booking confirmation email', { error, appointmentId });
    return false;
  }
}

// ============================================
// SEND REMINDER EMAIL
// ============================================

interface SendReminderEmailParams {
  appointmentId: string;
}

export async function sendReminderEmail({ appointmentId }: SendReminderEmailParams): Promise<boolean> {
  try {
    // Get appointment with all related data
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        patient: true,
        professional: true
      }
    });

    if (!appointment) {
      logger.error('Appointment not found', { appointmentId });
      return false;
    }

    // Don't send reminders for cancelled/completed appointments
    if (appointment.status === 'CANCELLED' || appointment.status === 'COMPLETED' || appointment.status === 'NO_SHOW') {
      logger.info('Skipping reminder email for non-active appointment:', appointmentId);
      return true;
    }

    // SECURITY FIX: Decrypt patient email before sending
    const decryptedEmail = decrypt(appointment.patient.email);

    // Prepare variables
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const variables: EmailVariables = {
      patient_name: `${appointment.patient.firstName} ${appointment.patient.lastName}`,
      professional_name: `${appointment.professional.firstName} ${appointment.professional.lastName}`,
      date: formatDateForEmail(appointment.date),
      time: formatTimeForEmail(appointment.startTime),
      booking_reference: appointment.bookingReference,
      cancel_url: `${frontendUrl}/cancel?ref=${appointment.bookingReference}`
    };

    // Send email
    return await sendEmail({
      to: decryptedEmail,
      subject: `Recordatorio de cita - ${variables.date}`,
      html: getReminderHTML(variables)
    });
  } catch (error) {
    logger.error('Error sending reminder email', { error, appointmentId });
    return false;
  }
}

// ============================================
// SEND CANCELLATION EMAIL
// ============================================

interface SendCancellationEmailParams {
  appointmentId: string;
}

export async function sendCancellationEmail({ appointmentId }: SendCancellationEmailParams): Promise<boolean> {
  try {
    // Get appointment with all related data
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        patient: true,
        professional: true
      }
    });

    if (!appointment) {
      logger.error('Appointment not found', { appointmentId });
      return false;
    }

    // SECURITY FIX: Decrypt patient email before sending
    const decryptedEmail = decrypt(appointment.patient.email);

    // Prepare variables
    const variables: EmailVariables = {
      patient_name: `${appointment.patient.firstName} ${appointment.patient.lastName}`,
      professional_name: `${appointment.professional.firstName} ${appointment.professional.lastName}`,
      date: formatDateForEmail(appointment.date),
      time: formatTimeForEmail(appointment.startTime),
      booking_reference: appointment.bookingReference
    };

    // Send email
    return await sendEmail({
      to: decryptedEmail,
      subject: `Cita cancelada - ${variables.booking_reference}`,
      html: getCancellationHTML(variables)
    });
  } catch (error) {
    logger.error('Error sending cancellation email', { error, appointmentId });
    return false;
  }
}

// ============================================
// SUBSCRIPTION NOTIFICATION EMAILS (to professionals)
// ============================================

export async function sendPaymentFailedEmail(
  professionalEmail: string,
  professionalName: string,
  planName: string,
  renewalUrl: string
): Promise<boolean> {
  try {
    return await sendEmail({
      to: professionalEmail,
      subject: 'Problema con el pago de tu suscripcion Agendux',
      html: getPaymentFailedHTML(professionalName, planName, renewalUrl)
    });
  } catch (error) {
    logger.error('Error sending payment failed email', { error, professionalEmail });
    return false;
  }
}

export async function sendRenewalLinkEmail(
  professionalEmail: string,
  professionalName: string,
  planName: string,
  billingPeriod: string,
  renewalUrl: string
): Promise<boolean> {
  try {
    return await sendEmail({
      to: professionalEmail,
      subject: 'Tu suscripcion Agendux esta por vencer - Renova ahora',
      html: getRenewalLinkHTML(professionalName, planName, billingPeriod, renewalUrl)
    });
  } catch (error) {
    logger.error('Error sending renewal link email', { error, professionalEmail });
    return false;
  }
}

export async function sendSubscriptionCancelledEmail(
  professionalEmail: string,
  professionalName: string,
  planName: string
): Promise<boolean> {
  try {
    return await sendEmail({
      to: professionalEmail,
      subject: 'Tu suscripcion Agendux ha sido cancelada',
      html: getSubscriptionCancelledHTML(professionalName, planName)
    });
  } catch (error) {
    logger.error('Error sending subscription cancelled email', { error, professionalEmail });
    return false;
  }
}
