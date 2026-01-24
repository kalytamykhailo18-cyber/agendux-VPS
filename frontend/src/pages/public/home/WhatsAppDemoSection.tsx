import { useState } from 'react';
import { Button, TextField, Select, MenuItem, FormControl, InputLabel, Alert } from '@mui/material';

const WhatsAppSvgIcon = ({ className = "w-8 h-8" }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className} style={{ filter: 'drop-shadow(1px 2px 2px rgba(0,0,0,0.3))' }}>
    <defs>
      <linearGradient id="waGradientDemo" x1="50%" y1="100%" x2="50%" y2="0%">
        <stop offset="0%" stopColor="#20B038"/>
        <stop offset="100%" stopColor="#60D66A"/>
      </linearGradient>
    </defs>
    <circle cx="50" cy="50" r="48" fill="#B3B3B3"/>
    <circle cx="50" cy="50" r="42" fill="#FFFFFF"/>
    <circle cx="50" cy="50" r="35" fill="url(#waGradientDemo)"/>
    <path fill="#FFFFFF" transform="translate(50, 50) scale(0.4) translate(-50, -50)" d="M50 20c-2.5 0-5 1-7 3-2.4 2.4-5.8 7-5.8 17s6 20 7 21.5c.8 1.4 11.7 18.7 28.7 26.2 14.2 6.1 17 5 20.2 4.7 3.2-.3 10.2-4.2 11.7-8.2 1.5-4 1.5-7.5 1-8.2-.5-.7-1.7-1.1-3.5-2-1.8-.8-10.9-5.3-12.5-6-1.7-.7-2.8-1-4 1-1.4 2-5 6-6.1 7.2-1.1 1.4-2.2 1.5-4 .5-1.8-.8-7.7-2.8-14.5-9-5.3-4.9-9-10.7-10-12.5-1-1.8-.1-2.8.8-3.6.8-.8 1.8-2 2.8-3 .8-1 1.1-1.7 1.8-2.8.7-1.1.3-2.2-.2-3-.5-.8-4.2-10-5.7-13.7-1.5-3.6-3.1-3.2-4.2-3.2-1 0-2.4-.1-3.6-.1z"/>
  </svg>
);

// Country codes with flags
const COUNTRY_CODES = [
  { code: '+54', country: 'Argentina', flag: '🇦🇷' },
  { code: '+1', country: 'Estados Unidos', flag: '🇺🇸' },
  { code: '+52', country: 'México', flag: '🇲🇽' },
  { code: '+34', country: 'España', flag: '🇪🇸' },
  { code: '+56', country: 'Chile', flag: '🇨🇱' },
  { code: '+57', country: 'Colombia', flag: '🇨🇴' },
  { code: '+51', country: 'Perú', flag: '🇵🇪' },
  { code: '+598', country: 'Uruguay', flag: '🇺🇾' },
  { code: '+55', country: 'Brasil', flag: '🇧🇷' },
  { code: '+58', country: 'Venezuela', flag: '🇻🇪' },
];

