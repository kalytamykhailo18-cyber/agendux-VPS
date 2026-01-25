import { MercadoPagoConfig, Preference, Payment, PreApproval } from 'mercadopago';
import prisma from '../config/database';
import { logger, ServiceLogger } from '../utils/logger';

type BillingPeriod = 'MONTHLY' | 'ANNUAL';

// Initialize Mercado Pago client
const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN || ''
});

const preferenceClient = new Preference(client);
const paymentClient = new Payment(client);
const preapprovalClient = new PreApproval(client);

// URLs for redirects
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';

// ============================================
// SUBSCRIPTION PAYMENT - RECURRING (AUTOMATIC)
// ============================================

interface CreateSubscriptionPaymentParams {
  professionalId: string;
  planId: string;
  billingPeriod: BillingPeriod;
  email: string;
  name: string;
}

/**
 * Create a recurring subscription using MercadoPago Preapproval (Subscription) API
 * This enables automatic monthly/annual charges without manual payment
 *
 * IMPORTANT: Before using this in production:
 * 1. Configure your MercadoPago account to accept recurring payments
 * 2. Create subscription plans in your MercadoPago dashboard
 * 3. Enable webhook notifications for preapproval events
 * 4. Test thoroughly in sandbox mode first
 */
export async function createRecurringSubscription({
  professionalId,
  planId,
  billingPeriod,
  email,
  name
}: CreateSubscriptionPaymentParams) {
  // Get plan details
  const plan = await prisma.subscriptionPlan.findUnique({
    where: { id: planId }
  });

  if (!plan || !plan.isActive) {
    throw new Error('Plan no encontrado o no activo');
  }

  const amount = billingPeriod === 'MONTHLY'
    ? Number(plan.monthlyPrice)
    : Number(plan.annualPrice);

  const periodLabel = billingPeriod === 'MONTHLY' ? 'Mensual' : 'Anual';

  // Calculate billing dates
  // Set start date to 2 days from now to avoid timezone issues with MercadoPago
  // MercadoPago uses Argentina timezone (UTC-3), so we add buffer days
  const startDate = new Date();
  startDate.setDate(startDate.getDate() + 2);
  startDate.setUTCHours(15, 0, 0, 0); // 15:00 UTC = 12:00 Argentina time
  const endDate = new Date(startDate);
  if (billingPeriod === 'MONTHLY') {
    endDate.setMonth(endDate.getMonth() + 1);
  } else {
    endDate.setFullYear(endDate.getFullYear() + 1);
  }

  try {
    // Create recurring subscription (preapproval)
    const preapproval = await preapprovalClient.create({
      body: {
        reason: `Suscripción ${plan.name} - ${periodLabel}`,
        payer_email: email,
        back_url: `${FRONTEND_URL}/professional/subscription?status=success`,
        auto_recurring: {
          frequency: billingPeriod === 'MONTHLY' ? 1 : 12,
          frequency_type: 'months',
          transaction_amount: amount,
          currency_id: 'ARS',
          start_date: startDate.toISOString(),
          end_date: undefined // Subscription continues until cancelled
        },
        external_reference: JSON.stringify({
          type: 'subscription',
          professionalId,
          planId,
          billingPeriod
        }),
        status: 'pending'
      }
    });

    ServiceLogger.mercadopago('recurring_subscription_created', {
      preapprovalId: preapproval.id,
      professionalId,
      planId,
      billingPeriod,
      amount
    });

    return {
      subscriptionId: preapproval.id,
      initPoint: preapproval.init_point,
      sandboxInitPoint: (preapproval as any).sandbox_init_point,
      status: preapproval.status
    };
  } catch (error: any) {
    logger.error('[MercadoPago] Failed to create recurring subscription:', error);
    throw new Error(`Error al crear suscripción recurrente: ${error.message}`);
  }
}

/**
 * LEGACY: One-time payment preference for subscriptions
 * Used for manual renewal flow (not automatic recurring)
 * Keep this for backwards compatibility or manual payments
 */
