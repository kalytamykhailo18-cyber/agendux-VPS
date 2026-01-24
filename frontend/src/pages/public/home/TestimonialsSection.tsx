import { useEffect, useState, useCallback } from 'react';
import { Star, ChevronLeft, ChevronRight } from '@mui/icons-material';
import { Avatar, IconButton } from '@mui/material';
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
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [slidesToShow, setSlidesToShow] = useState(3);

  // Fetch testimonials on component mount
  useEffect(() => {
    dispatch(getPublicTestimonials());
  }, [dispatch]);

  // Handle responsive slides count
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setSlidesToShow(1);
      } else if (window.innerWidth < 1024) {
        setSlidesToShow(2);
      } else {
        setSlidesToShow(3);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const maxIndex = Math.max(0, publicTestimonials.length - slidesToShow);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  }, [maxIndex]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
  }, [maxIndex]);

  // Auto-play carousel
  useEffect(() => {
    if (!isAutoPlaying || publicTestimonials.length <= slidesToShow) return;

    const interval = setInterval(() => {
      nextSlide();
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, nextSlide, publicTestimonials.length, slidesToShow]);

  const goToSlide = (index: number) => {
    setCurrentIndex(Math.min(index, maxIndex));
  };

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

        {/* Carousel container */}
        {publicTestimonials.length > 0 ? (
          <div
            className="relative px-12 md:px-14"
            onMouseEnter={() => setIsAutoPlaying(false)}
            onMouseLeave={() => setIsAutoPlaying(true)}
          >
            {/* Navigation arrows - positioned outside the carousel track */}
            {publicTestimonials.length > slidesToShow && (
              <>
                <IconButton
                  onClick={prevSlide}
                  sx={{
                    position: 'absolute',
                    left: 0,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    zIndex: 10,
                    bgcolor: 'primary.main',
                    color: 'white',
                    width: 40,
                    height: 40,
                    boxShadow: 3,
                    '&:hover': {
                      bgcolor: 'primary.dark',
                    },
                  }}
                >
                  <ChevronLeft />
                </IconButton>
                <IconButton
                  onClick={nextSlide}
                  sx={{
                    position: 'absolute',
                    right: 0,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    zIndex: 10,
                    bgcolor: 'primary.main',
                    color: 'white',
                    width: 40,
                    height: 40,
                    boxShadow: 3,
                    '&:hover': {
                      bgcolor: 'primary.dark',
                    },
                  }}
                >
                  <ChevronRight />
                </IconButton>
              </>
            )}

            {/* Carousel track */}
            <div className="overflow-hidden">
              <div
                className="flex transition-transform duration-500 ease-out"
                style={{
                  transform: `translateX(-${currentIndex * (100 / slidesToShow)}%)`,
                }}
              >
                {publicTestimonials.map((testimonial) => (
                  <div
                    key={testimonial.id}
                    className="flex-shrink-0 px-3"
                    style={{ width: `${100 / slidesToShow}%` }}
                  >
                    <div className="rounded-xl bg-white p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 h-full flex flex-col">
                      {/* Rating stars */}
                      <div className="flex gap-1 mb-4">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star key={i} sx={{ fontSize: 20, color: '#FFC107' }} />
                        ))}
                      </div>

                      {/* Review text */}
                      <p className="text-sm sm:text-base text-gray-700 leading-relaxed mb-6 flex-grow">
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
                  </div>
                ))}
              </div>
            </div>

            {/* Pagination dots */}
            {publicTestimonials.length > slidesToShow && (
              <div className="flex justify-center gap-2 mt-6">
                {Array.from({ length: maxIndex + 1 }).map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToSlide(index)}
                    className={`h-2.5 rounded-full transition-all duration-300 ${
                      currentIndex === index
                        ? 'bg-primary w-8'
                        : 'bg-gray-300 hover:bg-gray-400 w-2.5'
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="text-center text-gray-500 py-8">
            No hay testimonios disponibles en este momento
          </div>
        )}

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
