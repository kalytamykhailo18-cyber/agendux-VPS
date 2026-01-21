import { Button, Alert } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

// RULE: Only buttons/inputs use MUI. Layout uses Tailwind.

interface TestimonialsHeaderProps {
  onNew: () => void;
  successMessage: string | null;
  error: string | null;
}

const TestimonialsHeader = ({ onNew, successMessage, error }: TestimonialsHeaderProps) => {
  return (
    <div className="mb-6 sm:mb-8">
      {/* Header with title and button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Testimonios</h1>
          <p className="mt-1 text-sm text-gray-600">
            Gestiona los testimonios que aparecen en la página principal
          </p>
        </div>

        <Button
          onClick={onNew}
          variant="contained"
          startIcon={<AddIcon />}
          sx={{
            textTransform: 'none',
            minHeight: 44,
            alignSelf: { xs: 'stretch', sm: 'auto' },
          }}
        >
          Nuevo Testimonio
        </Button>
      </div>

      {/* Success message */}
      {successMessage && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {successMessage}
        </Alert>
      )}

      {/* Error message */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
    </div>
  );
};

export default TestimonialsHeader;
