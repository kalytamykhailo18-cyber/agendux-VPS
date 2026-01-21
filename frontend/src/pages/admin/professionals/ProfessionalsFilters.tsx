import { Button, TextField, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

interface ProfessionalsFiltersProps {
  search: string;
  statusFilter: string;
  onSearchChange: (value: string) => void;
  onStatusFilterChange: (value: string) => void;
  onSubmit: () => void; // RULE: No form submit event, just button onClick
}

const ProfessionalsFilters = ({
  search,
  statusFilter,
  onSearchChange,
  onStatusFilterChange,
  onSubmit
}: ProfessionalsFiltersProps) => {
  return (
    <div className="mb-6 rounded-lg bg-white p-4 shadow-sm fade-up-fast">
      {/* RULE: NO <form> tag, use <div> with button onClick */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="flex-1 fade-right-fast">
          <TextField
            fullWidth
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar por nombre, email o slug..."
            size="small"
          />
        </div>
        <div className="w-full sm:w-40 fade-left-fast">
          <FormControl fullWidth size="small">
            <InputLabel>Estado</InputLabel>
            <Select
              value={statusFilter}
              onChange={(e) => onStatusFilterChange(e.target.value)}
              label="Estado"
            >
              <MenuItem value="">Todos</MenuItem>
              <MenuItem value="active">Activos</MenuItem>
              <MenuItem value="suspended">Suspendidos</MenuItem>
              <MenuItem value="inactive">Inactivos</MenuItem>
            </Select>
          </FormControl>
        </div>
        <Button
          onClick={onSubmit}
          variant="contained"
          startIcon={<SearchIcon />}
          className="zoom-in-fast"
          sx={{ textTransform: 'none' }}
        >
          Buscar
        </Button>
      </div>
    </div>
  );
};

export default ProfessionalsFilters;
