interface SummaryData {
  today: number;
  thisWeek: number;
  pending: number;
  confirmed: number;
}

interface SummaryCardsProps {
  summary: SummaryData | null;
}

const EMPTY_SUMMARY = { today: 0, thisWeek: 0, pending: 0, confirmed: 0 };

const SummaryCards = ({ summary }: SummaryCardsProps) => {
  const data = summary || EMPTY_SUMMARY;

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
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
  );
};

export default SummaryCards;
