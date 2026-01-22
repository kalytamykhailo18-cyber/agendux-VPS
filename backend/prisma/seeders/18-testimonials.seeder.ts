// ============================================
// TESTIMONIALS SEEDERS
// Creates testimonials for the homepage
// ============================================

import prisma from '../../src/config/database';

export const seedTestimonials = async () => {
  console.log('🌱 Seeding testimonials...');

  const testimonials = [
    {
      name: 'Dr. María González',
      profession: 'Odontóloga',
      review: 'Agendux transformó completamente la gestión de mi consultorio. Mis pacientes ahora pueden reservar citas 24/7 y los recordatorios automáticos por WhatsApp redujeron las ausencias en un 80%.',
      rating: 5,
      isActive: true,
      displayOrder: 1
    },
    {
      name: 'Lic. Carlos Mendoza',
      profession: 'Psicólogo',
      review: 'La sincronización con Google Calendar es perfecta. Ya no tengo que preocuparme por conflictos de horarios y puedo concentrarme en mis pacientes.',
      rating: 5,
      isActive: true,
      displayOrder: 2
    },
    {
      name: 'Dra. Ana Rodríguez',
      profession: 'Dermatóloga',
      review: 'El sistema de depósitos me ayudó a reducir las cancelaciones de último momento. Muy recomendable para cualquier profesional de la salud.',
      rating: 5,
      isActive: true,
      displayOrder: 3
    },
    {
      name: 'Prof. Roberto Silva',
      profession: 'Profesor particular',
      review: 'Excelente plataforma para gestionar mis clases. La interfaz es intuitiva y mis alumnos pueden ver mi disponibilidad en tiempo real.',
      rating: 5,
      isActive: true,
      displayOrder: 4
    },
    {
      name: 'Valentina Torres',
      profession: 'Esteticista',
      review: 'Desde que uso Agendux, mi negocio creció un 40%. Los clientes aprecian la facilidad para reservar y los recordatorios automáticos.',
      rating: 5,
      isActive: true,
      displayOrder: 5
    },
    {
      name: 'Dr. Fernando López',
      profession: 'Kinesiólogo',
      review: 'La mejor inversión que hice para mi consultorio. Simple, efectivo y mis pacientes lo aman.',
      rating: 5,
      isActive: true,
      displayOrder: 6
    }
  ];

  for (const testimonial of testimonials) {
    await prisma.testimonial.upsert({
      where: { id: `testimonial-${testimonial.displayOrder}` },
      update: testimonial,
      create: {
        id: `testimonial-${testimonial.displayOrder}`,
        ...testimonial
      }
    });
  }

  console.log(`✅ Testimonials seeded: ${testimonials.length} testimonials\n`);
};

// Run if called directly
seedTestimonials().catch(console.error);
