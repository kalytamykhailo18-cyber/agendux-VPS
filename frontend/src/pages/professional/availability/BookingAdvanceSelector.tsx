import { Select, MenuItem, FormControl, InputLabel } from '@mui/material';

const MIN_ADVANCE_OPTIONS = [
  { value: 0, label: 'Mismo día' },
  { value: 12, label: '12 horas' },
  { value: 24, label: '1 día' },
  { value: 48, label: '2 días' },
  { value: 72, label: '3 días' },
  { value: 168, label: '7 días' },
];

const MAX_ADVANCE_OPTIONS = [
  { value: 7, label: '7 días' },
  { value: 14, label: '14 días' },
  { value: 30, label: '30 días' },
  { value: 60, label: '60 días' },
  { value: 90, label: '90 días' },
];

interface BookingAdvanceSelectorProps {
  minAdvanceHours: number;
  maxAdvanceDays: number;
  onMinChange: (hours: number) => void;
  onMaxChange: (days: number) => void;
}

const BookingAdvanceSelector = ({
  minAdvanceHours,
  maxAdvanceDays,
  onMinChange,
  onMaxChange,
}: BookingAdvanceSelectorProps) => {
  return (
    <div className="mb-6 rounded-lg bg-white p-4 shadow-sm fade-left-normal">
      <p className="text-sm font-medium text-gray-700 mb-3 fade-down-fast">Anticipación para reservar turnos</p>
      <div className="flex flex-wrap gap-4">
        <FormControl size="small" className="sm:w-52 zoom-in-fast">
          <InputLabel id="min-advance-label">Anticipación mínima</InputLabel>
          <Select
            labelId="min-advance-label"
            value={minAdvanceHours}
            onChange={(e) => onMinChange(Number(e.target.value))}
            label="Anticipación mínima"
          >
            {MIN_ADVANCE_OPTIONS.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>
                {opt.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" className="sm:w-52 zoom-in-fast">
          <InputLabel id="max-advance-label">Anticipación máxima</InputLabel>
          <Select
            labelId="max-advance-label"
            value={maxAdvanceDays}
            onChange={(e) => onMaxChange(Number(e.target.value))}
            label="Anticipación máxima"
          >
            {MAX_ADVANCE_OPTIONS.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>
                {opt.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </div>
    </div>
  );
};

export default BookingAdvanceSelector;
