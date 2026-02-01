import { Button } from '@mui/material';
import { useAppSelector } from '../../../store';

// RULE: All data through Redux - useSelector reads data
// RULE: NO direct API calls from components

interface CTASectionProps {
  onRegister: () => void;
}

const CTASection = ({ onRegister }: CTASectionProps) => {
  const { content } = useAppSelector((state) => state.siteContent);
  const cta = content?.cta;

  // Use CMS content or fallback to defaults
  const title = cta?.title || '¿Listo para dejar de perder tiempo con los turnos?';
  const subtitle = cta?.subtitle || 'Obtené tu link y QR en minutos. Empezá hoy mismo sin complicaciones.';
  const buttonText = cta?.buttonText || 'Comenzar Gratis - Sin Tarjeta';
  const subtext = cta?.subtext || '14 días de prueba gratis • Sin compromiso • Cancelá cuando quieras';

  return (
    <div className="bg-blue-600 py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-2xl sm:text-3xl font-bold text-white fade-down-fast">
          {title}
        </h2>
        <p className="mt-4 text-lg text-blue-100 max-w-2xl mx-auto fade-up-normal">
          {subtitle}
        </p>
        <Button
          variant="contained"
          onClick={onRegister}
          sx={{
            mt: 4,
            bgcolor: 'white',
            color: 'primary.main',
            textTransform: 'none',
            px: 5,
            py: 1.5,
            fontSize: '1.1rem',
            fontWeight: 600,
            '&:hover': {
              bgcolor: 'grey.100',
            },
          }}
          className="zoom-in-slow"
        >
          {buttonText}
        </Button>
        <p className="mt-4 text-sm text-blue-200 fade-up-normal">
          {subtext}
        </p>
      </div>
    </div>
  );
};

export default CTASection;
