import { useState } from 'react';
import { Button, TextField, Select, MenuItem, FormControl, InputLabel, Alert } from '@mui/material';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';

// Convert flag emoji to flagcdn.com image URL (works on all platforms including Windows)
function getFlagUrl(flagEmoji: string): string {
  const codePoints = [...flagEmoji].map(c => (c.codePointAt(0) ?? 0) - 0x1F1E6 + 65);
  const iso = String.fromCharCode(...codePoints).toLowerCase();
  return `https://flagcdn.com/w20/${iso}.png`;
}

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
      const response = await fetch(`${import.meta.env.VITE_API_URL}/demo/whatsapp`, {
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
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#25D366] mb-4 zoom-in-fast">
            <WhatsAppIcon sx={{ fontSize: { xs: 32, sm: 40 }, color: '#FFFFFF' }} />
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
                    renderValue={(selected) => {
                      const country = COUNTRY_CODES.find(c => c.code === selected);
                      if (!country) return selected;
                      return (
                        <span className="flex items-center gap-2">
                          <img src={getFlagUrl(country.flag)} alt={country.country} width={20} height={15} style={{ objectFit: 'cover' }} />
                          <span>{country.country}</span>
                          <span className="text-gray-500">({country.code})</span>
                        </span>
                      );
                    }}
                  >
                    {COUNTRY_CODES.map((country) => (
                      <MenuItem key={country.code} value={country.code}>
                        <span className="flex items-center gap-2">
                          <img src={getFlagUrl(country.flag)} alt={country.country} width={20} height={15} style={{ objectFit: 'cover' }} />
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
                startIcon={<WhatsAppIcon />}
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
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#25D366] flex items-center justify-center">
                  <WhatsAppIcon sx={{ fontSize: 20, color: '#FFFFFF' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm sm:text-base text-gray-800 leading-relaxed">
                    ¡Hola! 👋 Este es un mensaje de ejemplo de <strong>Agendux</strong>.
                    <br />
                    <br />
                    Así es como tus pacientes recibirán recordatorios automáticos de sus citas:
                    <br />
                    📌 Fecha: Lunes 19 de Enero de 2026 
                    <br />
                    🕐 Hora: 10:00
                    <br />
                    👤 Profesional: Dr. García
                    <br />
                    <br />
                    ¿Querés automatizar tus citas? Registrate en agendux.com
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
