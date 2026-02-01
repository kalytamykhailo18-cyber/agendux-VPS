import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
} from '@mui/material';
import { useAppDispatch } from '../../../store';
import { createAdminFAQ, updateAdminFAQ } from '../../../store/slices/siteContentSlice';
import type { FAQ, CreateFAQDTO } from '../../../types/site-content';

// RULE: NO form tags - use button click handlers only

interface FAQFormModalProps {
  open: boolean;
  onClose: () => void;
  faq: FAQ | null;
}

const FAQFormModal = ({ open, onClose, faq }: FAQFormModalProps) => {
  const dispatch = useAppDispatch();
  const isEditing = !!faq;

  const [formData, setFormData] = useState<CreateFAQDTO>({
    question: '',
    answer: '',
  });

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      if (faq) {
        setFormData({
          question: faq.question,
          answer: faq.answer,
        });
      } else {
        setFormData({
          question: '',
          answer: '',
        });
      }
    }
  }, [open, faq]);

  const handleChange = (field: keyof CreateFAQDTO) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSave = () => {
    if (!formData.question.trim() || !formData.answer.trim()) {
      return;
    }

    if (isEditing && faq) {
      dispatch(updateAdminFAQ({ id: faq.id, data: formData }));
    } else {
      dispatch(createAdminFAQ(formData));
    }
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{isEditing ? 'Editar Pregunta' : 'Nueva Pregunta'}</DialogTitle>
      <DialogContent>
        <div className="space-y-4 pt-2">
          <TextField
            fullWidth
            label="Pregunta"
            value={formData.question}
            onChange={handleChange('question')}
            placeholder="Ej: ¿Cómo obtengo mi link personalizado?"
            required
          />

          <TextField
            fullWidth
            label="Respuesta"
            value={formData.answer}
            onChange={handleChange('answer')}
            placeholder="Escribí la respuesta completa a la pregunta..."
            multiline
            rows={5}
            required
            helperText="Podés usar texto largo para explicar en detalle"
          />
        </div>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={!formData.question.trim() || !formData.answer.trim()}
        >
          {isEditing ? 'Guardar' : 'Crear'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FAQFormModal;
