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
            <svg viewBox="0 0 140 140" className="w-12 h-12 sm:w-14 sm:h-14" style={{ filter: 'drop-shadow(2px 3px 3px rgba(0,0,0,0.3))' }}>
              <defs>
                <linearGradient id="whatsappGradientHero" x1="50%" y1="100%" x2="50%" y2="0%">
                  <stop offset="0%" stopColor="#20B038"/>
                  <stop offset="100%" stopColor="#60D66A"/>
                </linearGradient>
              </defs>
              {/* Gray outer border */}
              <path fill="#B3B3B3" d="M70 2C35.2 2 7 30.2 7 65c0 12.5 3.6 24.1 9.9 33.9L2 130l31.8-10.2C43.5 126.3 56.2 130 70 130c34.8 0 63-28.2 63-65S104.8 2 70 2z"/>
              {/* White bold border */}
              <path fill="#FFFFFF" d="M70 12C40.7 12 17 35.7 17 65c0 11 3.3 21.2 9 29.7L14 122l28-9C50.2 118.5 59.7 122 70 122c29.3 0 53-23.7 53-57S99.3 12 70 12z"/>
              {/* Green background */}
              <path fill="url(#whatsappGradientHero)" d="M70 26C48.5 26 31 43.5 31 65c0 9.5 3.4 18.2 9 25L31 112l22.5-7.2C60 109.2 64.8 111 70 111c21.5 0 39-17.5 39-46S91.5 26 70 26z"/>
              {/* White phone icon - centered */}
              <path fill="#FFFFFF" d="M53 42c-1.8 0-3.6.7-5 2.2-1.7 1.7-4.2 5-4.2 12.3s4.3 14.4 5 15.4c.6 1 8.4 13.4 20.6 18.8 10.2 4.4 12.2 3.6 14.5 3.4 2.3-.2 7.3-3 8.4-5.9 1.1-2.9 1.1-5.4.7-5.9-.4-.5-1.2-.8-2.5-1.4-1.3-.6-7.8-3.8-9-4.3-1.2-.5-2-.7-3 .7-1 1.4-3.6 4.3-4.4 5.2-.8 1-1.6 1.1-2.9.4-1.3-.6-5.5-2-10.4-6.5-3.8-3.5-6.5-7.7-7.2-9-.7-1.3-.1-2 .6-2.6.6-.6 1.3-1.4 2-2.2.6-.7.8-1.2 1.3-2 .5-.8.2-1.6-.1-2.2-.4-.6-3-7.2-4.1-9.8-1.1-2.6-2.2-2.3-3-2.3-.7 0-1.7-.1-2.6-.1z"/>
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
