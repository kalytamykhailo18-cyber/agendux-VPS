import { Alert } from '@mui/material';

interface StatisticsHeaderProps {
  error: string | null;
}

const StatisticsHeader = ({ error }: StatisticsHeaderProps) => {
  return (
    <div className="mb-6 fade-down-fast">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Estadísticas de la Plataforma</h1>
      <p className="text-gray-600">Visualiza el rendimiento y métricas clave de Agendux</p>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" className="mt-4 zoom-in-fast" sx={{ borderRadius: '6px' }}>
          {error}
        </Alert>
      )}
    </div>
  );
};

export default StatisticsHeader;
