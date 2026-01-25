import { Button } from '@mui/material';

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
          <div className="flex items-center justify-center zoom-in-fast">
            <svg viewBox="0 0 200 200" className="w-12 h-12 sm:w-14 sm:h-14">
              <defs>
                <clipPath id="calClipHero">
                  <path d="M32 0 H168 Q200 0 200 32 V150 L150 200 H32 Q0 200 0 168 V32 Q0 0 32 0 Z"/>
                </clipPath>
              </defs>
              <g clipPath="url(#calClipHero)">
                {/* Blue background */}
                <rect x="0" y="0" width="200" height="200" fill="#4285F4"/>
                {/* Dark blue top-right */}
                <rect x="150" y="0" width="50" height="50" fill="#1967D2"/>
                {/* Yellow right side */}
                <rect x="150" y="50" width="50" height="100" fill="#FBBC04"/>
                {/* Light green bottom */}
                <rect x="50" y="150" width="100" height="50" fill="#34A853"/>
                {/* Dark green bottom-left */}
                <rect x="0" y="150" width="50" height="50" fill="#188038"/>
                {/* Red bottom-right folded corner */}
                <polygon points="150,150 200,150 150,200" fill="#EA4335"/>
                {/* White center */}
                <rect x="50" y="50" width="100" height="100" fill="#FFFFFF"/>
                {/* 31 text */}
                <text x="100" y="128" textAnchor="middle" fontSize="72" fontWeight="400" fill="#1a73e8" fontFamily="Google Sans, Arial, sans-serif">31</text>
              </g>
            </svg>
          </div>

          {/* Gear Icon - Connecting element */}
          <div className="flex items-center justify-center w-22 h-22 sm:w-28 sm:h-28 zoom-in-normal">
            <img src="/gear.gif" alt="Sync" className="w-22 h-22 sm:w-28 sm:h-28" />
          </div>

          {/* WhatsApp Logo */}
          <div className="flex items-center justify-center zoom-in-fast">
            <img
              src="/WhatsApp.png"
              alt="WhatsApp"
              className="w-12 h-12 sm:w-14 sm:h-14"
              style={{ filter: 'drop-shadow(2px 3px 3px rgba(0,0,0,0.3))' }}
            />
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
