import { useNavigate } from 'react-router-dom';
import { Button } from '@mui/material';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import InstagramIcon from '@mui/icons-material/Instagram';
import PrintIcon from '@mui/icons-material/Print';

const steps = [
  {
    number: '1',
    icon: <CalendarMonthIcon sx={{ fontSize: 32 }} />,
    iconColor: 'text-blue-600',
    title: 'Creá tu agenda en minutos',
    description: (
      <>
        Definí la duración de tus turnos + tus días y horarios de atención. Conectá tu cuenta de Google Calendar y tené siempre tu agenda sincronizada en tiempo real.
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
                ) : index === 0 ? (
                  /* Step 1: Dashboard de configuración mockup */
                  <div className="bg-white rounded-md shadow-sm border border-gray-100 overflow-hidden">
                    <div className="flex">
                      {/* Mini sidebar */}
                      <div className="w-14 sm:w-16 bg-blue-600 py-4 flex flex-col items-center gap-4 flex-shrink-0">
                        <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center">
                          <div className="w-3.5 h-3.5 rounded-full bg-white" />
                        </div>
                        <div className="w-full px-2 space-y-3 mt-2">
                          {[true, false, false, false, false].map((active, i) => (
                            <div key={i} className={`flex items-center gap-1.5 px-1.5 py-1 rounded ${active ? 'bg-white/20' : ''}`}>
                              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${active ? 'bg-white' : 'bg-blue-300'}`} />
                              <div className={`h-1.5 rounded-full flex-1 ${active ? 'bg-white' : 'bg-blue-400'}`} />
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Main content: calendar grid */}
                      <div className="flex-1 p-4 sm:p-5">
                        {/* Header bar */}
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-blue-600" />
                            <div className="h-2.5 w-28 bg-gray-200 rounded-full" />
                          </div>
                          <div className="h-6 w-20 bg-blue-100 rounded flex items-center justify-center">
                            <span className="text-[10px] font-semibold text-blue-600">+ Horario</span>
                          </div>
                        </div>

                        {/* Day headers */}
                        <div className="grid grid-cols-5 gap-1.5 mb-2">
                          {['Lun', 'Mar', 'Mié', 'Jue', 'Vie'].map((day) => (
                            <div key={day} className="text-center">
                              <span className="text-[10px] font-medium text-gray-400">{day}</span>
                            </div>
                          ))}
                        </div>

                        {/* Time slots grid */}
                        <div className="grid grid-cols-5 gap-1.5">
                          {Array.from({ length: 20 }).map((_, i) => {
                            const isActive = [0,1,2,5,6,7,10,11,15,16,17].includes(i);
                            return (
                              <div
                                key={i}
                                className={`h-5 rounded ${isActive ? 'bg-blue-100 border border-blue-300' : 'bg-gray-50 border border-gray-100'}`}
                              />
                            );
                          })}
                        </div>

                        {/* Legend */}
                        <div className="flex items-center gap-4 mt-3">
                          <div className="flex items-center gap-1">
                            <div className="w-2.5 h-2.5 rounded bg-blue-100 border border-blue-300" />
                            <span className="text-[9px] text-gray-400">Disponible</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <div className="w-2.5 h-2.5 rounded bg-gray-50 border border-gray-100" />
                            <span className="text-[9px] text-gray-400">No disponible</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Step 2: Link + QR personalizado mockup */
                  <div className="bg-white rounded-md shadow-sm border border-gray-100 p-5 sm:p-6">
                    {/* URL bar */}
                    <div className="flex items-center gap-2 p-3 bg-purple-50 rounded-md border border-purple-200 mb-5">
                      <div className="flex-1 flex items-center gap-1.5 min-w-0">
                        <div className="w-4 h-4 rounded-full bg-purple-200 flex items-center justify-center flex-shrink-0">
                          <div className="w-2 h-2 rounded-full bg-purple-500" />
                        </div>
                        <span className="text-sm sm:text-base font-semibold text-purple-700 truncate">agendux.com/dra.garcia</span>
                      </div>
                      <div className="flex items-center gap-1 px-2 py-1 bg-white rounded border border-purple-200 flex-shrink-0 cursor-default">
                        <ContentCopyIcon sx={{ fontSize: 14 }} className="text-purple-500" />
                        <span className="text-[10px] font-medium text-purple-600 hidden sm:inline">Copiar</span>
                      </div>
                    </div>

                    {/* QR code + info */}
                    <div className="flex gap-4 sm:gap-5 items-start mb-5">
                      {/* Abstract QR code */}
                      <div className="w-24 h-24 sm:w-28 sm:h-28 bg-white rounded-md border border-gray-200 p-2 flex-shrink-0">
                        <svg viewBox="0 0 21 21" className="w-full h-full">
                          {/* QR-like pattern */}
                          {/* Top-left finder */}
                          <rect x="0" y="0" width="7" height="7" fill="#7c3aed" rx="0.5" />
                          <rect x="1" y="1" width="5" height="5" fill="white" rx="0.3" />
                          <rect x="2" y="2" width="3" height="3" fill="#7c3aed" rx="0.3" />
                          {/* Top-right finder */}
                          <rect x="14" y="0" width="7" height="7" fill="#7c3aed" rx="0.5" />
                          <rect x="15" y="1" width="5" height="5" fill="white" rx="0.3" />
                          <rect x="16" y="2" width="3" height="3" fill="#7c3aed" rx="0.3" />
                          {/* Bottom-left finder */}
                          <rect x="0" y="14" width="7" height="7" fill="#7c3aed" rx="0.5" />
                          <rect x="1" y="15" width="5" height="5" fill="white" rx="0.3" />
                          <rect x="2" y="16" width="3" height="3" fill="#7c3aed" rx="0.3" />
                          {/* Data modules */}
                          {[
                            [8,0],[10,0],[8,2],[9,2],[11,1],[12,2],
                            [0,8],[1,9],[2,8],[3,9],[4,8],[5,9],[6,8],
                            [8,4],[9,5],[10,4],[11,5],[12,4],[8,6],
                            [8,8],[9,9],[10,8],[11,9],[12,8],[10,10],
                            [14,8],[15,9],[16,8],[17,9],[18,8],[19,9],[20,8],
                            [8,10],[9,11],[10,12],[8,12],[11,11],[12,12],
                            [14,10],[16,10],[18,10],[15,11],[17,11],[19,11],
                            [14,12],[16,12],[18,12],[20,12],
                            [8,14],[9,15],[10,14],[11,15],[12,14],
                            [14,14],[16,14],[18,14],[20,14],
                            [15,15],[17,15],[19,15],
                            [14,16],[16,16],[18,16],[20,16],
                            [14,18],[15,19],[16,18],[17,19],[18,18],[19,19],[20,18],
                            [8,16],[9,17],[10,16],[11,17],[12,16],
                            [8,18],[10,18],[12,18],[9,19],[11,19],[10,20],[12,20],
                          ].map(([x, y], i) => (
                            <rect key={i} x={x} y={y} width="1" height="1" fill="#7c3aed" rx="0.1" />
                          ))}
                        </svg>
                      </div>

                      {/* Info text */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800 mb-1">Tu código QR</p>
                        <p className="text-xs text-gray-500 leading-relaxed">
                          Escaneá para abrir tu página de turnos. Ideal para cartelería, tarjetas personales o sala de espera.
                        </p>
                        <div className="mt-3 flex items-center gap-1.5">
                          <div className="h-5 w-16 bg-purple-100 rounded flex items-center justify-center">
                            <span className="text-[9px] font-medium text-purple-600">Descargar</span>
                          </div>
                          <div className="h-5 w-14 bg-gray-100 rounded flex items-center justify-center">
                            <span className="text-[9px] font-medium text-gray-500">Imprimir</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Share buttons row */}
                    <div className="border-t border-gray-100 pt-4">
                      <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-2.5">Compartir en</p>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 rounded-md border border-green-200 cursor-default">
                          <WhatsAppIcon sx={{ fontSize: 16 }} className="text-green-600" />
                          <span className="text-xs font-medium text-green-700">WhatsApp</span>
                        </div>
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-pink-50 rounded-md border border-pink-200 cursor-default">
                          <InstagramIcon sx={{ fontSize: 16 }} className="text-pink-600" />
                          <span className="text-xs font-medium text-pink-700">Instagram</span>
                        </div>
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 rounded-md border border-gray-200 cursor-default">
                          <PrintIcon sx={{ fontSize: 16 }} className="text-gray-500" />
                          <span className="text-xs font-medium text-gray-600">Imprimir</span>
                        </div>
                      </div>
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
            Sin tener que instalar programas ni saber de tecnología
          </p>
        </div>
      </div>
    </div>
  );
};

export default HowItWorksSection;
