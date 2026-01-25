import { Button } from '@mui/material';

interface HeroSectionProps {
  onStartFree: () => void;
}

const HeroSection = ({ onStartFree }: HeroSectionProps) => {
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

        {/* Hero Headline */}
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl md:text-5xl fade-down-fast">
          Dejá de perder tiempo dando turnos por mensajes y llamadas
        </h1>

        {/* Subheadline 1 */}
        <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600 zoom-in-normal">
          Tus pacientes reservan solos, las 24 horas, con tu link personalizado
        </p>
        <p className="mx-auto mt-2 text-xl text-blue-600 font-semibold fade-up-fast">
          agendux.com/tunombre
        </p>
        <p className="mx-auto mt-2 max-w-xl text-base text-gray-600 fade-up-normal">
          o con el código QR listo para usar que te damos gratis.
        </p>

        {/* Subheadline 2 */}
        <p className="mx-auto mt-6 max-w-2xl text-base text-gray-700 zoom-in-fast">
          Recordatorios automáticos por WhatsApp + agenda sincronizada con Google Calendar.
        </p>
        <p className="mx-auto mt-2 max-w-2xl text-base text-gray-600 fade-up-fast">
          Ahorrá tiempo todos los días y ganá más dinero: <span className="text-green-600 font-semibold">reducí hasta un 75% los olvidos y cancelaciones de última hora.</span>
        </p>

        {/* CTA Button */}
        <div className="mt-10 flex flex-col items-center justify-center gap-3">
          <Button
            variant="contained"
            onClick={onStartFree}
            sx={{
              width: { xs: '100%', sm: 'auto' },
              textTransform: 'none',
              px: 5,
              py: 1.75,
              fontSize: '1.125rem',
              fontWeight: 600,
            }}
            className="fade-up-fast"
          >
            Comenzar Gratis - Sin Tarjeta
          </Button>

          {/* Text below CTA */}
          <p className="text-sm text-gray-500 fade-up-normal">
            Obtené tu link y tu QR en minutos. Empezá hoy mismo sin complicaciones.
          </p>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