export async function createSubscriptionPreference({
  professionalId,
  planId,
  billingPeriod,
  email,
  name
}: CreateSubscriptionPaymentParams) {
  // Get plan details
  const plan = await prisma.subscriptionPlan.findUnique({
    where: { id: planId }
  });

  if (!plan || !plan.isActive) {
    throw new Error('Plan no encontrado o no activo');
  }

  const amount = billingPeriod === 'MONTHLY'
    ? Number(plan.monthlyPrice)
    : Number(plan.annualPrice);

  const periodLabel = billingPeriod === 'MONTHLY' ? 'Mensual' : 'Anual';

  // Create preference (one-time payment)
  const preference = await preferenceClient.create({
    body: {
      items: [
        {
          id: planId,
          title: `Suscripción ${plan.name} - ${periodLabel}`,
          description: plan.description || `Plan ${plan.name}`,
          quantity: 1,
          unit_price: amount,
          currency_id: 'ARS'
        }
      ],
      payer: {
        email,
        name
      },
      back_urls: {
        success: `${FRONTEND_URL}/professional/subscription?status=success`,
        failure: `${FRONTEND_URL}/professional/subscription?status=failure`,
        pending: `${FRONTEND_URL}/professional/subscription?status=pending`
      },
      auto_return: 'approved',
      external_reference: JSON.stringify({
        type: 'subscription',
        professionalId,
        planId,
        billingPeriod
      }),
      notification_url: `${BACKEND_URL}/api/webhooks/mercadopago`,
      statement_descriptor: 'Plataforma Citas'
    }
  });

  return {
    preferenceId: preference.id,
    initPoint: preference.init_point,
    sandboxInitPoint: preference.sandbox_init_point
  };
}

// ============================================
// DEPOSIT PAYMENT
// ============================================

interface CreateDepositPaymentParams {
  appointmentId: string;
  professionalId: string;
  patientEmail: string;
  patientName: string;
  amount: number;
  bookingReference: string;
}

export async function createDepositPreference({
  appointmentId,
  professionalId,
  patientEmail,
  patientName,
  amount,
  bookingReference
}: CreateDepositPaymentParams) {
  // Get professional details for payment description
  const professional = await prisma.professional.findUnique({
    where: { id: professionalId },
    select: { firstName: true, lastName: true }
  });

  if (!professional) {
    throw new Error('Profesional no encontrado');
  }

  // Create preference
  const preference = await preferenceClient.create({
    body: {
      items: [
        {
          id: appointmentId,
          title: `Seña para cita - ${professional.firstName} ${professional.lastName}`,
          description: `Reserva ${bookingReference}`,
          quantity: 1,
          unit_price: amount,
          currency_id: 'ARS'
        }
      ],
      payer: {
        email: patientEmail,
        name: patientName
      },
      back_urls: {
        success: `${FRONTEND_URL}/booking/confirmation?ref=${bookingReference}&payment=success`,
        failure: `${FRONTEND_URL}/booking/confirmation?ref=${bookingReference}&payment=failure`,
        pending: `${FRONTEND_URL}/booking/confirmation?ref=${bookingReference}&payment=pending`
      },
      auto_return: 'approved',
      external_reference: JSON.stringify({
        type: 'deposit',
        appointmentId,
        professionalId,
        bookingReference
      }),
      notification_url: `${BACKEND_URL}/api/webhooks/mercadopago`,
      statement_descriptor: 'Seña Cita'
    }
  });

  return {
    preferenceId: preference.id,
    initPoint: preference.init_point,
    sandboxInitPoint: preference.sandbox_init_point
  };
}

// ============================================
// WEBHOOK HANDLER
// ============================================

interface WebhookData {
  action: string;
  data: {
    id: string;
  };
  type: string;
}

