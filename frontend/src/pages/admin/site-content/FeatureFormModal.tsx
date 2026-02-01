import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { useAppDispatch } from '../../../store';
import { createAdminFeature, updateAdminFeature } from '../../../store/slices/siteContentSlice';
import type { Feature, CreateFeatureDTO } from '../../../types/site-content';

// RULE: NO form tags - use button click handlers only

// Available icons from MUI
const AVAILABLE_ICONS = [
  { value: 'AccessTime', label: 'Reloj (AccessTime)' },
  { value: 'AttachMoney', label: 'Dinero (AttachMoney)' },
  { value: 'QrCode2', label: 'Código QR (QrCode2)' },
  { value: 'Star', label: 'Estrella (Star)' },
  { value: 'CalendarMonth', label: 'Calendario (CalendarMonth)' },
  { value: 'Autorenew', label: 'Renovar (Autorenew)' },
  { value: 'CheckCircle', label: 'Check (CheckCircle)' },
  { value: 'Notifications', label: 'Notificaciones (Notifications)' },
  { value: 'Security', label: 'Seguridad (Security)' },
  { value: 'Speed', label: 'Velocidad (Speed)' },
  { value: 'Support', label: 'Soporte (Support)' },
  { value: 'TrendingUp', label: 'Crecimiento (TrendingUp)' },
];

interface FeatureFormModalProps {
  open: boolean;
  onClose: () => void;
  feature: Feature | null;
}

const FeatureFormModal = ({ open, onClose, feature }: FeatureFormModalProps) => {
  const dispatch = useAppDispatch();
  const isEditing = !!feature;

  const [formData, setFormData] = useState<CreateFeatureDTO>({
    icon: 'Star',
    title: '',
    description: '',
  });

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      if (feature) {
        setFormData({
          icon: feature.icon,
          title: feature.title,
          description: feature.description,
        });
      } else {
        setFormData({
          icon: 'Star',
          title: '',
          description: '',
        });
      }
    }
  }, [open, feature]);

  const handleChange = (field: keyof CreateFeatureDTO) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | { target: { value: string } }
  ) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSave = () => {
    if (!formData.title.trim() || !formData.description.trim()) {
      return;
    }

    if (isEditing && feature) {
      dispatch(updateAdminFeature({ id: feature.id, data: formData }));
    } else {
      dispatch(createAdminFeature(formData));
    }
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{isEditing ? 'Editar Feature' : 'Nuevo Feature'}</DialogTitle>
      <DialogContent>
        <div className="space-y-4 pt-2">
          <FormControl fullWidth>
            <InputLabel>Ícono</InputLabel>
            <Select
              value={formData.icon}
              label="Ícono"
              onChange={(e) => handleChange('icon')({ target: { value: e.target.value } })}
            >
              {AVAILABLE_ICONS.map((icon) => (
                <MenuItem key={icon.value} value={icon.value}>
                  {icon.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            fullWidth
            label="Título"
            value={formData.title}
            onChange={handleChange('title')}
            placeholder="Ej: Sin más llamadas ni WhatsApp"
            required
          />

          <TextField
            fullWidth
            label="Descripción"
            value={formData.description}
            onChange={handleChange('description')}
            placeholder="Ej: Tus pacientes reservan solos desde tu link..."
            multiline
            rows={3}
            required
          />
        </div>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={!formData.title.trim() || !formData.description.trim()}
        >
          {isEditing ? 'Guardar' : 'Crear'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FeatureFormModal;
