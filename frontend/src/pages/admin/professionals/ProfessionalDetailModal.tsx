import { useEffect, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, CircularProgress, Tabs, Tab, TextField, Select, MenuItem, FormControl, InputLabel, Alert } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import { useAppDispatch, useAppSelector } from '../../../store';
import {
  getProfessionalDetail,
  clearSelectedProfessional,
  getProfessionalAvailability,
  updateProfessionalAvailability,
  getProfessionalBlockedDates,
  addProfessionalBlockedDate,
  removeProfessionalBlockedDate,
  clearProfessionalSettings,
  clearSuccessMessage,
  clearError
} from '../../../store/slices/adminSlice';

// Day names
const DAY_NAMES = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

// Duration options (5-180 in 5-minute increments)
const DURATION_OPTIONS = Array.from({ length: 36 }, (_, i) => (i + 1) * 5);

interface TimeSlot {
  slotNumber: number;
  startTime: string;
  endTime: string;
}

interface DayConfig {
  dayOfWeek: number;
  enabled: boolean;
  slots: TimeSlot[];
}

interface ProfessionalDetailModalProps {
  professionalId: string | null;
  onClose: () => void;
}

const ProfessionalDetailModal = ({ professionalId, onClose }: ProfessionalDetailModalProps) => {
  const dispatch = useAppDispatch();
  const { selectedProfessional, professionalAvailability, professionalAppointmentDuration, professionalBlockedDates, successMessage, error } = useAppSelector((state) => state.admin);
  const { isLoading } = useAppSelector((state) => state.loading);

  const [activeTab, setActiveTab] = useState(0);

  // Availability state
  const [daysConfig, setDaysConfig] = useState<DayConfig[]>([]);
  const [appointmentDuration, setAppointmentDuration] = useState(30);

  // Blocked dates state
  const [newBlockedDate, setNewBlockedDate] = useState('');
  const [newBlockedEndDate, setNewBlockedEndDate] = useState('');
  const [newBlockedReason, setNewBlockedReason] = useState('');

  // Initialize availability state from Redux
  useEffect(() => {
    if (professionalAvailability) {
      const initialDays: DayConfig[] = DAY_NAMES.map((_, index) => ({
        dayOfWeek: index,
        enabled: false,
        slots: []
      }));

      professionalAvailability.forEach(av => {
        const day = initialDays[av.dayOfWeek];
        day.enabled = true;
        day.slots.push({
          slotNumber: av.slotNumber,
          startTime: av.startTime,
          endTime: av.endTime
        });
      });

      // Sort slots by slotNumber
      initialDays.forEach(day => {
        day.slots.sort((a, b) => a.slotNumber - b.slotNumber);
      });

      setDaysConfig(initialDays);
      setAppointmentDuration(professionalAppointmentDuration);
    } else {
      // Initialize empty days
      const emptyDays: DayConfig[] = DAY_NAMES.map((_, index) => ({
        dayOfWeek: index,
        enabled: false,
        slots: []
      }));
      setDaysConfig(emptyDays);
    }
  }, [professionalAvailability, professionalAppointmentDuration]);

  // Fetch professional details when modal opens
  useEffect(() => {
    if (professionalId) {
      dispatch(getProfessionalDetail(professionalId));
    }

    // Cleanup on unmount
    return () => {
      dispatch(clearSelectedProfessional());
      dispatch(clearProfessionalSettings());
      dispatch(clearSuccessMessage());
      dispatch(clearError());
    };
  }, [professionalId, dispatch]);

  // Load availability/blocked dates when tab changes
  useEffect(() => {
    if (professionalId && activeTab === 1) {
      dispatch(getProfessionalAvailability(professionalId));
    } else if (professionalId && activeTab === 2) {
      dispatch(getProfessionalBlockedDates(professionalId));
    }
  }, [activeTab, professionalId, dispatch]);

  // Clear messages after 3 seconds
  useEffect(() => {
    if (successMessage || error) {
      const timer = setTimeout(() => {
        dispatch(clearSuccessMessage());
        dispatch(clearError());
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, error, dispatch]);

  const handleClose = () => {
    dispatch(clearSelectedProfessional());
    dispatch(clearProfessionalSettings());
    onClose();
  };

  // Availability handlers
  const handleToggleDay = (dayOfWeek: number) => {
    setDaysConfig(prev => prev.map(day => {
      if (day.dayOfWeek === dayOfWeek) {
        if (!day.enabled) {
          // Enable with default slot
          return {
            ...day,
            enabled: true,
            slots: [{ slotNumber: 1, startTime: '09:00', endTime: '17:00' }]
          };
        } else {
          // Disable and remove all slots
          return { ...day, enabled: false, slots: [] };
        }
      }
      return day;
    }));
  };

  const handleAddSlot = (dayOfWeek: number) => {
    setDaysConfig(prev => prev.map(day => {
      if (day.dayOfWeek === dayOfWeek && day.slots.length < 5) {
        const maxSlotNumber = Math.max(0, ...day.slots.map(s => s.slotNumber));
        return {
          ...day,
          slots: [...day.slots, { slotNumber: maxSlotNumber + 1, startTime: '09:00', endTime: '17:00' }]
        };
      }
      return day;
    }));
  };

  const handleRemoveSlot = (dayOfWeek: number, slotNumber: number) => {
    setDaysConfig(prev => prev.map(day => {
      if (day.dayOfWeek === dayOfWeek) {
        return {
          ...day,
          slots: day.slots.filter(s => s.slotNumber !== slotNumber)
        };
      }
      return day;
    }));
  };

  const handleUpdateSlotTime = (dayOfWeek: number, slotNumber: number, field: 'startTime' | 'endTime', value: string) => {
    setDaysConfig(prev => prev.map(day => {
      if (day.dayOfWeek === dayOfWeek) {
        return {
          ...day,
          slots: day.slots.map(slot => {
            if (slot.slotNumber === slotNumber) {
              return { ...slot, [field]: value };
            }
            return slot;
          })
        };
      }
      return day;
    }));
  };

  const handleSaveAvailability = async () => {
    if (!professionalId) return;

    const availabilities: Array<{ dayOfWeek: number; slotNumber: number; startTime: string; endTime: string }> = [];
    daysConfig.forEach(day => {
      if (day.enabled) {
        day.slots.forEach(slot => {
          availabilities.push({
            dayOfWeek: day.dayOfWeek,
            slotNumber: slot.slotNumber,
            startTime: slot.startTime,
            endTime: slot.endTime
          });
        });
      }
    });

    await dispatch(updateProfessionalAvailability({
      professionalId,
      availabilities,
      appointmentDuration
    }));
  };

  // Blocked dates handlers
  const handleAddBlockedDate = async () => {
    if (!professionalId || !newBlockedDate) return;

    await dispatch(addProfessionalBlockedDate({
      professionalId,
      date: newBlockedDate,
      endDate: newBlockedEndDate || undefined,
      reason: newBlockedReason || undefined
    }));

    // Refresh list
    dispatch(getProfessionalBlockedDates(professionalId));

    // Clear form
    setNewBlockedDate('');
    setNewBlockedEndDate('');
    setNewBlockedReason('');
  };

  const handleRemoveBlockedDate = async (dateId: string) => {
    if (!professionalId) return;
    await dispatch(removeProfessionalBlockedDate({ professionalId, dateId }));
  };

  if (!professionalId) return null;

  return (
    <Dialog
      open={!!professionalId}
      onClose={handleClose}
      maxWidth="lg"
      fullWidth
      className="fade-up-normal"
    >
      <DialogTitle className="flex items-center justify-between border-b border-gray-200 fade-down-fast">
        <span className="text-xl font-semibold text-gray-900">Gestión del Profesional</span>
        <Button
          onClick={handleClose}
          sx={{ minWidth: 'auto', p: 0.5 }}
          className="zoom-in-fast"
        >
          <CloseIcon />
        </Button>
      </DialogTitle>

      <DialogContent className="mt-0 p-0">
        {/* Tabs */}
        <Tabs
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue)}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Información" />
          <Tab label="Disponibilidad" />
          <Tab label="Fechas Bloqueadas" />
        </Tabs>

        {/* Messages */}
        {successMessage && (
          <Alert severity="success" className="mx-4 mt-4 fade-down-fast">
            {successMessage}
          </Alert>
        )}
        {error && (
          <Alert severity="error" className="mx-4 mt-4 fade-down-fast">
            {error}
          </Alert>
        )}

        <div className="p-4">
          {isLoading ? (
            <div className="flex justify-center py-8 zoom-in-fast">
              <CircularProgress size={40} />
            </div>
          ) : activeTab === 0 && selectedProfessional ? (
            /* Tab 0: Information */
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
                          ${selectedProfessional.depositSettings.depositAmount} USD
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
          ) : activeTab === 1 ? (
            /* Tab 1: Availability */
            <div className="space-y-6 fade-up-normal">
              {/* Appointment Duration */}
              <section className="rounded-md bg-blue-50 p-4 fade-right-fast">
                <h3 className="mb-3 text-sm font-semibold text-blue-700 uppercase">Duración de Citas</h3>
                <FormControl size="small" sx={{ minWidth: 200 }}>
                  <InputLabel>Duración</InputLabel>
                  <Select
                    value={appointmentDuration}
                    onChange={(e) => setAppointmentDuration(Number(e.target.value))}
                    label="Duración"
                  >
                    {DURATION_OPTIONS.map(dur => (
                      <MenuItem key={dur} value={dur}>{dur} minutos</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </section>

              {/* Weekly Schedule */}
              <section className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-700 uppercase">Horarios Semanales</h3>
                {daysConfig.map((day, index) => (
                  <div key={day.dayOfWeek} className={`rounded-md border p-4 ${day.enabled ? 'bg-white border-blue-200' : 'bg-gray-50 border-gray-200'} ${index % 2 === 0 ? 'fade-left-fast' : 'fade-right-fast'}`}>
                    <div className="flex items-center justify-between mb-3">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={day.enabled}
                          onChange={() => handleToggleDay(day.dayOfWeek)}
                          className="w-4 h-4 text-blue-600 rounded"
                        />
                        <span className={`font-medium ${day.enabled ? 'text-gray-900' : 'text-gray-500'}`}>
                          {DAY_NAMES[day.dayOfWeek]}
                        </span>
                      </label>
                      {day.enabled && day.slots.length < 5 && (
                        <Button
                          size="small"
                          onClick={() => handleAddSlot(day.dayOfWeek)}
                          startIcon={<AddIcon />}
                          className="zoom-in-fast"
                        >
                          Agregar horario
                        </Button>
                      )}
                    </div>

                    {day.enabled && day.slots.length > 0 && (
                      <div className="space-y-2 ml-6">
                        {day.slots.map((slot, slotIndex) => (
                          <div key={slot.slotNumber} className={`flex items-center gap-3 ${slotIndex % 2 === 0 ? 'fade-right-fast' : 'fade-left-fast'}`}>
                            <TextField
                              type="time"
                              size="small"
                              value={slot.startTime}
                              onChange={(e) => handleUpdateSlotTime(day.dayOfWeek, slot.slotNumber, 'startTime', e.target.value)}
                              sx={{ width: 130 }}
                            />
                            <span className="text-gray-500">a</span>
                            <TextField
                              type="time"
                              size="small"
                              value={slot.endTime}
                              onChange={(e) => handleUpdateSlotTime(day.dayOfWeek, slot.slotNumber, 'endTime', e.target.value)}
                              sx={{ width: 130 }}
                            />
                            {day.slots.length > 1 && (
                              <Button
                                size="small"
                                color="error"
                                onClick={() => handleRemoveSlot(day.dayOfWeek, slot.slotNumber)}
                                startIcon={<DeleteIcon />}
                                className="zoom-out-fast"
                              >
                                Eliminar
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </section>

              {/* Save Button */}
              <div className="flex justify-end fade-up-normal">
                <Button
                  variant="contained"
                  onClick={handleSaveAvailability}
                  startIcon={<SaveIcon />}
                  className="zoom-in-fast"
                >
                  Guardar Disponibilidad
                </Button>
              </div>
            </div>
          ) : activeTab === 2 ? (
            /* Tab 2: Blocked Dates */
            <div className="space-y-6 fade-up-normal">
              {/* Add Blocked Date Form */}
              <section className="rounded-md bg-gray-50 p-4 fade-right-fast">
                <h3 className="mb-3 text-sm font-semibold text-gray-700 uppercase">Bloquear Fechas</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
                  <TextField
                    type="date"
                    size="small"
                    label="Fecha Inicio"
                    value={newBlockedDate}
                    onChange={(e) => setNewBlockedDate(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    fullWidth
                  />
                  <TextField
                    type="date"
                    size="small"
                    label="Fecha Fin (opcional)"
                    value={newBlockedEndDate}
                    onChange={(e) => setNewBlockedEndDate(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    fullWidth
                  />
                  <TextField
                    size="small"
                    label="Motivo (opcional)"
                    value={newBlockedReason}
                    onChange={(e) => setNewBlockedReason(e.target.value)}
                    placeholder="Ej: Vacaciones"
                    fullWidth
                  />
                  <Button
                    variant="contained"
                    onClick={handleAddBlockedDate}
                    disabled={!newBlockedDate}
                    startIcon={<AddIcon />}
                    className="zoom-in-fast"
                  >
                    Bloquear
                  </Button>
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  Puedes bloquear una fecha individual o un rango de fechas.
                </p>
              </section>

              {/* Blocked Dates List */}
              <section className="fade-left-fast">
                <h3 className="mb-3 text-sm font-semibold text-gray-700 uppercase">Fechas Bloqueadas</h3>
                {professionalBlockedDates && professionalBlockedDates.length > 0 ? (
                  <div className="space-y-2">
                    {professionalBlockedDates.map((bd, index) => (
                      <div key={bd.id} className={`flex items-center justify-between rounded-md bg-white border border-gray-200 p-3 ${index % 2 === 0 ? 'fade-right-fast' : 'fade-left-fast'}`}>
                        <div>
                          <p className="font-medium text-gray-900">
                            {new Date(bd.date + 'T00:00:00').toLocaleDateString('es-AR', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                          {bd.reason && (
                            <p className="text-sm text-gray-500">{bd.reason}</p>
                          )}
                        </div>
                        <Button
                          size="small"
                          color="error"
                          onClick={() => handleRemoveBlockedDate(bd.id)}
                          startIcon={<DeleteIcon />}
                          className="zoom-out-fast"
                        >
                          Desbloquear
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-md bg-gray-50 p-8 text-center">
                    <p className="text-gray-500">No hay fechas bloqueadas</p>
                  </div>
                )}
              </section>
            </div>
          ) : (
            <div className="py-8 text-center text-gray-500 fade-up-fast">
              No se pudo cargar la información del profesional
            </div>
          )}
        </div>
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