export async function handleWebhook(data: WebhookData, headers: Record<string, string>) {
  // Handle both payment and preapproval (subscription) webhooks
  if (data.type === 'subscription_preapproval') {
    return await handlePreapprovalWebhook(data, headers);
  }

  // Only process payment webhooks from this point
  if (data.type !== 'payment') {
    ServiceLogger.mercadopago('webhook_ignored', {
      type: data.type,
      reason: 'non-payment webhook'
    });
    return { success: true, message: 'Ignored non-payment webhook' };
  }

  const paymentId = data.data.id?.toString();
  const requestId = headers['x-request-id'] || '';

  if (!paymentId || !requestId) {
    logger.error('[MercadoPago Webhook] Missing required identifiers', {
      hasPaymentId: !!paymentId,
      hasRequestId: !!requestId
    });
    return { success: false, error: 'Missing required identifiers' };
  }

  try {
    // IDEMPOTENCY CHECK: Check if we've already processed this exact webhook
    const existingEvent = await prisma.webhookEvent.findUnique({
      where: {
        paymentId_requestId: {
          paymentId,
          requestId
        }
      }
    });

    if (existingEvent) {
      console.log(`[MercadoPago Webhook] Duplicate webhook detected - already processed:`, {
        paymentId,
        requestId,
        originalProcessedAt: existingEvent.processedAt
      });
      return {
        success: true,
        message: 'Webhook already processed (idempotent)',
        processedAt: existingEvent.processedAt
      };
    }

    // Get payment details from Mercado Pago API
    const payment = await paymentClient.get({ id: paymentId });

    if (!payment) {
      const errorMsg = 'Payment not found in Mercado Pago';
      await createWebhookEvent({
        paymentId,
        requestId,
        eventType: 'payment',
        status: 'failed',
        requestBody: JSON.stringify(data),
        requestHeaders: JSON.stringify(headers),
        errorMessage: errorMsg
      });
      console.error('[MercadoPago Webhook] Payment not found:', paymentId);
      return { success: false, error: errorMsg };
    }

    if (!payment.external_reference) {
      const errorMsg = 'Payment has no external_reference';
      await createWebhookEvent({
        paymentId,
        requestId,
        eventType: 'payment',
        status: 'failed',
        requestBody: JSON.stringify(data),
        requestHeaders: JSON.stringify(headers),
        errorMessage: errorMsg
      });
      console.error('[MercadoPago Webhook] No external reference:', paymentId);
      return { success: false, error: errorMsg };
    }

    // SAFE JSON PARSING: Wrap in try-catch to handle malformed external_reference
    let externalRef;
    try {
      externalRef = JSON.parse(payment.external_reference);
    } catch (parseError) {
      const errorMsg = `Invalid JSON in external_reference: ${parseError}`;
      await createWebhookEvent({
        paymentId,
        requestId,
        eventType: 'payment',
        status: 'failed',
        requestBody: JSON.stringify(data),
        requestHeaders: JSON.stringify(headers),
        errorMessage: errorMsg
      });
      console.error('[MercadoPago Webhook] JSON parse error:', parseError);
      return { success: false, error: 'Invalid external reference format' };
    }

    // Process based on payment type
    let result;
    if (externalRef.type === 'subscription') {
      result = await handleSubscriptionPayment(payment, externalRef);
    } else if (externalRef.type === 'deposit') {
      result = await handleDepositPayment(payment, externalRef);
    } else {
      result = { success: false, error: 'Unknown payment type' };
    }

    // Record webhook event in database (audit trail)
    await createWebhookEvent({
      paymentId,
      requestId,
      eventType: 'payment',
      status: result.success ? 'processed' : 'failed',
      requestBody: JSON.stringify(data),
      requestHeaders: JSON.stringify(headers),
      responseBody: JSON.stringify(result),
      errorMessage: result.success ? undefined : (result as any).error || 'Unknown error'
    });

    return result;

  } catch (error: any) {
    const errorMsg = error?.message || 'Unknown error';
    console.error('[MercadoPago Webhook] Unexpected error:', error);

    // Try to record the failure
    try {
      await createWebhookEvent({
        paymentId,
        requestId,
        eventType: 'payment',
        status: 'failed',
        requestBody: JSON.stringify(data),
        requestHeaders: JSON.stringify(headers),
        errorMessage: errorMsg
      });
    } catch (dbError) {
      console.error('[MercadoPago Webhook] Failed to record webhook event:', dbError);
    }

    return { success: false, error: 'Webhook processing error' };
  }
}

/**
 * Helper function to create webhook event record
 */
