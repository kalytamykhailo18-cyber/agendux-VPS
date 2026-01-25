import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import BarChartIcon from '@mui/icons-material/BarChart';
import SmartphoneIcon from '@mui/icons-material/Smartphone';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';

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
    icon: <WhatsAppIcon sx={{ fontSize: 24, color: '#FFFFFF' }} />,
    iconBg: 'bg-[#25D366]',
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
