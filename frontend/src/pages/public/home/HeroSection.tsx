import { Button } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';

interface HeroSectionProps {
  onStartFree: () => void;
  onAdminAccess: () => void;
}

const HeroSection = ({ onStartFree, onAdminAccess }: HeroSectionProps) => {
  return (
    <div className="mx-auto max-w-7xl px-4 pt-12 pb-24 sm:px-6 lg:px-8">
      <div className="text-center">
        {/* Integration Visual - Google Calendar + Gear + WhatsApp */}
        <div className="flex items-center justify-center gap-3 sm:gap-4 mb-8 fade-down-fast">
          {/* Google Calendar Logo */}
          <div className="flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-white rounded-xl shadow-lg zoom-in-fast">
            <svg viewBox="0 0 24 24" className="w-8 h-8 sm:w-10 sm:h-10">
              <path fill="#4285F4" d="M22 6c0-1.1-.9-2-2-2h-4V2h-2v2h-4V2H8v2H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6z"/>
              <path fill="#FFFFFF" d="M4 8h16v12H4z"/>
              <path fill="#EA4335" d="M8 14h2v2H8z"/>
              <path fill="#FBBC05" d="M8 10h2v2H8z"/>
              <path fill="#34A853" d="M12 14h2v2h-2z"/>
              <path fill="#4285F4" d="M12 10h2v2h-2z"/>
              <path fill="#EA4335" d="M16 10h2v2h-2z"/>
            </svg>
          </div>

          {/* Gear Icon - Connecting element */}
          <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-blue-600 rounded-full shadow-md zoom-in-normal">
            <SettingsIcon sx={{ color: 'white', fontSize: { xs: 24, sm: 28 } }} className="animate-spin-slow" />
          </div>

          {/* WhatsApp Logo */}
          <div className="flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-white rounded-xl shadow-lg zoom-in-fast">
            <svg viewBox="0 0 24 24" className="w-8 h-8 sm:w-10 sm:h-10">
              <path fill="#25D366" d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
          </div>
        </div>

        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
          <span className="block fade-down-fast">Gestiona tus citas</span>
          <span className="block text-blue-600 fade-up-normal">de forma automática</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600 zoom-in-normal">
          Plataforma completa para profesionales independientes. Agenda online 24/7,
          recordatorios automáticos por WhatsApp, sincronización con Google Calendar y más.
        </p>
        <p className="mx-auto mt-3 max-w-xl text-base text-primary font-medium fade-up-fast">
          Obtené tu página personalizada: agendux.com/tu-nombre
        </p>
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button
            variant="contained"
            onClick={onStartFree}
            sx={{
              width: { xs: '100%', sm: 'auto' },
              textTransform: 'none',
              px: 4,
              py: 1.5,
              fontSize: '1rem',
            }}
            className="fade-left-fast"
          >
            Comenzar Gratis
          </Button>
          <Button
            variant="outlined"
            onClick={onAdminAccess}
            sx={{
              width: { xs: '100%', sm: 'auto' },
              textTransform: 'none',
              px: 4,
              py: 1.5,
              fontSize: '1rem',
            }}
            className="fade-right-fast"
          >
            Acceso Admin
          </Button>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
