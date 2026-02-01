import { useNavigate } from 'react-router-dom';
import { Button } from '@mui/material';
import { useAppSelector } from '../../../store';
import { getIconComponent, getIconBgColor } from '../../../utils/icons';

// RULE: All data through Redux - useSelector reads data
// RULE: NO direct API calls from components

// Animation classes for features (cycle through them)
const animations = ['fade-up-fast', 'fade-down-fast', 'fade-right-fast', 'fade-left-fast'];

const FeaturesSection = () => {
  const navigate = useNavigate();
  const { content } = useAppSelector((state) => state.siteContent);
  const features = content?.features || [];

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
              key={feature.id}
              className={`rounded-md bg-white p-6 shadow-sm hover:shadow-md transition-shadow ${animations[index % animations.length]}`}
            >
              <div className={`flex h-14 w-14 items-center justify-center rounded-md ${getIconBgColor(feature.icon)} zoom-in-fast`}>
                {getIconComponent(feature.icon)}
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
