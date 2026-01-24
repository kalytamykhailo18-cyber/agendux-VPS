import { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Rating,
  CircularProgress,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import type { Testimonial, CreateTestimonialData } from '../../../store/slices/testimonialSlice';

// RULE: Dialog uses MUI (combines layout + interactivity), inputs use MUI

interface TestimonialFormModalProps {
  isOpen: boolean;
  testimonial: Testimonial | null;
  onClose: () => void;
  onSave: (data: CreateTestimonialData) => Promise<void>;
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
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file upload - convert to base64
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona un archivo de imagen');
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert('La imagen debe ser menor a 2MB');
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData({ ...formData, photo: reader.result as string });
      setIsUploading(false);
    };
    reader.onerror = () => {
      alert('Error al cargar la imagen');
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

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
    setIsSaving(false);
  }, [testimonial, isOpen]);

  const handleSave = async () => {
    // Validation
    if (!formData.name.trim() || !formData.profession.trim() || !formData.review.trim()) {
      alert('Por favor completa todos los campos obligatorios');
      return;
    }

    if (formData.review.length < 10) {
      alert('La reseña debe tener al menos 10 caracteres');
      return;
    }

    setIsSaving(true);
    try {
      await onSave(formData);
    } finally {
      setIsSaving(false);
    }
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

          {/* Photo (optional) */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Foto (opcional)
            </label>

            {/* Photo preview or upload spinner */}
            {isUploading ? (
              <div className="mb-3 w-20 h-20 rounded-full border-2 border-gray-200 flex items-center justify-center bg-gray-50">
                <CircularProgress size={32} />
              </div>
            ) : formData.photo ? (
              <div className="mb-3 relative inline-block">
                <img
                  src={formData.photo}
                  alt="Preview"
                  className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
                />
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, photo: '' })}
                  className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center hover:bg-red-600"
                >
                  ×
                </button>
              </div>
            ) : null}

            {/* Upload button */}
            <div className="flex items-center gap-3">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept="image/*"
                className="hidden"
              />
              <Button
                variant="outlined"
                size="small"
                startIcon={isUploading ? <CircularProgress size={16} /> : <CloudUploadIcon />}
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                sx={{ textTransform: 'none' }}
              >
                {isUploading ? 'Cargando...' : 'Subir imagen'}
              </Button>
              <span className="text-xs text-gray-500">
                Máximo 2MB (JPG, PNG)
              </span>
            </div>

            {/* URL input as alternative */}
            <TextField
              fullWidth
              size="small"
              label="O pegar URL de imagen"
              value={formData.photo?.startsWith('data:') ? '' : formData.photo}
              onChange={(e) => setFormData({ ...formData, photo: e.target.value })}
              placeholder="https://ejemplo.com/foto.jpg"
              sx={{ mt: 2 }}
              helperText="Puedes subir una imagen o pegar una URL directamente"
            />
          </div>
        </div>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={isSaving} sx={{ textTransform: 'none' }}>
          Cancelar
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={isSaving}
          startIcon={isSaving ? <CircularProgress size={16} color="inherit" /> : undefined}
          sx={{ textTransform: 'none' }}
        >
          {isSaving ? 'Guardando...' : (testimonial ? 'Guardar Cambios' : 'Crear Testimonio')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TestimonialFormModal;
