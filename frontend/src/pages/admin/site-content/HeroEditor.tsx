import { useEffect, useState } from 'react';
import { Button, TextField } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import { useAppDispatch, useAppSelector } from '../../../store';
import { getAdminHero, updateAdminHero } from '../../../store/slices/siteContentSlice';
import type { HeroContent } from '../../../types/site-content';

// RULE: NO form tags - use button click handlers only
// RULE: All API calls through Redux

const HeroEditor = () => {
  const dispatch = useAppDispatch();
  const { adminHero } = useAppSelector((state) => state.siteContent);

  const [formData, setFormData] = useState<HeroContent>({
    title: '',
    subtitle: '',
    linkExample: '',
    ctaButtonText: '',
    ctaSubtext: '',
  });

  // Load data on mount
  useEffect(() => {
    dispatch(getAdminHero());
  }, [dispatch]);

  // Update form when data loads
  useEffect(() => {
    if (adminHero) {
      setFormData(adminHero);
    }
  }, [adminHero]);

  const handleChange = (field: keyof HeroContent) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSave = () => {
    dispatch(updateAdminHero(formData));
  };

  return (
    <div className="bg-white rounded-md shadow p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Sección Hero</h2>
      <p className="text-sm text-gray-500 mb-6">
        El Hero es la primera sección que ven los visitantes en la landing page.
      </p>

      <div className="flex flex-col gap-6">
        <TextField
          fullWidth
          label="Título Principal"
          value={formData.title}
          onChange={handleChange('title')}
          placeholder="Ej: Dejá de perder tiempo dando turnos..."
          helperText="El título principal que aparece en grande"
        />

        <TextField
          fullWidth
          label="Subtítulo"
          value={formData.subtitle}
          onChange={handleChange('subtitle')}
          placeholder="Ej: Tu link personalizado + código QR..."
          helperText="Texto descriptivo debajo del título"
          multiline
          rows={2}
        />

        <TextField
          fullWidth
          label="Ejemplo de Link"
          value={formData.linkExample}
          onChange={handleChange('linkExample')}
          placeholder="Ej: agendux.com/tunombre"
          helperText="El ejemplo de link que se muestra destacado"
        />

        <TextField
          fullWidth
          label="Texto del Botón CTA"
          value={formData.ctaButtonText}
          onChange={handleChange('ctaButtonText')}
          placeholder="Ej: Comenzar Gratis - Sin Tarjeta"
          helperText="El texto del botón principal de llamada a la acción"
        />

        <TextField
          fullWidth
          label="Texto Secundario del CTA"
          value={formData.ctaSubtext}
          onChange={handleChange('ctaSubtext')}
          placeholder="Ej: 14 días de prueba gratis • Obtené tu link..."
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

export default HeroEditor;
