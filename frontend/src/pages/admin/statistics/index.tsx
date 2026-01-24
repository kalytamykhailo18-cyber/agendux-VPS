import { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../../store';
import { getStatistics, clearError } from '../../../store/slices/adminSlice';
import StatisticsHeader from './StatisticsHeader';
import StatisticsFilters from './StatisticsFilters';
import StatisticsCards from './StatisticsCards';
import AppointmentsChart from './AppointmentsChart';

// RULE: Page folder structure - index.tsx + flat components (NO subdirectories)
// RULE: Page load → dispatch action → API call → state updates → component renders
// RULE: NO direct API calls from component
// RULE: Global loading spinner during requests

const AdminStatisticsPage = () => {
  const dispatch = useAppDispatch();
  const { statistics, error } = useAppSelector((state) => state.admin);

  // Date range filters
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Load statistics on mount
  useEffect(() => {
    dispatch(getStatistics());
  }, [dispatch]);

  // Cleanup
  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  // Handle filter submit - RULE: No form submit, use button onClick
  const handleFilterSubmit = () => {
    if (startDate && endDate) {
      dispatch(getStatistics({ startDate, endDate }));
    } else {
      dispatch(getStatistics());
    }
  };

  // Quick filter presets
  const handleQuickFilter = (preset: 'week' | 'month' | 'all') => {
    const now = new Date();
    let start: Date;

    switch (preset) {
      case 'week':
        start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        start = new Date(now.setMonth(now.getMonth() - 1));
        break;
      default:
        // All time
        setStartDate('');
        setEndDate('');
        dispatch(getStatistics());
        return;
    }

    const startStr = start.toISOString().split('T')[0];
    const endStr = new Date().toISOString().split('T')[0];

    setStartDate(startStr);
    setEndDate(endStr);
    dispatch(getStatistics({ startDate: startStr, endDate: endStr }));
  };

  return (
    <div className="mx-auto max-w-7xl">
      {/* Header */}
      <StatisticsHeader error={error} />

      {/* Filters */}
      <StatisticsFilters
        startDate={startDate}
        endDate={endDate}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
        onSubmit={handleFilterSubmit}
        onQuickFilter={handleQuickFilter}
      />

      {/* Statistics Cards */}
      {statistics && (
        <>
          <StatisticsCards statistics={statistics} />
          <AppointmentsChart statistics={statistics} />
        </>
      )}

      {/* No data message */}
      {!statistics && !error && (
        <div className="mt-8 rounded-lg bg-white p-8 text-center text-gray-500 shadow-sm fade-up-normal">
          Cargando estadísticas...
        </div>
      )}
    </div>
  );
};

export default AdminStatisticsPage;
