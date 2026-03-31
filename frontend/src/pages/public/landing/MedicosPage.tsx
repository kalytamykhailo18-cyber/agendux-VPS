import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { Button } from '@mui/material';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const MedicosPage = () => {
  const navigate = useNavigate();

  const handleRegister = () => {
    navigate('/register');
  };

  const jsonLd = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: 'Agendux para Médicos',
    description: 'Sistema de gestión de turnos online para médicos y consultorios. Reservas 24/7, recordatorios por WhatsApp y sincronización con Google Calendar.',
    url: 'https://agendux.com/para-medicos',
    provider: {
      '@type': 'Organization',
      name: 'Agendux',
      url: 'https://agendux.com',
    },
    serviceType: 'Software de gestión de turnos',
    areaServed: { '@type': 'Country', name: 'Argentina' },
  });

  return (
    <div className="bg-white">
      <Helmet>
        <title>Agenda online para médicos — Gestión de turnos | Agendux</title>
        <meta name="description" content="Sistema de turnos online para médicos y consultorios. Tus pacientes reservan solos 24/7. Recordatorios automáticos por WhatsApp. Reducí ausencias hasta un 75%. Comenzá gratis." />
        <link rel="canonical" href="https://agendux.com/para-medicos" />
        <meta property="og:title" content="Agenda online para médicos | Agendux" />
        <meta property="og:description" content="Sistema de turnos online para médicos. Tus pacientes reservan solos 24/7. Recordatorios por WhatsApp. Comenzá gratis." />
        <meta property="og:url" content="https://agendux.com/para-medicos" />
        <script type="application/ld+json">{jsonLd}</script>
      </Helmet>

      {/* Hero */}
      <div className="mx-auto max-w-7xl px-4 pt-12 pb-16 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-blue-600 font-semibold text-sm sm:text-base mb-4 fade-down-fast">
            Diseñado para médicos y consultorios
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl md:text-5xl fade-down-fast">
            Agenda online para médicos
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600 fade-up-normal">
            Dejá de perder tiempo coordinando turnos.
            <br />
            Y de sufrir ausencias sin aviso.
          </p>
          <p className="mx-auto mt-4 max-w-2xl text-base text-gray-600 fade-up-normal">
            Con Agendux, tus pacientes reservan solos las 24 horas y reciben recordatorios automáticos por WhatsApp que reducen el ausentismo.
          </p>
          <div className="mt-8 flex flex-col items-center gap-3">
            <Button
              variant="contained"
              onClick={handleRegister}
              sx={{ width: { xs: '100%', sm: 'auto' }, textTransform: 'none', px: 5, py: 1.75, fontSize: '1.125rem', fontWeight: 600 }}
              className="fade-up-fast"
            >
              Comenzar Gratis — Sin Tarjeta
            </Button>
            <p className="text-sm text-gray-500 fade-up-normal">
              Obtené tu link personalizado en minutos. Sin compromiso.
            </p>
          </div>
        </div>
      </div>

      {/* Problema */}
      <div className="bg-gray-50 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 fade-down-fast">¿Te suena familiar?</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="bg-white rounded-lg p-6 shadow-sm fade-up-normal">
              <AccessTimeIcon sx={{ fontSize: 40, color: '#ef4444', mb: 2 }} />
              <h3 className="font-semibold text-gray-900 mb-2">La secretaria no da abasto</h3>
              <p className="text-gray-600 text-sm">
                Llamadas, WhatsApp, reprogramaciones. El teléfono no para y los turnos se mezclan. Tiempo que tu equipo podría dedicar a la atención.
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm fade-up-normal">
              <TrendingDownIcon sx={{ fontSize: 40, color: '#ef4444', mb: 2 }} />
              <h3 className="font-semibold text-gray-900 mb-2">Pacientes que no asisten</h3>
              <p className="text-gray-600 text-sm">
                Las ausencias sin aviso dejan huecos en tu agenda que no podés llenar. Cada turno vacío es un paciente en lista de espera que pierde su oportunidad.
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm fade-up-normal">
              <AttachMoneyIcon sx={{ fontSize: 40, color: '#ef4444', mb: 2 }} />
              <h3 className="font-semibold text-gray-900 mb-2">Ingresos que se pierden</h3>
              <p className="text-gray-600 text-sm">
                Cada turno perdido es una consulta que no cobrás. En un mes, las ausencias pueden representar una semana entera de facturación perdida.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Solución */}
      <div className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 fade-down-fast">Cómo Agendux resuelve esto</h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto fade-up-normal">Un sistema diseñado para que gestionar los turnos de tu consultorio sea automático</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center fade-up-normal">
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <CalendarMonthIcon sx={{ fontSize: 32, color: '#1976d2' }} />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Reservas online 24/7</h3>
              <p className="text-gray-600 text-sm">Tus pacientes eligen fecha y horario desde tu link personalizado. Funciona fuera de horario, fines de semana y feriados.</p>
            </div>
            <div className="text-center fade-up-normal">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <WhatsAppIcon sx={{ fontSize: 32, color: '#25D366' }} />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Recordatorios por WhatsApp</h3>
              <p className="text-gray-600 text-sm">Cada paciente recibe un recordatorio automático antes de su turno. Reducí las ausencias hasta un 75% sin llamar a nadie.</p>
            </div>
            <div className="text-center fade-up-normal">
              <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <EventAvailableIcon sx={{ fontSize: 32, color: '#7c3aed' }} />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Google Calendar sincronizado</h3>
              <p className="text-gray-600 text-sm">Cada turno aparece automáticamente en tu Google Calendar. Sin duplicar información, sin errores manuales.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Beneficios */}
      <div className="bg-gray-50 py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 fade-down-fast">Resultados concretos para tu consultorio</h2>
          </div>
          <div className="space-y-4">
            {[
              'Reducí hasta un 75% las ausencias con recordatorios automáticos por WhatsApp',
              'Liberá a tu secretaria de coordinar turnos por teléfono y WhatsApp',
              'Tus pacientes reservan solos a cualquier hora, incluso fuera del horario del consultorio',
              'Tu agenda siempre sincronizada con Google Calendar, sin cargar turnos a mano',
              'Link personalizado (agendux.com/tunombre) para compartir con pacientes',
              'Código QR listo para poner en la recepción del consultorio',
            ].map((benefit, i) => (
              <div key={i} className="flex items-start gap-3 fade-up-normal">
                <CheckCircleIcon sx={{ color: '#22c55e', fontSize: 24, mt: 0.25, flexShrink: 0 }} />
                <p className="text-gray-700">{benefit}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Cómo funciona */}
      <div className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 fade-down-fast">Empezá en 3 pasos</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center fade-up-normal">
              <div className="mx-auto w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold mb-4">1</div>
              <h3 className="font-semibold text-gray-900 mb-2">Registrate gratis</h3>
              <p className="text-gray-600 text-sm">Creá tu cuenta en menos de 2 minutos. Sin tarjeta, sin compromiso.</p>
            </div>
            <div className="text-center fade-up-normal">
              <div className="mx-auto w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold mb-4">2</div>
              <h3 className="font-semibold text-gray-900 mb-2">Configurá tu agenda</h3>
              <p className="text-gray-600 text-sm">Definí tus horarios de atención, duración de consulta y días disponibles.</p>
            </div>
            <div className="text-center fade-up-normal">
              <div className="mx-auto w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold mb-4">3</div>
              <h3 className="font-semibold text-gray-900 mb-2">Compartí tu link</h3>
              <p className="text-gray-600 text-sm">Enviá tu link a tus pacientes por WhatsApp, redes o email. Ellos reservan solos.</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-blue-600 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white fade-down-fast">¿Listo para automatizar los turnos de tu consultorio?</h2>
          <p className="mt-4 text-lg text-blue-100 max-w-2xl mx-auto fade-up-normal">Empezá hoy gratis. Sin tarjeta, sin compromiso, cancelá cuando quieras.</p>
          <Button
            variant="contained"
            onClick={handleRegister}
            sx={{ mt: 4, bgcolor: 'white', color: 'primary.main', textTransform: 'none', px: 5, py: 1.5, fontSize: '1.1rem', fontWeight: 600, '&:hover': { bgcolor: 'grey.100' } }}
            className="zoom-in-slow"
          >
            Comenzar Gratis — Sin Tarjeta
          </Button>
          <p className="mt-4 text-sm text-blue-200 fade-up-normal">Sin tener que instalar programas ni saber de tecnología</p>
        </div>
      </div>
    </div>
  );
};

export default MedicosPage;