async function createWebhookEvent(data: {
  paymentId: string;
  requestId: string;
  eventType: string;
  status: string;
  requestBody: string;
  requestHeaders: string;
  responseBody?: string;
  errorMessage?: string;
}) {
  return await prisma.webhookEvent.create({
    data: {
      paymentId: data.paymentId,
      requestId: data.requestId,
      eventType: data.eventType,
      status: data.status,
      requestBody: data.requestBody,
      requestHeaders: data.requestHeaders,
      responseBody: data.responseBody,
      errorMessage: data.errorMessage
    }
  });
}

async function handleSubscriptionPayment(payment: any, externalRef: any) {
  const { professionalId, planId, billingPeriod } = externalRef;

  console.log(`[MercadoPago] Processing subscription payment - Status: ${payment.status}, Payment ID: ${payment.id}`);

  // Handle ALL payment statuses properly (not just 'approved')
  switch (payment.status) {
    case 'approved': {
      // Get plan for calculating dates
      const plan = await prisma.subscriptionPlan.findUnique({
        where: { id: planId }
      });

      if (!plan) {
        return { success: false, error: 'Plan not found' };
      }

      const now = new Date();
      const endDate = new Date(now);
      if (billingPeriod === 'MONTHLY') {
        endDate.setMonth(endDate.getMonth() + 1);
      } else {
        endDate.setFullYear(endDate.getFullYear() + 1);
      }

      // Create or update subscription
      const existingSubscription = await prisma.subscription.findUnique({
        where: { professionalId }
      });

      let subscription;
      if (existingSubscription) {
        subscription = await prisma.subscription.update({
          where: { id: existingSubscription.id },
          data: {
            planId,
            billingPeriod: billingPeriod as BillingPeriod,
            status: 'ACTIVE',
            startDate: now,
            nextBillingDate: endDate,
            mercadoPagoSubscriptionId: payment.id?.toString()
          }
        });
      } else {
        subscription = await prisma.subscription.create({
          data: {
            professionalId,
            planId,
            billingPeriod: billingPeriod as BillingPeriod,
            status: 'ACTIVE',
            startDate: now,
            nextBillingDate: endDate,
            mercadoPagoSubscriptionId: payment.id?.toString()
          }
        });

        // Update professional with subscription
        await prisma.professional.update({
          where: { id: professionalId },
          data: { subscriptionId: subscription.id }
        });
      }

      // Record payment as COMPLETED
      await prisma.payment.create({
        data: {
          subscriptionId: subscription.id,
          type: 'SUBSCRIPTION',
          status: 'COMPLETED',
          amount: payment.transaction_amount,
          currency: payment.currency_id || 'ARS',
          mercadoPagoPaymentId: payment.id?.toString(),
          paidAt: new Date()
        }
      });

      console.log('[MercadoPago] Subscription payment approved and processed:', payment.id);
      return { success: true, message: 'Subscription activated' };
    }

    case 'pending':
    case 'in_process':
    case 'authorized': {
      // Payment is pending - record it but don't activate subscription yet
      console.log(`[MercadoPago] Subscription payment pending: ${payment.status}`);

      // Check if we already have a payment record for this
      const existingPayment = await prisma.payment.findFirst({
        where: { mercadoPagoPaymentId: payment.id?.toString() }
      });

      if (!existingPayment) {
        await prisma.payment.create({
          data: {
            type: 'SUBSCRIPTION',
            status: 'PENDING',
            amount: payment.transaction_amount,
            currency: payment.currency_id || 'ARS',
            mercadoPagoPaymentId: payment.id?.toString()
          }
        });
      }

      return { success: true, message: `Payment ${payment.status} - waiting for approval` };
    }

    case 'rejected':
    case 'cancelled': {
      // Payment failed - record it and mark subscription as PAST_DUE if exists
      console.log(`[MercadoPago] Subscription payment ${payment.status}:`, payment.id);

      await prisma.payment.create({
        data: {
          type: 'SUBSCRIPTION',
          status: 'FAILED',
          amount: payment.transaction_amount,
          currency: payment.currency_id || 'ARS',
          mercadoPagoPaymentId: payment.id?.toString()
        }
      });

      // If subscription exists, mark as PAST_DUE
      const existingSubscription = await prisma.subscription.findUnique({
        where: { professionalId }
      });

      if (existingSubscription && existingSubscription.status === 'ACTIVE') {
        await prisma.subscription.update({
          where: { id: existingSubscription.id },
          data: { status: 'PAST_DUE' }
        });
      }

      return { success: true, message: `Payment ${payment.status} - subscription suspended` };
    }

    case 'refunded':
    case 'charged_back': {
      // Payment was refunded or charged back
      console.log(`[MercadoPago] Subscription payment ${payment.status}:`, payment.id);

      await prisma.payment.create({
        data: {
          type: 'SUBSCRIPTION',
          status: 'REFUNDED',
          amount: payment.transaction_amount,
          currency: payment.currency_id || 'ARS',
          mercadoPagoPaymentId: payment.id?.toString()
        }
      });

      // Cancel the subscription
      const existingSubscription = await prisma.subscription.findUnique({
        where: { professionalId }
      });

      if (existingSubscription) {
        await prisma.subscription.update({
          where: { id: existingSubscription.id },
          data: { status: 'CANCELLED' }
        });
      }

      return { success: true, message: `Payment ${payment.status} - subscription cancelled` };
    }

    default: {
      console.warn(`[MercadoPago] Unknown payment status: ${payment.status}`);
      return { success: true, message: `Unknown payment status: ${payment.status}` };
    }
  }
}

