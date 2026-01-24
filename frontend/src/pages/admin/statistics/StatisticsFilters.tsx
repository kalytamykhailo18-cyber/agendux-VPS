import { Button, TextField } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import TodayIcon from '@mui/icons-material/Today';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AllInclusiveIcon from '@mui/icons-material/AllInclusive';

interface StatisticsFiltersProps {
  startDate: string;
  endDate: string;
  onStartDateChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
  onSubmit: () => void;
  onQuickFilter: (preset: 'week' | 'month' | 'all') => void;
}

const StatisticsFilters = ({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  onSubmit,
  onQuickFilter
}: StatisticsFiltersProps) => {
  return (
    <div className="mb-6 rounded-lg bg-white p-4 shadow-sm fade-up-fast">
      {/* Quick Filters */}
      <div className="mb-4 flex flex-wrap gap-2 fade-right-fast">
        <Button
          onClick={() => onQuickFilter('week')}
          startIcon={<TodayIcon />}
          variant="outlined"
          sx={{ textTransform: 'none', borderRadius: '6px' }}
          className="zoom-in-fast"
        >
          Esta semana
        </Button>
        <Button
          onClick={() => onQuickFilter('month')}
          startIcon={<CalendarMonthIcon />}
          variant="outlined"
          sx={{ textTransform: 'none', borderRadius: '6px' }}
          className="zoom-in-normal"
        >
          Este mes
        </Button>
        <Button
          onClick={() => onQuickFilter('all')}
          startIcon={<AllInclusiveIcon />}
          variant="outlined"
          sx={{ textTransform: 'none', borderRadius: '6px' }}
          className="zoom-in-slow"
        >
          Todo el tiempo
        </Button>
      </div>

      {/* Custom Date Range - RULE: NO <form> tag, use <div> with button onClick */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="flex-1 fade-left-fast">
          <TextField
            label="Fecha de Inicio"
            type="date"
            value={startDate}
            onChange={(e) => onStartDateChange(e.target.value)}
            size="small"
            fullWidth
            InputLabelProps={{ shrink: true }}
          />
        </div>
        <div className="flex-1 fade-right-fast">
          <TextField
            label="Fecha de Fin"
            type="date"
            value={endDate}
            onChange={(e) => onEndDateChange(e.target.value)}
            size="small"
            fullWidth
            InputLabelProps={{ shrink: true }}
          />
        </div>
        <Button
          onClick={onSubmit}
          variant="contained"
          startIcon={<SearchIcon />}
          className="zoom-in-fast"
          sx={{ textTransform: 'none', minHeight: 40 }}
        >
          Aplicar
        </Button>
      </div>
    </div>
  );
};

export default StatisticsFilters;
