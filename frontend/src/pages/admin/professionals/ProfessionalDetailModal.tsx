import { useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, CircularProgress } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useAppDispatch, useAppSelector } from '../../../store';
import { getProfessionalDetail, clearSelectedProfessional } from '../../../store/slices/adminSlice';

interface ProfessionalDetailModalProps {
  professionalId: string | null;
  onClose: () => void;
}

const ProfessionalDetailModal = ({ professionalId, onClose }: ProfessionalDetailModalProps) => {
  const dispatch = useAppDispatch();
  const { selectedProfessional } = useAppSelector((state) => state.admin);
  const { isLoading } = useAppSelector((state) => state.loading);

  // Fetch professional details when modal opens
  useEffect(() => {
    if (professionalId) {
      dispatch(getProfessionalDetail(professionalId));
    }

    // Cleanup on unmount
    return () => {
      dispatch(clearSelectedProfessional());
    };
  }, [professionalId, dispatch]);

  const handleClose = () => {
    dispatch(clearSelectedProfessional());
    onClose();
  };

  if (!professionalId) return null;

  return (
    <Dialog
      open={!!professionalId}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      className="fade-up-normal"
    >
      <DialogTitle className="flex items-center justify-between border-b border-gray-200 fade-down-fast">
        <span className="text-xl font-semibold text-gray-900">Detalles del Profesional</span>
        <Button
          onClick={handleClose}
          sx={{ minWidth: 'auto', p: 0.5 }}
          className="zoom-in-fast"
        >
          <CloseIcon />
        </Button>
      </DialogTitle>

      <DialogContent className="mt-4">
        {isLoading ? (
          <div className="flex justify-center py-8 zoom-in-fast">
            <CircularProgress size={40} />
          </div>
        ) : selectedProfessional ? (
          <div className="space-y-6 fade-up-normal">
            {/* Basic Information */}
            <section className="rounded-md bg-gray-50 p-4 fade-right-fast">
              <h3 className="mb-3 text-sm font-semibold text-gray-700 uppercase">Información Básica</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-gray-500">Nombre Completo</p>
                  <p className="text-sm font-medium text-gray-900">{selectedProfessional.fullName}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Email</p>
                  <p className="text-sm font-medium text-gray-900">{selectedProfessional.email}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Slug</p>
                  <p className="text-sm font-medium text-gray-900">/{selectedProfessional.slug}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Teléfono</p>
                  <p className="text-sm font-medium text-gray-900">{selectedProfessional.phone || 'No especificado'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Zona Horaria</p>
                  <p className="text-sm font-medium text-gray-900">{selectedProfessional.timezone}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Fecha de Registro</p>
                  <p className="text-sm font-medium text-gray-900">
                    {new Date(selectedProfessional.createdAt).toLocaleDateString('es-AR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            </section>

            {/* Account Status */}
            <section className="rounded-md bg-gray-50 p-4 fade-left-fast">
              <h3 className="mb-3 text-sm font-semibold text-gray-700 uppercase">Estado de la Cuenta</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-gray-500">Estado Activo</p>
                  <p className={`text-sm font-medium ${selectedProfessional.isActive ? 'text-green-600' : 'text-gray-400'}`}>
                    {selectedProfessional.isActive ? 'Sí' : 'No'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Estado de Suspensión</p>
                  <p className={`text-sm font-medium ${selectedProfessional.isSuspended ? 'text-red-600' : 'text-green-600'}`}>
                    {selectedProfessional.isSuspended ? 'Suspendido' : 'No suspendido'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Google Calendar</p>
                  <p className={`text-sm font-medium ${selectedProfessional.googleCalendarConnected ? 'text-green-600' : 'text-gray-400'}`}>
                    {selectedProfessional.googleCalendarConnected ? 'Conectado' : 'No conectado'}
                  </p>
                </div>
              </div>
            </section>

            {/* Subscription Information */}
            {selectedProfessional.subscription && (
              <section className="rounded-md bg-blue-50 p-4 fade-right-normal">
                <h3 className="mb-3 text-sm font-semibold text-blue-700 uppercase">Suscripción</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-blue-600">Plan</p>
                    <p className="text-sm font-medium text-blue-900">{selectedProfessional.subscription.planName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-blue-600">Estado</p>
                    <p className="text-sm font-medium text-blue-900 capitalize">{selectedProfessional.subscription.status}</p>
                  </div>
                  <div>
                    <p className="text-xs text-blue-600">Periodo de Facturación</p>
                    <p className="text-sm font-medium text-blue-900">
                      {selectedProfessional.subscription.billingPeriod === 'MONTHLY' ? 'Mensual' : 'Anual'}
                    </p>
                  </div>
                  {selectedProfessional.subscription.startDate && (
                    <div>
                      <p className="text-xs text-blue-600">Inicio</p>
                      <p className="text-sm font-medium text-blue-900">
                        {new Date(selectedProfessional.subscription.startDate).toLocaleDateString('es-AR')}
                      </p>
                    </div>
                  )}
                  {selectedProfessional.subscription.nextBillingDate && (
                    <div>
                      <p className="text-xs text-blue-600">Próxima Facturación</p>
                      <p className="text-sm font-medium text-blue-900">
                        {new Date(selectedProfessional.subscription.nextBillingDate).toLocaleDateString('es-AR')}
                      </p>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* Deposit Settings */}
            {selectedProfessional.depositSettings && (
              <section className="rounded-md bg-gray-50 p-4 fade-left-normal">
                <h3 className="mb-3 text-sm font-semibold text-gray-700 uppercase">Configuración de Depósitos</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-gray-500">Depósito Habilitado</p>
                    <p className={`text-sm font-medium ${selectedProfessional.depositSettings.depositEnabled ? 'text-green-600' : 'text-gray-400'}`}>
                      {selectedProfessional.depositSettings.depositEnabled ? 'Sí' : 'No'}
                    </p>
                  </div>
                  {selectedProfessional.depositSettings.depositEnabled && (
                    <div>
                      <p className="text-xs text-gray-500">Monto del Depósito</p>
                      <p className="text-sm font-medium text-gray-900">
                        ${selectedProfessional.depositSettings.depositAmount} ARS
                      </p>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* Appointment Statistics */}
            {selectedProfessional.statistics && (
              <section className="rounded-md bg-gray-50 p-4 fade-up-slow">
                <h3 className="mb-3 text-sm font-semibold text-gray-700 uppercase">Estadísticas de Citas</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <div className="rounded-md bg-white p-3 text-center zoom-in-fast">
                    <p className="text-2xl font-bold text-blue-600">{selectedProfessional.statistics.totalAppointments}</p>
                    <p className="text-xs text-gray-500">Total</p>
                  </div>
                  <div className="rounded-md bg-white p-3 text-center zoom-in-normal">
                    <p className="text-2xl font-bold text-green-600">{selectedProfessional.statistics.confirmedAppointments}</p>
                    <p className="text-xs text-gray-500">Confirmadas</p>
                  </div>
                  <div className="rounded-md bg-white p-3 text-center zoom-in-slow">
                    <p className="text-2xl font-bold text-yellow-600">{selectedProfessional.statistics.pendingAppointments}</p>
                    <p className="text-xs text-gray-500">Pendientes</p>
                  </div>
                  <div className="rounded-md bg-white p-3 text-center zoom-in-fast">
                    <p className="text-2xl font-bold text-purple-600">{selectedProfessional.statistics.completedAppointments}</p>
                    <p className="text-xs text-gray-500">Completadas</p>
                  </div>
                  <div className="rounded-md bg-white p-3 text-center zoom-in-normal">
                    <p className="text-2xl font-bold text-red-600">{selectedProfessional.statistics.cancelledAppointments}</p>
                    <p className="text-xs text-gray-500">Canceladas</p>
                  </div>
                  <div className="rounded-md bg-white p-3 text-center zoom-in-slow">
                    <p className="text-2xl font-bold text-gray-600">{selectedProfessional.statistics.noShowAppointments}</p>
                    <p className="text-xs text-gray-500">No Show</p>
                  </div>
                  <div className="rounded-md bg-white p-3 text-center md:col-span-3 zoom-in-very-slow">
                    <p className="text-2xl font-bold text-blue-600">{selectedProfessional.statistics.totalPatients}</p>
                    <p className="text-xs text-gray-500">Total Pacientes</p>
                  </div>
                </div>
              </section>
            )}
          </div>
        ) : (
          <div className="py-8 text-center text-gray-500 fade-up-fast">
            No se pudo cargar la información del profesional
          </div>
        )}
      </DialogContent>

      <DialogActions className="border-t border-gray-200 fade-up-fast">
        <Button
          onClick={handleClose}
          variant="contained"
          sx={{ textTransform: 'none' }}
          className="zoom-in-fast"
        >
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProfessionalDetailModal;