async function handleDepositPayment(payment: any, externalRef: any) {
  const { appointmentId } = externalRef;

  console.log(`[MercadoPago] Processing deposit payment - Status: ${payment.status}, Appointment ID: ${appointmentId}`);

  // Handle ALL payment statuses properly
  switch (payment.status) {
    case 'approved': {
      // Update appointment deposit status
      await prisma.appointment.update({
        where: { id: appointmentId },
        data: {
          depositPaid: true,
          depositPaidAt: new Date(),
          status: 'PENDING' // Move from PENDING_PAYMENT to PENDING
        }
      });

      console.log('[MercadoPago] Deposit payment approved for appointment:', appointmentId);
      return { success: true, message: 'Deposit paid - appointment confirmed' };
    }

    case 'pending':
    case 'in_process':
    case 'authorized': {
      // Payment is pending - keep appointment in PENDING_PAYMENT status
      console.log(`[MercadoPago] Deposit payment pending: ${payment.status}`);
      return { success: true, message: `Deposit payment ${payment.status} - waiting for approval` };
    }

    case 'rejected':
    case 'cancelled': {
      // Payment failed - appointment will be released by the deposit time limit worker
      console.log(`[MercadoPago] Deposit payment ${payment.status} for appointment:`, appointmentId);
      return { success: true, message: `Deposit payment ${payment.status} - appointment will be released` };
    }

    case 'refunded':
    case 'charged_back': {
      // Payment was refunded - mark deposit as unpaid
      console.log(`[MercadoPago] Deposit payment ${payment.status} for appointment:`, appointmentId);

      await prisma.appointment.update({
        where: { id: appointmentId },
        data: {
          depositPaid: false,
          depositPaidAt: null
        }
      });

      return { success: true, message: `Deposit ${payment.status} - appointment deposit unmarked` };
    }

    default: {
      console.warn(`[MercadoPago] Unknown payment status: ${payment.status}`);
      return { success: true, message: `Unknown payment status: ${payment.status}` };
    }
  }
}

// ============================================
// SUBSCRIPTION MANAGEMENT
// ============================================