const WhatsAppDemoSection = () => {
  const [countryCode, setCountryCode] = useState('+54');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Handle send demo
  const handleSendDemo = async () => {
    setError('');
    setSuccess(false);

    // Validate phone number
    if (!phoneNumber.trim()) {
      setError('Por favor ingresa tu número de WhatsApp');
      return;
    }

    const phoneRegex = /^\d{6,15}$/;
    if (!phoneRegex.test(phoneNumber.replace(/\s/g, ''))) {
      setError('Número inválido (6-15 dígitos, sin código de país)');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/demo/whatsapp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          countryCode,
          phoneNumber: phoneNumber.replace(/\s/g, ''),
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        setPhoneNumber('');
      } else {
        setError(data.error || 'No se pudo enviar el mensaje. Intenta nuevamente.');
      }
    } catch (err) {
      setError('Error de conexión. Verifica tu internet e intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-12 sm:py-16 bg-gradient-to-br from-green-50 via-white to-green-50">
      <div className="container-wide">
        <div className="mx-auto max-w-3xl text-center mb-8 fade-down-normal">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-green-100 mb-4 zoom-in-fast">
            <WhatsAppSvgIcon className="w-8 h-8 sm:w-10 sm:h-10" />
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 fade-up-fast">
            ¿Quieres recibir un mensaje de ejemplo en tu WhatsApp?
          </h2>
          <p className="text-base sm:text-lg text-gray-600 fade-up-normal">
            Prueba cómo funciona nuestro sistema de recordatorios automáticos
          </p>
        </div>

        <div className="mx-auto max-w-2xl">
          <div className="rounded-2xl bg-white p-6 sm:p-8 shadow-xl zoom-in-normal">
            {/* Success message */}
            {success && (
              <Alert severity="success" className="mb-6 fade-down-fast">
                ¡Mensaje enviado! Revisa tu WhatsApp en unos segundos.
              </Alert>
            )}

            {/* Error message */}
            {error && (
              <Alert severity="error" className="mb-6 fade-down-fast">
                {error}
              </Alert>
            )}

            {/* Form - RULE: NO <form> tag, use <div> with button onClick */}
            <div className="space-y-5">
              {/* Country code selector */}
              <div className="fade-right-fast">
                <FormControl fullWidth>
                  <InputLabel>País</InputLabel>
                  <Select
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                    label="País"
                  >
                    {COUNTRY_CODES.map((country) => (
                      <MenuItem key={country.code} value={country.code}>
                        <span className="flex items-center gap-2">
                          <span>{country.flag}</span>
                          <span>{country.country}</span>
                          <span className="text-gray-500">({country.code})</span>
                        </span>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </div>

              {/* Phone number input */}
              <div className="fade-left-fast">
                <TextField
                  fullWidth
                  type="tel"
                  label="Número de WhatsApp"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="Ej: 1145678900"
                  helperText="Ingresa solo tu número, sin el código de país"
                  disabled={loading}
                />
              </div>

              {/* Send button */}
              <Button
                onClick={handleSendDemo}
                variant="contained"
                fullWidth
                disabled={loading}
                startIcon={<WhatsAppSvgIcon className="w-5 h-5" />}
                sx={{
                  textTransform: 'none',
                  minHeight: { xs: 56, sm: 48 },
                  fontSize: { xs: '1rem', sm: '1.125rem' },
                  bgcolor: '#25D366',
                  '&:hover': {
                    bgcolor: '#128C7E',
                  },
                }}
                className="fade-up-normal"
              >
                {loading ? 'Enviando...' : 'Enviar mensaje de prueba'}
              </Button>

              {/* Privacy notice */}
              <p className="text-xs sm:text-sm text-center text-gray-500 fade-up-slow">
                Solo enviaremos un único mensaje de demostración. Tu número no será almacenado ni
                utilizado para otros fines. Al hacer clic, aceptas recibir este mensaje de prueba.
              </p>
            </div>
          </div>

          {/* Example message preview */}
          <div className="mt-8 rounded-xl bg-gray-50 p-4 sm:p-6 fade-up-slow">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 fade-down-fast">
              Ejemplo del mensaje que recibirás:
            </h3>
            <div className="rounded-lg bg-white p-4 border border-gray-200 shadow-sm">
              <div className="flex gap-3 items-start">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                  <WhatsAppSvgIcon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm sm:text-base text-gray-800 leading-relaxed">
                    ¡Hola! 👋 Este es un mensaje de ejemplo de <strong>Agendux</strong>.
                    <br />
                    <br />
                    Así es como tus pacientes recibirán recordatorios automáticos de sus citas:
                    <br />
                    📅 Fecha: Lunes 20 de Enero, 2026
                    <br />
                    🕐 Hora: 10:00
                    <br />
                    👤 Profesional: Dr. García
                    <br />
                    <br />
                    ¿Quieres automatizar tus citas? Regístrate en <strong>agendux.com</strong>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhatsAppDemoSection;
