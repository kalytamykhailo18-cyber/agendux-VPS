import { useNavigate } from 'react-router-dom';
import HeroSection from './HeroSection';
import FeaturesSection from './FeaturesSection';
import TestimonialsSection from './TestimonialsSection';
import WhatsAppDemoSection from './WhatsAppDemoSection';
import CTASection from './CTASection';

// RULE: Page folder structure - index.tsx + flat components (NO subdirectories)
// RULE: Routing via useNavigation only (no Link/a tags)
// NOTE: Header and Footer are provided by PublicLayout (root layout)

const HomePage = () => {
  const navigate = useNavigate();

  // Handle navigation
  const handleStartFree = () => {
    navigate('/login/professional');
  };

  const handleAdminAccess = () => {
    navigate('/login/admin');
  };

  const handleRegister = () => {
    navigate('/login/professional');
  };

  return (
    <div className="bg-gradient-to-b from-blue-50 to-white">
      {/* Hero Section */}
      <HeroSection onStartFree={handleStartFree} onAdminAccess={handleAdminAccess} />

      {/* Features Section */}
      <FeaturesSection />

      {/* Testimonials Section */}
      <TestimonialsSection />

      {/* WhatsApp Demo Section */}
      <WhatsAppDemoSection />

      {/* CTA Section */}
      <CTASection onRegister={handleRegister} />
    </div>
  );
};

export default HomePage;
