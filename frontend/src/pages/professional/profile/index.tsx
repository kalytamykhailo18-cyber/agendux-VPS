import { useState, useEffect } from 'react';
import { Button, TextField } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import { useAppDispatch, useAppSelector } from '../../../store';
import {
  getProfile,
  updateProfile,
  clearProfileError
} from '../../../store/slices/professionalProfileSlice';

// RULE: Page load → dispatch action → API call → state updates → component renders
// RULE: NO direct API calls from component
// RULE: Global loading spinner during requests

const ProfilePage = () => {
  const dispatch = useAppDispatch();
  const { firstName, lastName, addressStreet, addressCity, error } = useAppSelector(
    (state) => state.professionalProfile
  );

  // Local state for form
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Load profile on mount
  useEffect(() => {
    dispatch(getProfile());
  }, [dispatch]);

  // Initialize form when data loads
  useEffect(() => {
    setStreet(addressStreet || '');
    setCity(addressCity || '');
  }, [addressStreet, addressCity]);

  // Clear error on unmount
  useEffect(() => {
    return () => {
      dispatch(clearProfileError());
    };
  }, [dispatch]);

  // Clear success message after 3 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Handle save
  const handleSave = async () => {
    setSuccessMessage('');

    const result = await dispatch(
      updateProfile({
        addressStreet: street.trim() || null,
        addressCity: city.trim() || null
      })
    );

    if (updateProfile.fulfilled.match(result)) {
      setSuccessMessage('Perfil actualizado correctamente');
    }
  };

  return (
    <div className="mx-auto max-w-2xl zoom-in-normal">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 fade-down-fast">
          Mi Perfil
        </h1>
        <p className="mt-1 text-sm text-gray-500 fade-up-normal">
          Configurá tu dirección para que aparezca en los mensajes de confirmación de turno.
        </p>
      </div>

      {/* Messages */}
      {error && (
        <div className="mb-4 flex items-center gap-2 rounded-md bg-red-50 p-3 text-sm text-red-700">
          <ErrorIcon sx={{ fontSize: 18 }} />
          {error}
        </div>
      )}
      {successMessage && (
        <div className="mb-4 flex items-center gap-2 rounded-md bg-green-50 p-3 text-sm text-green-700">
          <CheckCircleIcon sx={{ fontSize: 18 }} />
          {successMessage}
        </div>
      )}

      {/* Professional info (read-only) */}
      <div className="bg-white rounded-md border p-4 sm:p-6 mb-4">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Información Personal</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <TextField
            label="Nombre"
            value={firstName}
            disabled
            fullWidth
            size="small"
          />
          <TextField
            label="Apellido"
            value={lastName}
            disabled
            fullWidth
            size="small"
          />
        </div>
      </div>

      {/* Address form */}
      <div className="bg-white rounded-md border p-4 sm:p-6 mb-4">
        <div className="flex items-center gap-2 mb-4">
          <LocationOnIcon sx={{ fontSize: 20, color: '#2563eb' }} />
          <h2 className="text-base font-semibold text-gray-900">Dirección del Consultorio</h2>
        </div>
        <p className="text-sm text-gray-500 mb-4">
          Esta dirección se incluirá en el mensaje de WhatsApp de confirmación de turno que recibe el paciente.
        </p>

        <div className="space-y-4">
          <TextField
            label="Calle y número"
            value={street}
            onChange={(e) => setStreet(e.target.value)}
            placeholder="Ej: Av. San Martín 1234, Piso 3, Of. B"
            fullWidth
            size="small"
          />
          <TextField
            label="Ciudad / Localidad"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Ej: Mendoza, Argentina"
            fullWidth
            size="small"
          />
        </div>

        <Button
          variant="contained"
          onClick={handleSave}
          startIcon={<SaveIcon />}
          sx={{
            mt: 3,
            textTransform: 'none',
            fontWeight: 600
          }}
        >
          Guardar Cambios
        </Button>
      </div>

      {/* Info box */}
      <div className="bg-blue-50 rounded-md border border-blue-200 p-4">
        <p className="text-sm text-blue-800">
          Al completar tu dirección, tus pacientes recibirán la ubicación del consultorio en el mensaje de confirmación de turno por WhatsApp.
        </p>
      </div>
    </div>
  );
};

export default ProfilePage;