export async function getSubscriptionStatus(professionalId: string) {
  const subscription = await prisma.subscription.findUnique({
    where: { professionalId },
    include: {
      plan: true,
      payments: {
        orderBy: { createdAt: 'desc' },
        take: 5
      }
    }
  });

  if (!subscription) {
    return null;
  }

  return {
    id: subscription.id,
    plan: {
      id: subscription.plan.id,
      name: subscription.plan.name,
      description: subscription.plan.description,
      monthlyPrice: Number(subscription.plan.monthlyPrice),
      annualPrice: Number(subscription.plan.annualPrice),
      features: subscription.plan.features
    },
    billingPeriod: subscription.billingPeriod,
    status: subscription.status,
    startDate: subscription.startDate.toISOString(),
    nextBillingDate: subscription.nextBillingDate?.toISOString() || null,
    recentPayments: subscription.payments.map(p => ({
      id: p.id,
      amount: Number(p.amount),
      currency: p.currency,
      status: p.status,
      paidAt: p.paidAt?.toISOString() || null,
      createdAt: p.createdAt.toISOString()
    }))
  };
}

export async function cancelSubscription(professionalId: string) {
  const subscription = await prisma.subscription.findUnique({
    where: { professionalId }
  });

  if (!subscription) {
    throw new Error('No subscription found');
  }

  // Cancel the subscription (will remain active until end of current period)
  await prisma.subscription.update({
    where: { id: subscription.id },
    data: {
      status: 'CANCELLED',
      endDate: subscription.nextBillingDate // Active until end of paid period
    }
  });

  return { success: true, message: 'Subscription cancelled' };
}

// ============================================
// GET AVAILABLE PLANS
// ============================================

export async function getAvailablePlans() {
  const plans = await prisma.subscriptionPlan.findMany({
    where: { isActive: true },
    orderBy: { displayOrder: 'asc' }
  });

  return plans.map(p => ({
    id: p.id,
    name: p.name,
    description: p.description,
    monthlyPrice: Number(p.monthlyPrice),
    annualPrice: Number(p.annualPrice),
    features: p.features,
    displayOrder: p.displayOrder
  }));
}

// ============================================
// PREAPPROVAL (RECURRING SUBSCRIPTION) WEBHOOKS
// ============================================

/**
 * Handle MercadoPago preapproval (subscription) webhook events
 * Events: authorized, paused, cancelled, updated, payment_created
 */
async function handlePreapprovalWebhook(data: WebhookData, headers: Record<string, string>) {
  const preapprovalId = data.data.id?.toString();
  const requestId = headers['x-request-id'] || '';

  if (!preapprovalId) {
    logger.error('[MercadoPago Preapproval] Missing preapproval ID');
    return { success: false, error: 'Missing preapproval ID' };
  }

  try {
    // Get preapproval details from MercadoPago
    const preapproval = await preapprovalClient.get({ id: preapprovalId });

    if (!preapproval || !preapproval.external_reference) {
      logger.error('[MercadoPago Preapproval] No external reference found');
      return { success: false, error: 'No external reference' };
    }

    // Parse external reference
    let externalRef;
    try {
      externalRef = JSON.parse(preapproval.external_reference);
    } catch (parseError) {
      logger.error('[MercadoPago Preapproval] Invalid external reference JSON');
      return { success: false, error: 'Invalid external reference' };
    }

    const { professionalId, planId, billingPeriod } = externalRef;

    // Handle different preapproval events
    switch (data.action) {
      case 'created':
      case 'updated': {
        // Check preapproval status
        switch (preapproval.status) {
          case 'authorized': {
            // Subscription authorized - activate it
            ServiceLogger.mercadopago('subscription_authorized', {
              preapprovalId,
              professionalId
            });

            const plan = await prisma.subscriptionPlan.findUnique({
              where: { id: planId }
            });

            if (!plan) {
              return { success: false, error: 'Plan not found' };
            }

            const now = new Date();
            const nextBillingDate = new Date(now);
            if (billingPeriod === 'MONTHLY') {
              nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);
            } else {
              nextBillingDate.setFullYear(nextBillingDate.getFullYear() + 1);
            }

            // Create or update subscription
            const existingSubscription = await prisma.subscription.findUnique({
              where: { professionalId }
            });

            if (existingSubscription) {
              await prisma.subscription.update({
                where: { id: existingSubscription.id },
                data: {
                  planId,
                  billingPeriod: billingPeriod as BillingPeriod,
                  status: 'ACTIVE',
                  startDate: now,
                  nextBillingDate,
                  mercadoPagoSubscriptionId: preapprovalId
                }
              });
            } else {
              const subscription = await prisma.subscription.create({
                data: {
                  professionalId,
                  planId,
                  billingPeriod: billingPeriod as BillingPeriod,
                  status: 'ACTIVE',
                  startDate: now,
                  nextBillingDate,
                  mercadoPagoSubscriptionId: preapprovalId
                }
              });

              await prisma.professional.update({
                where: { id: professionalId },
                data: { subscriptionId: subscription.id }
              });
            }

            return { success: true, message: 'Subscription authorized and activated' };
          }

          case 'paused': {
            // Subscription paused (payment failure) - mark as PAST_DUE
            ServiceLogger.mercadopago('subscription_paused', {
              preapprovalId,
              professionalId,
              reason: 'payment_failure'
            });

            await prisma.subscription.update({
              where: { professionalId },
              data: { status: 'PAST_DUE' }
            });

            // Deactivate professional's booking page
            await prisma.professional.update({
              where: { id: professionalId },
              data: { isActive: false }
            });

            return { success: true, message: 'Subscription paused - professional deactivated' };
          }

          case 'cancelled': {
            // Subscription cancelled
            ServiceLogger.mercadopago('subscription_cancelled', {
              preapprovalId,
              professionalId
            });

            await prisma.subscription.update({
              where: { professionalId },
              data: {
                status: 'CANCELLED',
                endDate: new Date()
              }
            });

            return { success: true, message: 'Subscription cancelled' };
          }

          default: {
            ServiceLogger.mercadopago('subscription_status_unknown', {
              preapprovalId,
              status: preapproval.status
            });
            return { success: true, message: `Preapproval status: ${preapproval.status}` };
          }
        }
      }

      default: {
        ServiceLogger.mercadopago('preapproval_action_ignored', {
          action: data.action,
          preapprovalId
        });
        return { success: true, message: `Preapproval action ${data.action} processed` };
      }
    }
  } catch (error: any) {
    logger.error('[MercadoPago Preapproval] Error processing webhook:', error);
    return { success: false, error: 'Preapproval webhook processing error' };
  }
}

