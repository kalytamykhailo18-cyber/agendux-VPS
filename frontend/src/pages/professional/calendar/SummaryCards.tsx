interface SummaryData {
  today: number;
  thisWeek: number;
  pending: number;
  confirmed: number;
}

interface SummaryCardsProps {
  summary: SummaryData | null;
}

const EXAMPLE_SUMMARY = { today: 3, thisWeek: 12, pending: 4, confirmed: 8 };

const SummaryCards = ({ summary }: SummaryCardsProps) => {
  const hasReal = summary && (summary.today > 0 || summary.thisWeek > 0 || summary.pending > 0 || summary.confirmed > 0);
  const data = hasReal ? summary : EXAMPLE_SUMMARY;
  const isExample = !hasReal;

  return (
    <div>
      {isExample && (
        <p className="mb-2 text-xs text-gray-400 text-right fade-down-fast">
          Datos de ejemplo — se actualizarán con tus citas reales
        </p>
      )}
      <div className={`grid grid-cols-2 gap-4 sm:grid-cols-4 ${isExample ? 'opacity-60' : ''}`}>
        <div className="rounded-lg bg-white p-4 shadow-sm fade-up-fast">
          <p className="text-sm text-gray-500">Hoy</p>
          <p className="mt-1 text-3xl font-bold text-gray-900">{data.today}</p>
        </div>
        <div className="rounded-lg bg-white p-4 shadow-sm fade-down-fast">
          <p className="text-sm text-gray-500">Esta semana</p>
          <p className="mt-1 text-3xl font-bold text-gray-900">{data.thisWeek}</p>
        </div>
        <div className="rounded-lg bg-white p-4 shadow-sm fade-right-fast">
          <p className="text-sm text-gray-500">Pendientes</p>
          <p className="mt-1 text-3xl font-bold text-yellow-600">{data.pending}</p>
        </div>
        <div className="rounded-lg bg-white p-4 shadow-sm fade-left-fast">
          <p className="text-sm text-gray-500">Confirmadas</p>
          <p className="mt-1 text-3xl font-bold text-green-600">{data.confirmed}</p>
        </div>
      </div>
    </div>
  );
};

export default SummaryCards;
