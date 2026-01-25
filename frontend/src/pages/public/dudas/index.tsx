import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, TextField, CircularProgress } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import api from '../../../config/api';

interface FormData {
  nombre: string;
  apellido: string;
  whatsapp: string;
  email: string;
  pregunta: string;
}

interface FormErrors {
  nombre?: string;
  apellido?: string;
  whatsapp?: string;
  email?: string;
  pregunta?: string;
}

const DudasPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({
    nombre: '',
    apellido: '',
    whatsapp: '',
    email: '',
    pregunta: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido';
    }

    if (!formData.apellido.trim()) {
      newErrors.apellido = 'El apellido es requerido';
    }

    if (!formData.whatsapp.trim()) {
      newErrors.whatsapp = 'El número de WhatsApp es requerido';
    } else if (!/^[\d\s+()-]+$/.test(formData.whatsapp)) {
      newErrors.whatsapp = 'Ingresá un número válido';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'El correo electrónico es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Ingresá un correo válido';
    }

    if (!formData.pregunta.trim()) {
      newErrors.pregunta = 'Por favor escribí tu pregunta';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field: keyof FormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await api.post('/contact/inquiry', formData);
      setIsSubmitted(true);
    } catch (error) {
      console.error('Error sending inquiry:', error);
      setErrors({ pregunta: 'Hubo un error al enviar. Por favor intentá de nuevo.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="max-w-lg mx-auto px-4 py-12">
        <div className="bg-white rounded-md shadow-sm p-8 text-center">
          <CheckCircleIcon sx={{ fontSize: 64, color: '#22c55e' }} />
          <h2 className="text-2xl font-bold text-gray-900 mt-4">
            Recibimos tu consulta
          </h2>
          <p className="text-gray-600 mt-2">
            Te responderemos a la brevedad a tu correo electrónico o WhatsApp.
          </p>
          <Button
            variant="contained"
            onClick={() => navigate('/')}
            sx={{ mt: 4, textTransform: 'none' }}
          >
            Volver al inicio
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <div className="bg-white rounded-md shadow-sm p-6 sm:p-8">
        <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">
          ¿Tenés dudas?
        </h1>
        <p className="text-gray-600 text-center mb-6">
          Completá el formulario y te respondemos a la brevedad.
        </p>

        <div className="space-y-4 flex flex-col gap-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <TextField
              label="Nombre"
              value={formData.nombre}
              onChange={handleChange('nombre')}
              error={!!errors.nombre}
              helperText={errors.nombre}
              fullWidth
              size="small"
            />
            <TextField
              label="Apellido"
              value={formData.apellido}
              onChange={handleChange('apellido')}
              error={!!errors.apellido}
              helperText={errors.apellido}
              fullWidth
              size="small"
            />
          </div>

          <TextField
            label="Número de WhatsApp"
            value={formData.whatsapp}
            onChange={handleChange('whatsapp')}
            error={!!errors.whatsapp}
            helperText={errors.whatsapp}
            placeholder="+54 9 11 1234-5678"
            fullWidth
            size="small"
          />

          <TextField
            label="Correo electrónico"
            type="email"
            value={formData.email}
            onChange={handleChange('email')}
            error={!!errors.email}
            helperText={errors.email}
            fullWidth
            size="small"
          />

          <TextField
            label="Tu pregunta"
            value={formData.pregunta}
            onChange={handleChange('pregunta')}
            error={!!errors.pregunta}
            helperText={errors.pregunta}
            multiline
            rows={4}
            fullWidth
            placeholder="Escribí tu consulta acá..."
          />

          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={isSubmitting}
            fullWidth
            sx={{
              mt: 2,
              py: 1.5,
              textTransform: 'none',
              fontSize: '1rem',
            }}
          >
            {isSubmitting ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              'Enviar consulta'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DudasPage;
