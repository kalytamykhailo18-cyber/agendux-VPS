import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Rating,
} from '@mui/material';
import type { Testimonial, CreateTestimonialData } from '../../../store/slices/testimonialSlice';

// RULE: Dialog uses MUI (combines layout + interactivity), inputs use MUI

interface TestimonialFormModalProps {
  isOpen: boolean;
  testimonial: Testimonial | null;
  onClose: () => void;
  onSave: (data: CreateTestimonialData) => void;
}

const TestimonialFormModal = ({
  isOpen,
  testimonial,
  onClose,
  onSave,
}: TestimonialFormModalProps) => {
  const [formData, setFormData] = useState<CreateTestimonialData>({
    name: '',
    profession: '',
    rating: 5,
    review: '',
    photo: '',
  });

  // Load testimonial data when editing
  useEffect(() => {
    if (testimonial) {
      setFormData({
        name: testimonial.name,
        profession: testimonial.profession,
        rating: testimonial.rating,
        review: testimonial.review,
        photo: testimonial.photo || '',
      });
    } else {
      setFormData({
        name: '',
        profession: '',
        rating: 5,
        review: '',
        photo: '',
      });
    }
  }, [testimonial, isOpen]);

  const handleSave = () => {
    // Validation
    if (!formData.name.trim() || !formData.profession.trim() || !formData.review.trim()) {
      alert('Por favor completa todos los campos obligatorios');
      return;
    }

    if (formData.review.length < 10) {
      alert('La reseña debe tener al menos 10 caracteres');
      return;
    }

    onSave(formData);
  };

  return (
    <Dialog open={isOpen} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{testimonial ? 'Editar Testimonio' : 'Nuevo Testimonio'}</DialogTitle>

      <DialogContent>
        <div className="space-y-4 pt-2">
          {/* Name */}
          <TextField
            fullWidth
            label="Nombre"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            helperText="Nombre completo del profesional"
          />

          {/* Profession */}
          <TextField
            fullWidth
            label="Profesión"
            value={formData.profession}
            onChange={(e) => setFormData({ ...formData, profession: e.target.value })}
            required
            helperText="Ej: Psicóloga, Nutricionista, Odontólogo"
          />

          {/* Rating */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Calificación
            </label>
            <Rating
              value={formData.rating}
              onChange={(_, newValue) => {
                if (newValue) setFormData({ ...formData, rating: newValue });
              }}
              size="large"
            />
          </div>

          {/* Review */}
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Reseña"
            value={formData.review}
            onChange={(e) => setFormData({ ...formData, review: e.target.value })}
            required
            helperText={`${formData.review.length} caracteres (mínimo 10)`}
          />

          {/* Photo URL (optional) */}
          <TextField
            fullWidth
            label="URL de Foto (opcional)"
            value={formData.photo}
            onChange={(e) => setFormData({ ...formData, photo: e.target.value })}
            helperText="URL de la imagen del profesional (opcional)"
            placeholder="https://ejemplo.com/foto.jpg"
          />
        </div>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} sx={{ textTransform: 'none' }}>
          Cancelar
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          sx={{ textTransform: 'none' }}
        >
          {testimonial ? 'Guardar Cambios' : 'Crear Testimonio'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TestimonialFormModal;
