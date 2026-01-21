import type { AdminStatistics } from '../../../types';

interface AppointmentsChartProps {
  statistics: AdminStatistics;
}

const AppointmentsChart = ({ statistics }: AppointmentsChartProps) => {
  // Calculate percentages for visual bars
  const totalAppointments = Object.values(statistics.appointments.byStatus).reduce(
    (sum, count) => sum + count,
    0
  );

  const getPercentage = (count: number) => {
    if (totalAppointments === 0) return 0;
    return (count / totalAppointments) * 100;
  };

  const statusData = [
    {
      status: 'PENDING',
      label: 'Pendientes',
      count: statistics.appointments.byStatus.PENDING || 0,
      color: 'bg-yellow-500'
    },
    {
      status: 'PENDING_PAYMENT',
      label: 'Pago Pendiente',
      count: statistics.appointments.byStatus.PENDING_PAYMENT || 0,
      color: 'bg-blue-500'
    },
    {
      status: 'REMINDER_SENT',
      label: 'Recordatorio Enviado',
      count: statistics.appointments.byStatus.REMINDER_SENT || 0,
      color: 'bg-orange-500'
    },
    {
      status: 'CONFIRMED',
      label: 'Confirmadas',
      count: statistics.appointments.byStatus.CONFIRMED || 0,
      color: 'bg-green-500'
    },
    {
      status: 'COMPLETED',
      label: 'Completadas',
      count: statistics.appointments.byStatus.COMPLETED || 0,
      color: 'bg-purple-500'
    },
    {
      status: 'CANCELLED',
      label: 'Canceladas',
      count: statistics.appointments.byStatus.CANCELLED || 0,
      color: 'bg-red-500'
    },
    {
      status: 'NO_SHOW',
      label: 'No Show',
      count: statistics.appointments.byStatus.NO_SHOW || 0,
      color: 'bg-gray-500'
    }
  ];

  return (
    <div className="rounded-lg bg-white p-6 shadow-sm fade-up-normal">
      <h3 className="mb-6 text-lg font-semibold text-gray-900">Distribución de Citas</h3>

      {totalAppointments === 0 ? (
        <div className="py-8 text-center text-gray-500">
          No hay citas en el período seleccionado
        </div>
      ) : (
        <div className="space-y-4">
          {statusData.map((item, index) => {
            const percentage = getPercentage(item.count);
            const animations = [
              'fade-right-fast',
              'fade-right-normal',
              'fade-right-slow',
              'fade-left-fast',
              'fade-left-normal',
              'fade-left-slow',
              'fade-up-fast'
            ];

            return (
              <div key={item.status} className={animations[index]}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">{item.label}</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {item.count} ({percentage.toFixed(1)}%)
                  </span>
                </div>
                <div className="h-3 w-full rounded-full bg-gray-200">
                  <div
                    className={`h-3 rounded-full ${item.color} transition-all duration-500`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Period Information */}
      {statistics.period && (
        <div className="mt-6 rounded-md bg-gray-50 p-4 fade-up-slow">
          <p className="text-xs font-medium text-gray-600">Período de Análisis</p>
          <p className="mt-1 text-sm text-gray-900">
            {new Date(statistics.period.start).toLocaleDateString('es-AR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}{' '}
            -{' '}
            {new Date(statistics.period.end).toLocaleDateString('es-AR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        </div>
      )}
    </div>
  );
};

export default AppointmentsChart;
