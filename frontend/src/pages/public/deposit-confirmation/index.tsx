import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { useAppDispatch, useAppSelector } from '../../../store';
import {
  fetchAppointmentByRef,
  clearAppointmentByRef
} from '../../../store/slices/publicBookingSlice';

const DepositConfirmationPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { appointmentByRef, appointmentByRefError } = useAppSelector(
    (state) => state.publicBooking
  );
  const { isLoading } = useAppSelector((state) => state.loading);

  const ref = searchParams.get('ref');
  const paymentParam = searchParams.get('payment');
  const collectionStatus = searchParams.get('collection_status');

  // Determine payment status from query params
  const paymentStatus = collectionStatus || paymentParam || 'unknown';

  useEffect(() => {
    if (ref) {
      dispatch(fetchAppointmentByRef(ref));
    }
    return () => {
      dispatch(clearAppointmentByRef());
    };
  }, [ref, dispatch]);

  // Loading state
  if (isLoading && !appointmentByRef) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
          <p className="mt-2 text-sm text-gray-500">Cargando...</p>
        </div>
      </div>
    );
  }

  // No reference provided
  if (!ref) {
    return (
      <div className="container-narrow safe-area-bottom">
        <div className="text-center py-12">
          <ErrorOutlineIcon sx={{ fontSize: 48, color: '#dc2626' }} />
          <h1 className="mt-4 text-xl font-bold text-gray-900">Enlace invalido</h1>
          <p className="mt-2 text-sm text-gray-600">
            No se encontro una referencia de reserva en este enlace.
          </p>
          <Button
            variant="contained"
            onClick={() => navigate('/')}
            sx={{ mt: 3, textTransform: 'none' }}
          >
            Ir al inicio
          </Button>
        </div>
      </div>
    );
  }

  // Error fetching appointment
  if (appointmentByRefError) {
    return (
      <div className="container-narrow safe-area-bottom">
        <div className="text-center py-12">
          <ErrorOutlineIcon sx={{ fontSize: 48, color: '#dc2626' }} />
          <h1 className="mt-4 text-xl font-bold text-gray-900">Reserva no encontrada</h1>
          <p className="mt-2 text-sm text-gray-600">
            No pudimos encontrar una reserva con la referencia proporcionada.
          </p>
          <Button
            variant="contained"
            onClick={() => navigate('/')}
            sx={{ mt: 3, textTransform: 'none' }}
          >
            Ir al inicio
          </Button>
        </div>
      </div>
    );
  }

  if (!appointmentByRef) return null;

  // Determine display based on payment status + appointment deposit status
  const isApproved = paymentStatus === 'approved' || paymentStatus === 'success' || appointmentByRef.deposit.paid;
  const isPending = paymentStatus === 'pending' || paymentStatus === 'in_process';
  const isRejected = paymentStatus === 'rejected' || paymentStatus === 'failure';

  const statusConfig = isApproved
    ? {
        icon: <CheckCircleOutlineIcon sx={{ fontSize: 56, color: '#16a34a' }} />,
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        title: 'Pago confirmado',
        subtitle: 'Tu deposito ha sido acreditado exitosamente.',
        badgeColor: 'bg-green-100 text-green-800'
      }
    : isPending
      ? {
          icon: <HourglassEmptyIcon sx={{ fontSize: 56, color: '#d97706' }} />,
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          title: 'Pago en proceso',
          subtitle: 'Tu pago esta siendo procesado. Recibiras una confirmacion cuando se acredite.',
          badgeColor: 'bg-yellow-100 text-yellow-800'
        }
      : {
          icon: <ErrorOutlineIcon sx={{ fontSize: 56, color: '#dc2626' }} />,
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          title: 'Pago rechazado',
          subtitle: 'No se pudo procesar tu pago. Por favor intenta nuevamente.',
          badgeColor: 'bg-red-100 text-red-800'
        };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(amount);
  };

  return (
    <div className="container-narrow safe-area-bottom">
      {/* Status header */}
      <div className={`mb-4 sm:mb-6 rounded-md ${statusConfig.bgColor} border ${statusConfig.borderColor} p-5 sm:p-6 text-center`}>
        <div className="mb-3">
          {statusConfig.icon}
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
          {statusConfig.title}
        </h1>
        <p className="mt-2 text-sm sm:text-base text-gray-600">
          {statusConfig.subtitle}
        </p>
      </div>

      {/* Booking reference */}
      <div className="mb-4 sm:mb-6 rounded-md bg-blue-50 p-3 sm:p-4 text-center">
        <p className="text-xs sm:text-sm text-blue-700">Codigo de reserva</p>
        <p className="mt-1 text-xl sm:text-2xl font-bold tracking-wider text-blue-900">
          {appointmentByRef.bookingReference}
        </p>
      </div>

      {/* Appointment details */}
      <div className="mb-4 sm:mb-6 rounded-md bg-white p-3 sm:p-4 shadow-sm">
        <h3 className="mb-3 text-sm sm:text-base font-semibold text-gray-900">Detalles de tu cita</h3>
        <dl className="space-y-2 sm:space-y-3">
          <div className="flex justify-between gap-2">
            <dt className="text-xs sm:text-sm text-gray-500">Profesional</dt>
            <dd className="text-xs sm:text-sm font-medium text-gray-900 text-right">
              {appointmentByRef.professional.fullName}
            </dd>
          </div>
          <div className="flex justify-between gap-2">
            <dt className="text-xs sm:text-sm text-gray-500">Fecha</dt>
            <dd className="text-xs sm:text-sm font-medium text-gray-900">
              {appointmentByRef.date}
            </dd>
          </div>
          <div className="flex justify-between gap-2">
            <dt className="text-xs sm:text-sm text-gray-500">Hora</dt>
            <dd className="text-xs sm:text-sm font-medium text-gray-900">
              {appointmentByRef.time}
            </dd>
          </div>
          <div className="flex justify-between gap-2">
            <dt className="text-xs sm:text-sm text-gray-500">Paciente</dt>
            <dd className="text-xs sm:text-sm font-medium text-gray-900 text-right truncate max-w-[60%]">
              {appointmentByRef.patient.firstName} {appointmentByRef.patient.lastName}
            </dd>
          </div>
          {appointmentByRef.deposit.amount && (
            <div className="flex justify-between gap-2 pt-2 border-t border-gray-100">
              <dt className="text-xs sm:text-sm text-gray-500">Deposito</dt>
              <dd className="text-xs sm:text-sm font-medium text-gray-900">
                {formatCurrency(appointmentByRef.deposit.amount)}
                <span className={`ml-2 inline-block px-2 py-0.5 rounded-full text-xs ${statusConfig.badgeColor}`}>
                  {isApproved ? 'Pagado' : isPending ? 'Procesando' : 'Pendiente'}
                </span>
              </dd>
            </div>
          )}
          <div className="flex justify-between gap-2">
            <dt className="text-xs sm:text-sm text-gray-500">Estado de la cita</dt>
            <dd className="text-xs sm:text-sm font-medium text-gray-900">
              {appointmentByRef.status === 'PENDING' && 'Confirmada'}
              {appointmentByRef.status === 'PENDING_PAYMENT' && 'Pendiente de pago'}
              {appointmentByRef.status === 'CONFIRMED' && 'Confirmada'}
              {appointmentByRef.status === 'REMINDER_SENT' && 'Confirmada'}
              {appointmentByRef.status === 'CANCELLED' && 'Cancelada'}
            </dd>
          </div>
        </dl>
      </div>

      {/* Next steps */}
      {isApproved && (
        <div className="mb-4 sm:mb-6 rounded-md bg-gray-50 p-3 sm:p-4">
          <h3 className="mb-2 text-sm sm:text-base font-semibold text-gray-900">¿Que sigue?</h3>
          <ul className="space-y-2 text-xs sm:text-sm text-gray-600">
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-0.5 font-medium">1.</span>
              <span>Recibiras una confirmacion por WhatsApp y email</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-0.5 font-medium">2.</span>
              <span>Te enviaremos recordatorios antes de tu cita</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-0.5 font-medium">3.</span>
              <span>Si necesitas cancelar, puedes hacerlo desde el enlace en tu confirmacion</span>
            </li>
          </ul>
        </div>
      )}

      {/* Pending info */}
      {isPending && (
        <div className="mb-4 sm:mb-6 rounded-md bg-yellow-50 border border-yellow-200 p-3 sm:p-4">
          <p className="text-xs sm:text-sm text-yellow-800">
            El pago puede demorar unos minutos en acreditarse. Una vez confirmado, recibiras una notificacion por WhatsApp y email.
          </p>
        </div>
      )}

      {/* Rejected - retry info */}
      {isRejected && (
        <div className="mb-4 sm:mb-6 rounded-md bg-red-50 border border-red-200 p-3 sm:p-4">
          <p className="text-xs sm:text-sm text-red-800 mb-3">
            Tu pago no pudo ser procesado. Puedes intentar nuevamente o contactar al profesional.
          </p>
          {appointmentByRef.professional.slug && (
            <Button
              variant="contained"
              color="warning"
              onClick={() => navigate(`/${appointmentByRef.professional.slug}`)}
              fullWidth
              sx={{ textTransform: 'none' }}
            >
              Volver a intentar
            </Button>
          )}
        </div>
      )}

      {/* Back to home button */}
      <div className="space-y-3">
        {appointmentByRef.professional.slug && (
          <Button
            variant="contained"
            onClick={() => navigate(`/${appointmentByRef.professional.slug}`)}
            fullWidth
            sx={{
              textTransform: 'none',
              minHeight: { xs: 56, sm: 48 },
              fontSize: { xs: '0.875rem', sm: '1rem' }
            }}
          >
            Hacer otra reserva
          </Button>
        )}
      </div>
    </div>
  );
};

export default DepositConfirmationPage;
