import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import BarChartIcon from '@mui/icons-material/BarChart';
import SmartphoneIcon from '@mui/icons-material/Smartphone';

const WhatsAppIcon = () => (
  <svg viewBox="0 0 100 100" className="w-6 h-6" style={{ filter: 'drop-shadow(1px 2px 2px rgba(0,0,0,0.3))' }}>
    <defs>
      <linearGradient id="waGradientFeature" x1="50%" y1="100%" x2="50%" y2="0%">
        <stop offset="0%" stopColor="#20B038"/>
        <stop offset="100%" stopColor="#60D66A"/>
      </linearGradient>
    </defs>
    <circle cx="50" cy="50" r="48" fill="#B3B3B3"/>
    <circle cx="50" cy="50" r="42" fill="#FFFFFF"/>
    <circle cx="50" cy="50" r="35" fill="url(#waGradientFeature)"/>
    <path fill="#FFFFFF" transform="translate(50, 50) scale(0.4) translate(-50, -50)" d="M50 20c-2.5 0-5 1-7 3-2.4 2.4-5.8 7-5.8 17s6 20 7 21.5c.8 1.4 11.7 18.7 28.7 26.2 14.2 6.1 17 5 20.2 4.7 3.2-.3 10.2-4.2 11.7-8.2 1.5-4 1.5-7.5 1-8.2-.5-.7-1.7-1.1-3.5-2-1.8-.8-10.9-5.3-12.5-6-1.7-.7-2.8-1-4 1-1.4 2-5 6-6.1 7.2-1.1 1.4-2.2 1.5-4 .5-1.8-.8-7.7-2.8-14.5-9-5.3-4.9-9-10.7-10-12.5-1-1.8-.1-2.8.8-3.6.8-.8 1.8-2 2.8-3 .8-1 1.1-1.7 1.8-2.8.7-1.1.3-2.2-.2-3-.5-.8-4.2-10-5.7-13.7-1.5-3.6-3.1-3.2-4.2-3.2-1 0-2.4-.1-3.6-.1z"/>
  </svg>
);

const GoogleCalendarIcon = () => (
  <svg viewBox="0 0 200 200" className="w-6 h-6">
    <defs>
      <clipPath id="calClipFeature">
        <path d="M32 0 H168 Q200 0 200 32 V150 L150 200 H32 Q0 200 0 168 V32 Q0 0 32 0 Z"/>
      </clipPath>
    </defs>
    <g clipPath="url(#calClipFeature)">
      <rect x="0" y="0" width="200" height="200" fill="#4285F4"/>
      <rect x="150" y="0" width="50" height="50" fill="#1967D2"/>
      <rect x="150" y="50" width="50" height="100" fill="#FBBC04"/>
      <rect x="50" y="150" width="100" height="50" fill="#34A853"/>
      <rect x="0" y="150" width="50" height="50" fill="#188038"/>
      <polygon points="150,150 200,150 150,200" fill="#EA4335"/>
      <rect x="50" y="50" width="100" height="100" fill="#FFFFFF"/>
      <text x="100" y="128" textAnchor="middle" fontSize="72" fontWeight="400" fill="#1a73e8" fontFamily="Google Sans, Arial, sans-serif">31</text>
    </g>
  </svg>
);

const features = [
  {
    icon: <CalendarMonthIcon sx={{ fontSize: 24 }} />,
    iconBg: 'bg-blue-100 text-blue-600',
    title: 'Agenda Online 24/7',
    description: 'Tus pacientes pueden reservar citas en cualquier momento desde cualquier dispositivo.',
    animation: 'fade-up-fast'
  },
  {
    icon: <WhatsAppIcon />,
    iconBg: 'bg-green-50',
    title: 'Recordatorios WhatsApp',
    description: 'Recordatorios automáticos vía WhatsApp para reducir ausencias y cancelaciones.',
    animation: 'fade-down-fast'
  },
  {
    icon: <GoogleCalendarIcon />,
    iconBg: 'bg-blue-50',
    title: 'Sincronización Google Calendar',
    description: 'Sincronización bidireccional en tiempo real con tu Google Calendar.',
    animation: 'fade-right-fast'
  },
  {
    icon: <AttachMoneyIcon sx={{ fontSize: 24 }} />,
    iconBg: 'bg-yellow-100 text-yellow-600',
    title: 'Cobro de Señas (Opcional)',
    description: 'Si lo deseas, podés cobrar una seña para confirmar reservas y reducir ausencias.',
    animation: 'fade-left-normal'
  },
  {
    icon: <BarChartIcon sx={{ fontSize: 24 }} />,
    iconBg: 'bg-red-100 text-red-600',
    title: 'Estadísticas',
    description: 'Visualiza tus métricas de citas, confirmaciones y cancelaciones.',
    animation: 'zoom-in-normal'
  },
  {
    icon: <SmartphoneIcon sx={{ fontSize: 24 }} />,
    iconBg: 'bg-indigo-100 text-indigo-600',
    title: 'Diseño Mobile-First',
    description: 'Funciona perfectamente en celulares, tablets y computadoras.',
    animation: 'fade-right-normal'
  }
];

const FeaturesSection = () => {
  return (
    <div className="bg-white py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 fade-down-fast">
            Todo lo que necesitas para automatizar tu agenda
          </h2>
          <p className="mt-4 text-lg text-gray-600 fade-up-normal">
            Ahorra tiempo y reduce las ausencias con nuestra plataforma completa
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <div key={index} className={`rounded-xl bg-gray-50 p-6 ${feature.animation}`}>
              <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${feature.iconBg} zoom-in-fast`}>
                {feature.icon}
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900 fade-right-fast">{feature.title}</h3>
              <p className="mt-2 text-gray-600 fade-left-fast">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FeaturesSection;
