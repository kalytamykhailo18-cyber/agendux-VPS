import { useEffect } from 'react';
import { Star } from '@mui/icons-material';
import { Avatar } from '@mui/material';
import { useAppDispatch, useAppSelector } from '../../../store';
import { getPublicTestimonials } from '../../../store/slices/testimonialSlice';

// RULE: All data through Redux, NO hardcoded data
// RULE: Page load → dispatch Redux action → API → Redux store → useSelector → UI renders

// Helper to get avatar initials from name
const getInitials = (name: string) => {
  const names = name.split(' ');
  if (names.length >= 2) {
    return names[0][0] + names[names.length - 1][0];
  }
  return name.slice(0, 2);
};

const TestimonialsSection = () => {
  const dispatch = useAppDispatch();
  const { publicTestimonials } = useAppSelector((state) => state.testimonial);

  // Fetch testimonials on component mount
  useEffect(() => {
    dispatch(getPublicTestimonials());
  }, [dispatch]);
  return (
    <section className="py-12 sm:py-16 bg-gray-50">
      <div className="container-wide">
        {/* Header */}
        <div className="mx-auto max-w-3xl text-center mb-10 sm:mb-12 fade-down-normal">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 fade-up-fast">
            Lo que dicen nuestros profesionales
          </h2>
          <p className="text-base sm:text-lg text-gray-600 fade-up-normal">
            Miles de profesionales confían en Agendux para gestionar sus citas
          </p>
        </div>

        {/* Testimonials grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {publicTestimonials.length > 0 ? (
            publicTestimonials.map((testimonial, index) => (
              <div
                key={testimonial.id}
                className={`rounded-xl bg-white p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 ${
                  index === 0 ? 'fade-right-normal' : index === 1 ? 'zoom-in-normal' : 'fade-left-normal'
                }`}
              >
                {/* Rating stars */}
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} sx={{ fontSize: 20, color: '#FFC107' }} />
                  ))}
                </div>

                {/* Review text */}
                <p className="text-sm sm:text-base text-gray-700 leading-relaxed mb-6">
                  "{testimonial.review}"
                </p>

                {/* Author info */}
                <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                  {testimonial.photo ? (
                    <Avatar
                      src={testimonial.photo}
                      alt={testimonial.name}
                      sx={{
                        width: 48,
                        height: 48,
                      }}
                    />
                  ) : (
                    <Avatar
                      sx={{
                        width: 48,
                        height: 48,
                        bgcolor: 'primary.main',
                        fontSize: '1rem',
                        fontWeight: 600,
                      }}
                    >
                      {getInitials(testimonial.name)}
                    </Avatar>
                  )}
                  <div>
                    <p className="font-semibold text-gray-900 text-sm sm:text-base">
                      {testimonial.name}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-500">{testimonial.profession}</p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center text-gray-500 py-8">
              No hay testimonios disponibles en este momento
            </div>
          )}
        </div>

        {/* Trust indicators */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 fade-up-slow">
          <div className="text-center">
            <p className="text-3xl sm:text-4xl font-bold text-primary mb-1">500+</p>
            <p className="text-sm text-gray-600">Profesionales activos</p>
          </div>
          <div className="text-center">
            <p className="text-3xl sm:text-4xl font-bold text-primary mb-1">10,000+</p>
            <p className="text-sm text-gray-600">Citas gestionadas</p>
          </div>
          <div className="text-center">
            <p className="text-3xl sm:text-4xl font-bold text-primary mb-1">98%</p>
            <p className="text-sm text-gray-600">Satisfacción</p>
          </div>
          <div className="text-center">
            <p className="text-3xl sm:text-4xl font-bold text-primary mb-1">24/7</p>
            <p className="text-sm text-gray-600">Disponibilidad</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
