import { useNavigate } from 'react-router-dom';
import { Button } from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import StarIcon from '@mui/icons-material/Star';

const features = [
  {
    icon: <AccessTimeIcon sx={{ fontSize: 28 }} />,
    iconBg: 'bg-blue-100 text-blue-600',
    title: 'Ahorrá tiempo todos los días.',
    description: 'Basta de confirmar turnos y responder mensajes. Recordatorios automáticos por WhatsApp con confirmación en un solo clic.',
    animation: 'fade-up-fast'
  },
  {
    icon: <AttachMoneyIcon sx={{ fontSize: 28 }} />,
    iconBg: 'bg-green-100 text-green-600',
    title: 'Ganás más dinero.',
    description: 'Reducí los olvidos y cancelaciones de último momento → agenda más llena, más turnos atendidos y más ingresos sin trabajo extra.',
    animation: 'fade-down-fast'
  },
  {
    icon: <QrCode2Icon sx={{ fontSize: 28 }} />,
    iconBg: 'bg-purple-100 text-purple-600',
    title: 'Compartís fácil y gratis.',
    description: 'Te damos tu link personalizado (agendux.com/tunombre) y tu QR listo para usar. Ponelo en tu estado de WhatsApp, en Instagram, Facebook o pegalo en tu web actual y en tu sala de espera. Tus pacientes reservan solos 24/7.',
    animation: 'fade-right-fast'
  },
  {
    icon: <StarIcon sx={{ fontSize: 28 }} />,
    iconBg: 'bg-yellow-100 text-yellow-600',
    title: 'Te ven más profesional.',
    description: 'Sistema moderno, organizado y en tiempo real. Tus pacientes notan la diferencia: más confianza, más recomendaciones y más fidelidad.',
    animation: 'fade-left-fast'
  }
];

const FeaturesSection = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-gray-50 py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 fade-down-fast">
            ¿Por qué miles de profesionales como vos eligen Agendux?
          </h2>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto fade-up-normal">
            Más ingresos, menos estrés y pacientes más felices —todo automático y súper fácil.
          </p>
        </div>

        {/* Cards Grid - 4 columns on desktop, 2 on tablet, 1 on mobile */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`rounded-md bg-white p-6 shadow-sm hover:shadow-md transition-shadow ${feature.animation}`}
            >
              <div className={`flex h-14 w-14 items-center justify-center rounded-md ${feature.iconBg} zoom-in-fast`}>
                {feature.icon}
              </div>
              <h3 className="mt-4 text-lg font-semibold text-gray-900">{feature.title}</h3>
              <p className="mt-2 text-sm text-gray-600 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-12 text-center">
          <Button
            variant="contained"
            onClick={() => navigate('/register')}
            sx={{
              textTransform: 'none',
              px: 4,
              py: 1.5,
              fontSize: '1rem',
              fontWeight: 600,
            }}
            className="fade-up-fast"
          >
            Obtené tu Link y QR Gratis
          </Button>
          <p className="mt-3 text-sm text-gray-500 fade-up-normal">
            Sin tarjeta, sin compromiso. Probalo gratis 14 días.
          </p>
        </div>
      </div>
    </div>
  );
};

export default FeaturesSection;