// ============================================
// RECURRING SUBSCRIPTION MANAGEMENT
// ============================================

/**
 * Cancel a recurring subscription in MercadoPago
 * This stops automatic charges
 */
export async function cancelRecurringSubscription(professionalId: string) {
  const subscription = await prisma.subscription.findUnique({
    where: { professionalId }
  });

  if (!subscription || !subscription.mercadoPagoSubscriptionId) {
    throw new Error('No recurring subscription found');
  }

  try {
    // Cancel preapproval in MercadoPago
    await preapprovalClient.update({
      id: subscription.mercadoPagoSubscriptionId,
      body: {
        status: 'cancelled'
      }
    });

    // Update local database
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        status: 'CANCELLED',
        endDate: subscription.nextBillingDate // Active until end of paid period
      }
    });

    ServiceLogger.mercadopago('recurring_subscription_cancelled', {
      subscriptionId: subscription.id,
      professionalId,
      preapprovalId: subscription.mercadoPagoSubscriptionId
    });

    return { success: true, message: 'Recurring subscription cancelled' };
  } catch (error: any) {
    logger.error('[MercadoPago] Failed to cancel recurring subscription:', error);
    throw new Error(`Error al cancelar suscripción: ${error.message}`);
  }
}

/**
 * Get recurring subscription status from MercadoPago
 */
export async function getRecurringSubscriptionStatus(professionalId: string) {
  const subscription = await prisma.subscription.findUnique({
    where: { professionalId }
  });

  if (!subscription || !subscription.mercadoPagoSubscriptionId) {
    return null;
  }

  try {
    const preapproval = await preapprovalClient.get({
      id: subscription.mercadoPagoSubscriptionId
    });

    return {
      id: preapproval.id,
      status: preapproval.status,
      reason: preapproval.reason,
      nextPaymentDate: preapproval.next_payment_date,
      payerEmail: preapproval.payer_email,
      autoRecurring: preapproval.auto_recurring
    };
  } catch (error: any) {
    logger.error('[MercadoPago] Failed to get recurring subscription status:', error);
    return null;
  }
}
