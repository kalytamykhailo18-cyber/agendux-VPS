import prisma from '../config/database';
import { logger, ServiceLogger } from '../utils/logger';
import { createSubscriptionPreference, getRecurringSubscriptionStatus } from './mercadopago.service';

// Worker state
let isRunning = false;
let workerInterval: NodeJS.Timeout | null = null;

// Check for subscriptions needing renewal every 6 hours
const CHECK_INTERVAL_MS = 6 * 60 * 60 * 1000; // 6 hours

/**
 * Start the subscription renewal worker
 * Checks for expired or soon-to-expire subscriptions
 */
export function startSubscriptionRenewalWorker() {
  if (isRunning) {
    logger.warn('Subscription renewal worker is already running');
    return;
  }

  isRunning = true;
  ServiceLogger.subscription('Starting subscription renewal worker...');
  ServiceLogger.subscription(`Check interval: ${CHECK_INTERVAL_MS / (1000 * 60 * 60)} hours`);

  // Run immediately on start
  processSubscriptionRenewals().catch((error) => {
    logger.error('Error in initial subscription renewal check:', error);
  });

  // Then run periodically
  workerInterval = setInterval(() => {
    processSubscriptionRenewals().catch((error) => {
      logger.error('Error in subscription renewal worker:', error);
    });
  }, CHECK_INTERVAL_MS);

  ServiceLogger.subscription('Subscription renewal worker started successfully');
}

/**
 * Stop the subscription renewal worker
 */
export async function stopSubscriptionRenewalWorker() {
  if (!isRunning) {
    return;
  }

  ServiceLogger.subscription('Stopping subscription renewal worker...');

  if (workerInterval) {
    clearInterval(workerInterval);
    workerInterval = null;
  }

  isRunning = false;
  ServiceLogger.subscription('Subscription renewal worker stopped');
}

/**
 * Process subscription renewals
 * Finds subscriptions that need renewal and handles them
 */
async function processSubscriptionRenewals() {
  try {
    ServiceLogger.subscription('Processing subscription renewals...');

    const now = new Date();

    // Find subscriptions that have expired or will expire within 24 hours
    const expiringSubscriptions = await prisma.subscription.findMany({
      where: {
        status: 'ACTIVE',
        nextBillingDate: {
          lte: new Date(now.getTime() + 24 * 60 * 60 * 1000) // Within next 24 hours
        }
      },
      include: {
        professional: {
          include: {
            user: {
              select: {
                email: true,
                name: true
              }
            }
          }
        },
        plan: true
      },
      take: 50 // Process up to 50 at a time
    });

    if (expiringSubscriptions.length === 0) {
      ServiceLogger.subscription('No subscriptions need renewal at this time');
      return;
    }

    ServiceLogger.subscription(`Found ${expiringSubscriptions.length} subscriptions needing renewal`);

    for (const subscription of expiringSubscriptions) {
      try {
        await handleSubscriptionRenewal(subscription);
      } catch (error) {
        logger.error(`Error renewing subscription ${subscription.id}:`, error);
      }
    }

    ServiceLogger.subscription(`Finished processing ${expiringSubscriptions.length} subscriptions`);

    // Also check for past-due subscriptions (those that failed to renew)
    await handlePastDueSubscriptions();

  } catch (error) {
    logger.error('Error in subscription renewal processor:', error);
  }
}

/**
 * Handle renewal for a single subscription
 * Two paths:
 * 1. Recurring subscription (has mercadoPagoSubscriptionId) - automatic charges via MercadoPago
 * 2. Manual subscription (no mercadoPagoSubscriptionId) - needs manual payment link
 */
