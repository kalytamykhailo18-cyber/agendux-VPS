import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Switch, CircularProgress } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import StarIcon from '@mui/icons-material/Star';
import api from '../../../config/api';

interface Plan {
  id: string;
  name: string;
  description: string;
  monthlyPrice: number;
  annualPrice: number;
  features: string[];
  displayOrder: number;
}

const PricingSection = () => {
  const navigate = useNavigate();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isAnnual, setIsAnnual] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await api.get('/subscription/plans');
        if (response.data.success) {
          setPlans(response.data.plans);
        }
      } catch (error) {
        console.error('Error fetching plans:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, []);

  // Find the "recommended" plan (Plan Profesional or middle plan)
  const recommendedPlanIndex = plans.findIndex(p =>
    p.name.toLowerCase().includes('profesional')
  ) || Math.floor(plans.length / 2);

  if (loading) {
    return (
      <div className="bg-white py-20 flex justify-center">
        <CircularProgress />
      </div>
    );
  }

  return (
    <div className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 fade-down-fast">
            Planes simples y transparentes
          </h2>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto fade-up-normal">
            Elegí el plan que mejor se adapte a tu consultorio. Sin sorpresas, sin costos ocultos.
          </p>

          {/* Annual/Monthly Toggle */}
          <div className="mt-8 flex items-center justify-center gap-3">
            <span className={`text-sm font-medium ${!isAnnual ? 'text-gray-900' : 'text-gray-500'}`}>
              Mensual
            </span>
            <Switch
              checked={isAnnual}
              onChange={(e) => setIsAnnual(e.target.checked)}
              sx={{
                '& .MuiSwitch-switchBase.Mui-checked': {
                  color: '#2563eb',
                },
                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                  backgroundColor: '#2563eb',
                },
              }}
            />
            <span className={`text-sm font-medium ${isAnnual ? 'text-gray-900' : 'text-gray-500'}`}>
              Anual
            </span>
            {isAnnual && (
              <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                Ahorrá 2 meses
              </span>
            )}
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {plans.map((plan, index) => {
            const isRecommended = index === recommendedPlanIndex;
            const price = isAnnual ? plan.annualPrice : plan.monthlyPrice;
            const isFree = plan.monthlyPrice === 0;

            return (
              <div
                key={plan.id}
                className={`relative rounded-md p-6 flex flex-col ${
                  isRecommended
                    ? 'bg-blue-600 text-white shadow-lg scale-105 z-10'
                    : 'bg-gray-50 text-gray-900'
                }`}
              >
                {/* Recommended Badge */}
                {isRecommended && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                      <StarIcon sx={{ fontSize: 14 }} />
                      Recomendado
                    </span>
                  </div>
                )}

                {/* Plan Name */}
                <h3 className={`text-lg font-bold ${isRecommended ? 'text-white' : 'text-gray-900'}`}>
                  {plan.name}
                </h3>

                {/* Description */}
                <p className={`mt-1 text-sm ${isRecommended ? 'text-blue-100' : 'text-gray-500'}`}>
                  {plan.description}
                </p>

                {/* Price */}
                <div className="mt-4">
                  {isFree ? (
                    <div className="flex items-baseline">
                      <span className="text-3xl font-bold">Gratis</span>
                    </div>
                  ) : (
                    <div className="flex items-baseline">
                      <span className="text-sm">USD</span>
                      <span className="text-3xl font-bold mx-1">${price}</span>
                      <span className={`text-sm ${isRecommended ? 'text-blue-100' : 'text-gray-500'}`}>
                        /{isAnnual ? 'año' : 'mes'}
                      </span>
                    </div>
                  )}
                  {isAnnual && !isFree && (
                    <p className={`text-xs mt-1 ${isRecommended ? 'text-blue-200' : 'text-gray-400'}`}>
                      (${Math.round(price / 12)}/mes)
                    </p>
                  )}
                </div>

                {/* Features */}
                <ul className="mt-6 space-y-2 flex-1">
                  {plan.features.map((feature, fIndex) => (
                    <li key={fIndex} className="flex items-start gap-2 text-sm">
                      <CheckIcon
                        sx={{
                          fontSize: 18,
                          color: isRecommended ? '#86efac' : '#22c55e',
                          flexShrink: 0,
                          marginTop: '2px',
                        }}
                      />
                      <span className={isRecommended ? 'text-blue-50' : 'text-gray-600'}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <Button
                  variant={isRecommended ? 'contained' : 'outlined'}
                  onClick={() => navigate('/register')}
                  fullWidth
                  sx={{
                    mt: 4,
                    textTransform: 'none',
                    fontWeight: 600,
                    ...(isRecommended
                      ? {
                          bgcolor: 'white',
                          color: '#2563eb',
                          '&:hover': { bgcolor: '#f0f9ff' },
                        }
                      : {}),
                  }}
                >
                  {isFree ? 'Comenzar Prueba' : 'Elegir Plan'}
                </Button>
              </div>
            );
          })}
        </div>

        {/* Bottom Text */}
        <p className="mt-10 text-center text-sm text-gray-500">
          Todos los planes incluyen soporte escribiendo a info@agendux.com. Podés cambiar o cancelar en cualquier momento.
        </p>
      </div>
    </div>
  );
};

export default PricingSection;
