import { Button, Dialog, DialogTitle, DialogContent, DialogActions, CircularProgress } from '@mui/material';

interface CancelSubscriptionModalProps {
  nextBillingDate: string | null;
  formatDate: (dateStr: string | null) => string;
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean;
}

const CancelSubscriptionModal = ({
  nextBillingDate,
  formatDate,
  onClose,
  onConfirm,
  loading = false
}: CancelSubscriptionModalProps) => {
  return (
    <Dialog open={true} onClose={loading ? undefined : onClose} maxWidth="sm" fullWidth>
      <DialogTitle>¿Cancelar suscripción?</DialogTitle>
      <DialogContent>
        <p className="text-sm text-gray-500">
          Tu suscripción permanecerá activa hasta el{' '}
          <span className="font-medium">{formatDate(nextBillingDate)}</span>.
          Después de esa fecha, perderás acceso a las funciones premium.
        </p>
      </DialogContent>
      <DialogActions>
        <Button
          variant="outlined"
          onClick={onClose}
          disabled={loading}
        >
          Mantener suscripción
        </Button>
        <Button
          variant="contained"
          color="error"
          onClick={onConfirm}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={16} color="inherit" /> : undefined}
        >
          {loading ? 'Cancelando...' : 'Sí, cancelar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CancelSubscriptionModal;