async function handleSubscriptionRenewal(subscription: any) {
  try {
    const now = new Date();

    // PATH 1: RECURRING SUBSCRIPTION (AUTOMATIC)
    // If subscription has MercadoPago subscription ID, it's handled automatically
    if (subscription.mercadoPagoSubscriptionId) {
      ServiceLogger.subscription(`Subscription ${subscription.id} is recurring - checking MercadoPago status`);

      try {
        // Verify status with MercadoPago
        const mpStatus = await getRecurringSubscriptionStatus(subscription.professionalId);

        if (!mpStatus) {
          logger.warn(`Could not get MercadoPago status for subscription ${subscription.id}`);
          return;
        }

        // MercadoPago handles automatic charges and sends webhooks
        // We just need to verify the status matches
        switch (mpStatus.status) {
          case 'authorized':
            // Subscription is active and will auto-renew
            ServiceLogger.subscription(`Recurring subscription ${subscription.id} is active and will auto-renew`);

            // Update next billing date if MercadoPago provides it
            if (mpStatus.nextPaymentDate) {
              await prisma.subscription.update({
                where: { id: subscription.id },
                data: {
                  nextBillingDate: new Date(mpStatus.nextPaymentDate)
                }
              });
            }
            break;

          case 'paused':
            // Payment failed - mark as PAST_DUE
            ServiceLogger.subscription(`Recurring subscription ${subscription.id} is paused - marking as PAST_DUE`);

            await prisma.subscription.update({
              where: { id: subscription.id },
              data: { status: 'PAST_DUE' }
            });

            await prisma.professional.update({
              where: { id: subscription.professionalId },
              data: { isActive: false }
            });
            break;

          case 'cancelled':
            // Subscription cancelled in MercadoPago
            ServiceLogger.subscription(`Recurring subscription ${subscription.id} is cancelled in MercadoPago`);

            await prisma.subscription.update({
              where: { id: subscription.id },
              data: {
                status: 'CANCELLED',
                endDate: now
              }
            });
            break;

          default:
            ServiceLogger.subscription(`Recurring subscription ${subscription.id} has unknown status: ${mpStatus.status}`);
        }

        return; // Exit - recurring subscription handled
      } catch (error) {
        logger.error(`Error checking recurring subscription status ${subscription.id}:`, error);
        // Continue to manual flow as fallback
      }
    }

    // PATH 2: MANUAL SUBSCRIPTION (ONE-TIME PAYMENT)
    // Check if already past due
    if (subscription.nextBillingDate < now) {
      ServiceLogger.subscription(`Subscription ${subscription.id} is past due - marking as PAST_DUE`);

      // Mark as past due
      await prisma.subscription.update({
        where: { id: subscription.id },
        data: {
          status: 'PAST_DUE',
          updatedAt: now
        }
      });

      // Deactivate professional's booking page
      await prisma.professional.update({
        where: { id: subscription.professionalId },
        data: { isActive: false }
      });

      ServiceLogger.subscription(`Professional ${subscription.professionalId} deactivated due to past-due subscription`);

      // TODO: Send email notification to professional about payment failure
      // This would integrate with the email service

      return;
    }

    // Subscription is about to renew - create manual payment preference
    ServiceLogger.subscription(`Creating manual renewal payment for subscription ${subscription.id}`);

    try {
      // Create Mercado Pago preference for manual renewal
      await createSubscriptionPreference({
        professionalId: subscription.professionalId,
        planId: subscription.planId,
        billingPeriod: subscription.billingPeriod,
        email: subscription.professional.user.email,
        name: subscription.professional.user.name
      });

      ServiceLogger.subscription(`Manual renewal payment preference created for subscription ${subscription.id}`);

      // TODO: Send email with payment link to professional
      // This would integrate with the email service

    } catch (error) {
      logger.error(`Failed to create renewal payment for subscription ${subscription.id}:`, error);

      // Mark as past due since we couldn't create payment
      await prisma.subscription.update({
        where: { id: subscription.id },
        data: { status: 'PAST_DUE' }
      });
    }

  } catch (error) {
    logger.error(`Error handling subscription renewal ${subscription.id}:`, error);
    throw error;
  }
}

/**
 * Handle past-due subscriptions that have been unpaid for too long
 * Automatically cancel subscriptions that are past due for more than 7 days
 */
async function handlePastDueSubscriptions() {
  try {
    const now = new Date();
    const cancelThreshold = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); // 7 days ago

    const pastDueSubscriptions = await prisma.subscription.findMany({
      where: {
        status: 'PAST_DUE',
        nextBillingDate: {
          lt: cancelThreshold
        }
      },
      include: {
        professional: true
      },
      take: 50
    });

    if (pastDueSubscriptions.length === 0) {
      return;
    }

    ServiceLogger.subscription(`Found ${pastDueSubscriptions.length} past-due subscriptions to cancel`);

    for (const subscription of pastDueSubscriptions) {
      try {
        // Cancel subscription
        await prisma.subscription.update({
          where: { id: subscription.id },
          data: {
            status: 'CANCELLED',
            endDate: now
          }
        });

        // Deactivate professional
        await prisma.professional.update({
          where: { id: subscription.professionalId },
          data: {
            isActive: false,
            subscriptionId: null
          }
        });

        ServiceLogger.subscription(`Cancelled past-due subscription ${subscription.id} and deactivated professional ${subscription.professionalId}`);

        // TODO: Send final cancellation email to professional

      } catch (error) {
        logger.error(`Error cancelling past-due subscription ${subscription.id}:`, error);
      }
    }

  } catch (error) {
    logger.error('Error handling past-due subscriptions:', error);
  }
}

/**
 * Manual trigger for testing (can be called via API endpoint if needed)
 */
export async function triggerSubscriptionRenewalCheck() {
  return await processSubscriptionRenewals();
}
