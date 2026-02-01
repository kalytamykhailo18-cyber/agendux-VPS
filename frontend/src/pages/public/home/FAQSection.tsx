import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useAppSelector } from '../../../store';

// RULE: All data through Redux - useSelector reads data
// RULE: NO direct API calls from components
// RULE: Routing via useNavigation only (no Link/a tags)

const FAQSection = () => {
  const navigate = useNavigate();
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const { content } = useAppSelector((state) => state.siteContent);
  const faqs = content?.faqs || [];

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
              key={faq.id}
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
          <span
            onClick={() => navigate('/dudas')}
            className="text-blue-600 hover:underline cursor-pointer"
          >
            Escribinos
          </span>{' '}
          y te respondemos a la brevedad.
        </p>
      </div>
    </div>
  );
};

export default FAQSection;
