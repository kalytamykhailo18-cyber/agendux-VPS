import { useState } from 'react';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

interface FAQ {
  question: string;
  answer: React.ReactNode;
}

const faqs: FAQ[] = [
  {
    question: '¿Cómo obtengo mi link personalizado y mi código QR?',
    answer: (
      <>
        Al registrarte y configurar tu agenda (en menos de 10 minutos), Agendux genera tu link único
        (<span className="text-blue-600 font-medium">agendux.com/tunombre</span>) y tu código QR listo
        para usar. Podés descargarlo, copiarlo o compartirlo directamente.
      </>
    ),
  },
  {
    question: '¿Dónde puedo poner el link o el QR para que mis pacientes lo usen?',
    answer: (
      <>
        En cualquier lugar:
        <ul className="mt-2 space-y-1 list-disc list-inside text-gray-600">
          <li>Estado y chats de WhatsApp</li>
          <li>Bio, stories o publicaciones de Instagram/Facebook</li>
          <li>Página web actual (solo pegás el link o embedás el QR)</li>
          <li>Tarjeta personal, firma de email o impreso en tu sala de espera</li>
        </ul>
        <p className="mt-2">Tus pacientes reservan 24/7 sin necesidad de llamarte.</p>
      </>
    ),
  },
  {
    question: '¿Qué pasa si supero la cantidad de citas del plan que elegí?',
    answer: (
      <>
        No te preocupes: seguís recibiendo citas normalmente. Solo pagás un pequeño costo extra por
        cada recordatorio que exceda el límite mensual (desde USD 0.25 en Básico hasta USD 0.15 en Premium).
        Podés subir de plan en cualquier momento con un clic, sin perder nada.
      </>
    ),
  },
  {
    question: '¿Es seguro usar Agendux con mis datos y los de mis pacientes?',
    answer: (
      <>
        Sí, totalmente. Usamos la <strong>API oficial de WhatsApp Business</strong> (de Meta), cumplimos con
        las leyes de protección de datos de Argentina y RGPD. No almacenamos mensajes ni datos sensibles
        más allá de lo necesario para la agenda. Tu número y el de tus pacientes están protegidos y nunca se comparten.
      </>
    ),
  },
  {
    question: '¿Puedo cancelar la suscripción cuando quiera?',
    answer: (
      <>
        Sí, en cualquier momento desde tu panel. No hay penalidades ni compromisos de permanencia.
        Además, ofrecemos <strong>14 días de prueba completamente gratis</strong> (sin tarjeta).
      </>
    ),
  },
  {
    question: '¿Funciona con mi Google Calendar actual?',
    answer: (
      <>
        Sí, y muy bien. La sincronización es <strong>bidireccional y en tiempo real</strong>: si alguien
        agenda por Agendux, se refleja en tu Google Calendar al instante, y viceversa. Evitás doble
        turnos o conflictos sin esfuerzo.
      </>
    ),
  },
  {
    question: '¿Necesito instalar alguna app o programa?',
    answer: (
      <>
        No. Todo se maneja desde el navegador (celular, tablet o computadora). No hay descargas ni
        instalaciones. Solo entrás a tu cuenta en agendux.com y listo.
      </>
    ),
  },
  {
    question: '¿Puedo personalizar los mensajes de confirmación y recordatorio?',
    answer: (
      <>
        Sí. Podés editar el texto, agregar tu nombre, logo, dirección o cualquier detalle de tu
        consulta/negocio. Los mensajes son <strong>100% personalizables</strong> para que suenen como vos.
      </>
    ),
  },
];

const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="bg-gray-50 py-20">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 fade-down-fast">
            Preguntas frecuentes
          </h2>
          <p className="mt-4 text-lg text-gray-600 fade-up-normal">
            Resolvemos las dudas más comunes para que empieces sin preocupaciones
          </p>
        </div>

        {/* FAQ Accordion */}
        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-white rounded-md shadow-sm overflow-hidden"
            >
              {/* Question Header */}
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full px-6 py-4 text-left flex items-center justify-between gap-4 hover:bg-gray-50 transition-colors"
              >
                <span className="font-medium text-gray-900">{faq.question}</span>
                <ExpandMoreIcon
                  sx={{
                    fontSize: 24,
                    color: '#6b7280',
                    transform: openIndex === index ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s ease-in-out',
                    flexShrink: 0,
                  }}
                />
              </button>

              {/* Answer */}
              <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  openIndex === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <div className="px-6 pb-4 text-gray-600 leading-relaxed">
                  {faq.answer}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Text */}
        <p className="mt-10 text-center text-sm text-gray-500">
          ¿Tenés otra pregunta?{' '}
          <a href="/dudas" className="text-blue-600 hover:underline">
            Escribinos
          </a>{' '}
          y te respondemos a la brevedad.
        </p>
      </div>
    </div>
  );
};

export default FAQSection;
