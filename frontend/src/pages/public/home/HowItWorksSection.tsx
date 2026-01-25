import { useNavigate } from 'react-router-dom';
import { Button } from '@mui/material';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import AutorenewIcon from '@mui/icons-material/Autorenew';

const steps = [
  {
    number: '1',
    icon: <CalendarMonthIcon sx={{ fontSize: 32 }} />,
    iconColor: 'text-blue-600',
    title: 'Creá tu agenda en minutos',
    description: (
      <>
        Definí tus servicios (ej. turno de Odontología, corte de pelo, control médico),
        horarios disponibles, duración de cada turno y precios. Sincronizá con tu Google Calendar
        (bidireccional y en tiempo real).
        <br /><br />
        <span className="text-gray-500">Todo se configura desde un panel intuitivo y amigable.</span>
      </>
    ),
  },
  {
    number: '2',
    icon: <QrCode2Icon sx={{ fontSize: 32 }} />,
    iconColor: 'text-purple-600',
    title: 'Compartí tu link o QR personalizado.',
    description: (
      <>
        Al terminar la configuración, Agendux te genera tu link único
        (<span className="text-blue-600 font-medium">agendux.com/tunombre</span>) y tu código QR listo para usar.
        <br /><br />
        Compartilo en tu estado de WhatsApp, ponelo en tu bio o stories de Instagram, Facebook,
        pegalo en tu página web actual o imprimilo para tu sala de espera.
        <br /><br />
        <span className="text-gray-500">Tus pacientes pueden reservar 24/7 sin llamarte ni escribirte.</span>
      </>
    ),
  },
  {
    number: '3',
    icon: <AutorenewIcon sx={{ fontSize: 32 }} />,
    iconColor: 'text-green-600',
    title: 'Dejá que todo funcione solo.',
    description: (
      <>
        Cuando un paciente agenda por tu link o QR:
        <ul className="mt-2 space-y-1 text-gray-700">
          <li>→ Recibe confirmación instantánea por WhatsApp</li>
          <li>→ Le llega recordatorio automático 24 horas antes</li>
          <li>→ Confirma o cancela con un solo clic</li>
          <li>→ Tu agenda se actualiza al instante (libera el turno si cancela)</li>
        </ul>
        <br />
        <span className="text-gray-500">
          Vos solo te dedicás a atender. Olvidate de esperar confirmaciones o lidiar con olvidos.
        </span>
      </>
    ),
  },
];

const HowItWorksSection = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-gradient-to-b from-blue-50 to-white py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 fade-down-fast">
            Súper simple: solo 3 pasos y listo
          </h2>
          <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto fade-up-normal">
            Configurás todo en menos de 10 minutos, sin complicaciones ni conocimientos técnicos.
            Funciona perfecto desde tu celular, tablet o computadora.
          </p>
        </div>

        {/* Steps */}
        <div className="space-y-12 lg:space-y-16">
          {steps.map((step, index) => (
            <div
              key={index}
              className={`flex flex-col ${
                index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'
              } items-center gap-8 lg:gap-12`}
            >
              {/* Content */}
              <div className="flex-1 w-full">
                <div className="bg-white rounded-md p-6 sm:p-8 shadow-sm">
                  {/* Number and Icon */}
                  <div className="flex items-center gap-4 mb-4">
                    <span className="text-5xl sm:text-6xl font-bold text-blue-100">
                      {step.number}
                    </span>
                    <div className={`${step.iconColor}`}>
                      {step.icon}
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
                    {step.title}
                  </h3>

                  {/* Description */}
                  <div className="text-gray-700 leading-relaxed">
                    {step.description}
                  </div>
                </div>
              </div>

              {/* Visual placeholder - mockup area */}
              <div className="flex-1 w-full max-w-md lg:max-w-none">
                {index === 2 ? (
                  /* Status Flow Visual for Step 3 */
                  <div className="bg-white rounded-md p-6 shadow-sm border border-gray-100">
                    <div className="space-y-4">
                      {/* Pending - Yellow */}
                      <div className="flex items-start gap-4 p-4 bg-yellow-50 rounded-md border-l-4 border-yellow-400">
                        <div className="w-4 h-4 rounded-full bg-yellow-400 mt-1 flex-shrink-0 shadow-sm" />
                        <div>
                          <p className="font-semibold text-gray-900">Mensaje de confirmación enviado</p>
                          <p className="text-sm text-gray-600">
                            Hemos enviado el mensaje de confirmación a tu cliente y esperamos su respuesta.
                          </p>
                        </div>
                      </div>

                      {/* Confirmed - Green */}
                      <div className="flex items-start gap-4 p-4 bg-green-50 rounded-md border-l-4 border-green-500">
                        <div className="w-4 h-4 rounded-full bg-green-500 mt-1 flex-shrink-0 shadow-sm" />
                        <div>
                          <p className="font-semibold text-gray-900">Cita confirmada</p>
                          <p className="text-sm text-gray-600">
                            Tu cliente confirmó la cita.
                          </p>
                        </div>
                      </div>

                      {/* Cancelled - Red */}
                      <div className="flex items-start gap-4 p-4 bg-red-50 rounded-md border-l-4 border-red-500">
                        <div className="w-4 h-4 rounded-full bg-red-500 mt-1 flex-shrink-0 shadow-sm" />
                        <div>
                          <p className="font-semibold text-gray-900">Cita cancelada</p>
                          <p className="text-sm text-gray-600">
                            Tu cliente canceló la cita.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-100 rounded-md aspect-[4/3] flex items-center justify-center">
                    <div className="text-center p-8">
                      <div className={`${step.iconColor} mb-2`}>
                        {step.icon}
                      </div>
                      <p className="text-sm text-gray-400">
                        {index === 0 && 'Dashboard de configuración'}
                        {index === 1 && 'Link + QR personalizado'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Final Text */}
        <div className="mt-16 text-center">
          <p className="text-lg text-gray-700 max-w-3xl mx-auto mb-8 fade-up-normal">
            <strong>Listo.</strong> En menos de 10 minutos tenés un sistema automático que ahorra tiempo,
            llena tu agenda y te hace ver más profesional. Sin instalaciones complicadas, sin apps extras,
            sin dolores de cabeza.
          </p>

          {/* CTA */}
          <Button
            variant="contained"
            onClick={() => navigate('/register')}
            sx={{
              textTransform: 'none',
              px: 4,
              py: 1.5,
              fontSize: '1.1rem',
              fontWeight: 600,
            }}
            className="fade-up-fast"
          >
            Probá Gratis y Creá tu Link + QR Ahora
          </Button>

          {/* Microcopy */}
          <p className="mt-4 text-sm text-gray-500 fade-up-normal">
            Sin tarjeta • 14 días de prueba gratis • Obtené tu link y QR en minutos
          </p>
        </div>
      </div>
    </div>
  );
};

export default HowItWorksSection;
