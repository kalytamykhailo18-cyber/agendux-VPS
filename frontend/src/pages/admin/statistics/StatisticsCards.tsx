import type { AdminStatistics } from '../../../types';
import EventIcon from '@mui/icons-material/Event';
import PeopleIcon from '@mui/icons-material/People';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import PaymentIcon from '@mui/icons-material/Payment';

interface StatisticsCardsProps {
  statistics: AdminStatistics;
}

const StatisticsCards = ({ statistics }: StatisticsCardsProps) => {
  // Calculate total appointments
  const totalAppointments = Object.values(statistics.appointments.byStatus).reduce(
    (sum, count) => sum + count,
    0
  );

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-6">
      {/* Total Appointments */}
      <div className="rounded-lg bg-white p-6 shadow-sm fade-up-fast">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Total de Citas</p>
            <p className="mt-2 text-3xl font-bold text-blue-600">{totalAppointments}</p>
            <p className="mt-1 text-xs text-gray-500">En el período seleccionado</p>
          </div>
          <div className="rounded-full bg-blue-100 p-3">
            <EventIcon sx={{ fontSize: 32, color: 'rgb(37, 99, 235)' }} />
          </div>
        </div>
      </div>

      {/* New Professionals */}
      <div className="rounded-lg bg-white p-6 shadow-sm fade-up-normal">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Nuevos Profesionales</p>
            <p className="mt-2 text-3xl font-bold text-green-600">
              {statistics.professionals.newInPeriod}
            </p>
            <p className="mt-1 text-xs text-gray-500">Registrados en el período</p>
          </div>
          <div className="rounded-full bg-green-100 p-3">
            <PeopleIcon sx={{ fontSize: 32, color: 'rgb(22, 163, 74)' }} />
          </div>
        </div>
      </div>

      {/* Total Revenue */}
      <div className="rounded-lg bg-white p-6 shadow-sm fade-up-slow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Ingresos Totales</p>
            <p className="mt-2 text-3xl font-bold text-purple-600">
              {formatCurrency(statistics.revenue.totalInPeriod)}
            </p>
            <p className="mt-1 text-xs text-gray-500">
              Estimado mensual: {formatCurrency(statistics.revenue.estimatedMonthly)}
            </p>
          </div>
          <div className="rounded-full bg-purple-100 p-3">
            <AttachMoneyIcon sx={{ fontSize: 32, color: 'rgb(147, 51, 234)' }} />
          </div>
        </div>
      </div>

      {/* Payment Count */}
      <div className="rounded-lg bg-white p-6 shadow-sm fade-up-very-slow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Pagos Completados</p>
            <p className="mt-2 text-3xl font-bold text-orange-600">
              {statistics.revenue.paymentCount}
            </p>
            <p className="mt-1 text-xs text-gray-500">Suscripciones procesadas</p>
          </div>
          <div className="rounded-full bg-orange-100 p-3">
            <PaymentIcon sx={{ fontSize: 32, color: 'rgb(249, 115, 22)' }} />
          </div>
        </div>
      </div>

      {/* Appointment Status Breakdown */}
      <div className="rounded-lg bg-white p-6 shadow-sm sm:col-span-2 lg:col-span-4 fade-left-normal">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">Citas por Estado</h3>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-6">
          <div className="rounded-md bg-yellow-50 p-4 text-center zoom-in-fast">
            <p className="text-2xl font-bold text-yellow-600">
              {statistics.appointments.byStatus.PENDING || 0}
            </p>
            <p className="mt-1 text-xs text-yellow-700">Pendientes</p>
          </div>
          <div className="rounded-md bg-blue-50 p-4 text-center zoom-in-normal">
            <p className="text-2xl font-bold text-blue-600">
              {statistics.appointments.byStatus.PENDING_PAYMENT || 0}
            </p>
            <p className="mt-1 text-xs text-blue-700">Pago Pendiente</p>
          </div>
          <div className="rounded-md bg-orange-50 p-4 text-center zoom-in-slow">
            <p className="text-2xl font-bold text-orange-600">
              {statistics.appointments.byStatus.REMINDER_SENT || 0}
            </p>
            <p className="mt-1 text-xs text-orange-700">Recordatorio Enviado</p>
          </div>
          <div className="rounded-md bg-green-50 p-4 text-center zoom-in-very-slow">
            <p className="text-2xl font-bold text-green-600">
              {statistics.appointments.byStatus.CONFIRMED || 0}
            </p>
            <p className="mt-1 text-xs text-green-700">Confirmadas</p>
          </div>
          <div className="rounded-md bg-purple-50 p-4 text-center fade-up-fast">
            <p className="text-2xl font-bold text-purple-600">
              {statistics.appointments.byStatus.COMPLETED || 0}
            </p>
            <p className="mt-1 text-xs text-purple-700">Completadas</p>
          </div>
          <div className="rounded-md bg-red-50 p-4 text-center fade-up-normal">
            <p className="text-2xl font-bold text-red-600">
              {statistics.appointments.byStatus.CANCELLED || 0}
            </p>
            <p className="mt-1 text-xs text-red-700">Canceladas</p>
          </div>
          <div className="rounded-md bg-gray-50 p-4 text-center fade-up-slow">
            <p className="text-2xl font-bold text-gray-600">
              {statistics.appointments.byStatus.NO_SHOW || 0}
            </p>
            <p className="mt-1 text-xs text-gray-700">No Show</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatisticsCards;
