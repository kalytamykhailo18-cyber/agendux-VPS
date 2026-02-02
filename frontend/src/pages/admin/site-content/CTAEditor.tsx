import { useEffect, useState } from 'react';
import { Button, TextField } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import { useAppDispatch, useAppSelector } from '../../../store';
import { getAdminCTA, updateAdminCTA } from '../../../store/slices/siteContentSlice';
import type { CTAContent } from '../../../types/site-content';

// RULE: NO form tags - use button click handlers only
// RULE: All API calls through Redux

const CTAEditor = () => {
  const dispatch = useAppDispatch();
  const { adminCTA } = useAppSelector((state) => state.siteContent);

  const [formData, setFormData] = useState<CTAContent>({
    title: '',
    subtitle: '',
    buttonText: '',
    subtext: '',
  });

  // Load data on mount
  useEffect(() => {
    dispatch(getAdminCTA());
  }, [dispatch]);

  // Update form when data loads
  useEffect(() => {
    if (adminCTA) {
      setFormData(adminCTA);
    }
  }, [adminCTA]);

  const handleChange = (field: keyof CTAContent) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSave = () => {
    dispatch(updateAdminCTA(formData));
  };

  return (
    <div className="bg-white rounded-md shadow p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Sección CTA Final</h2>
      <p className="text-sm text-gray-500 mb-6">
        El CTA (Call to Action) final es la última sección antes del footer,
        diseñada para convertir visitantes en usuarios.
      </p>

      <div className="flex flex-col gap-6">
        <TextField
          fullWidth
          label="Título"
          value={formData.title}
          onChange={handleChange('title')}
          placeholder="Ej: ¿Listo para dejar de perder tiempo..."
          helperText="El título principal de la sección CTA"
        />

        <TextField
          fullWidth
          label="Subtítulo"
          value={formData.subtitle}
          onChange={handleChange('subtitle')}
          placeholder="Ej: Obtené tu link y QR en minutos..."
          helperText="Texto descriptivo debajo del título"
          multiline
          rows={2}
        />

        <TextField
          fullWidth
          label="Texto del Botón"
          value={formData.buttonText}
          onChange={handleChange('buttonText')}
          placeholder="Ej: Comenzar Gratis - Sin Tarjeta"
          helperText="El texto del botón de acción"
        />

        <TextField
          fullWidth
          label="Texto Secundario"
          value={formData.subtext}
          onChange={handleChange('subtext')}
          placeholder="Ej: 14 días de prueba gratis • Sin compromiso..."
          helperText="Texto pequeño debajo del botón"
        />
      </div>

      <div className="mt-6 flex justify-end">
        <Button
          variant="contained"
          color="primary"
          startIcon={<SaveIcon />}
          onClick={handleSave}
        >
          Guardar Cambios
        </Button>
      </div>
    </div>
  );
};

export default CTAEditor;
