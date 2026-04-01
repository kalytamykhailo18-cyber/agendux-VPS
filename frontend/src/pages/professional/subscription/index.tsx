import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../../store';
import {
  getPlans,
  getMySubscription,
  subscribeToPlan,
  changePlan,
  cancelSubscription,
  clearError,
  clearSuccessMessage,
  clearPreference
} from '../../../store/slices/subscriptionSlice';
import type { BillingPeriod } from '../../../types';
import SubscriptionHeader from './SubscriptionHeader';
import CurrentSubscriptionCard from './CurrentSubscriptionCard';
import PlansSection from './PlansSection';
import SubscriptionInfoBox from './SubscriptionInfoBox';
import CancelSubscriptionModal from './CancelSubscriptionModal';

// RULE: Page folder structure - index.tsx + flat components (NO subdirectories)
// RULE: Page load → dispatch action → API call → state updates → component renders
// RULE: NO direct API calls from component
// RULE: Global loading spinner during requests

const ProfessionalSubscriptionPage = () => {
  const dispatch = useAppDispatch();
  const [searchParams] = useSearchParams();
  const { plans, currentSubscription, preference, error, successMessage } = useAppSelector(
    (state) => state.subscription
  );

  // Local state
  const [selectedPeriod, setSelectedPeriod] = useState<BillingPeriod>('MONTHLY');
  const [showCancelModal, setShowCancelModal] = useState(false);

  // Check URL params for payment status
  const paymentStatus = searchParams.get('status');

  // Load data on mount
  useEffect(() => {
    dispatch(getPlans());
    dispatch(getMySubscription());
  }, [dispatch]);

  // Handle payment redirect
  useEffect(() => {
    if (preference?.initPoint) {
      // Redirect to Mercado Pago
      window.location.href = preference.initPoint;
    }
  }, [preference]);

  // Cleanup
  useEffect(() => {
    return () => {
      dispatch(clearError());
      dispatch(clearSuccessMessage());
      dispatch(clearPreference());
    };
  }, [dispatch]);

  // Clear success message after 5 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        dispatch(clearSuccessMessage());
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, dispatch]);

  // Handle subscribe
  const handleSubscribe = async (planId: string) => {
    if (currentSubscription) {
      await dispatch(changePlan({ planId, billingPeriod: selectedPeriod }));
    } else {
      await dispatch(subscribeToPlan({ planId, billingPeriod: selectedPeriod }));
    }
  };

  // Handle cancel
  const handleCancelSubscription = async () => {
    await dispatch(cancelSubscription());
    setShowCancelModal(false);
    dispatch(getMySubscription());
  };

  // Format date
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Format price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  return (
    <div className="mx-auto max-w-5xl zoom-in-normal">
      {/* Header with Payment Status and Messages */}
      <SubscriptionHeader
        paymentStatus={paymentStatus}
        error={error}
        successMessage={successMessage}
      />

      {/* Free plan message */}
      {!currentSubscription && (
        <div className="mb-6 rounded-lg bg-blue-50 p-4 text-blue-700 zoom-in-fast">
          <p className="text-sm fade-up-normal">
            Gracias por probar Agendux. Ya tenés tu link habilitado. Ante cualquier duda podés escribirnos a info@agendux.com
          </p>
          <p className="text-sm mt-2 fade-up-normal">
            En el Plan Premium podrás solicitar un QR gratuito y elegir el nombre que quieras para tu link agendux.com/nombrequeelijas listo para compartir en tus redes sociales y en tu sala de espera.
          </p>
        </div>
      )}

      {/* Current Subscription */}
      {currentSubscription && (
        <CurrentSubscriptionCard
          subscription={currentSubscription}
          onCancelClick={() => setShowCancelModal(true)}
          formatDate={formatDate}
          formatPrice={formatPrice}
        />
      )}

      {/* Plans Section */}
      <PlansSection
        plans={plans}
        currentSubscription={currentSubscription}
        selectedPeriod={selectedPeriod}
        onPeriodChange={setSelectedPeriod}
        onSubscribe={handleSubscribe}
        formatPrice={formatPrice}
      />

      {/* Info Box */}
      <SubscriptionInfoBox />

      {/* Cancel Modal */}
      {showCancelModal && (
        <CancelSubscriptionModal
          nextBillingDate={currentSubscription?.nextBillingDate || null}
          formatDate={formatDate}
          onClose={() => setShowCancelModal(false)}
          onConfirm={handleCancelSubscription}
        />
      )}
    </div>
  );
};

export default ProfessionalSubscriptionPage;
