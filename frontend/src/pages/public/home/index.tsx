import { useNavigate } from 'react-router-dom';
import HeroSection from './HeroSection';
import FeaturesSection from './FeaturesSection';
import WhatsAppDemoSection from './WhatsAppDemoSection';
import HowItWorksSection from './HowItWorksSection';
import PricingSection from './PricingSection';
import TestimonialsSection from './TestimonialsSection';
import FAQSection from './FAQSection';
import CTASection from './CTASection';

// RULE: Page folder structure - index.tsx + flat components (NO subdirectories)
// RULE: Routing via useNavigation only (no Link/a tags)
// NOTE: Header and Footer are provided by PublicLayout (root layout)

const HomePage = () => {
  const navigate = useNavigate();

  // Handle navigation
  const handleStartFree = () => {
    navigate('/register');
  };

  const handleRegister = () => {
    navigate('/register');
  };

  return (
    <div className="bg-white">
      {/* 1. Hero Section */}
      <HeroSection onStartFree={handleStartFree} />

      {/* 2. Features/Benefits Section */}
      <FeaturesSection />

      {/* 3. WhatsApp Demo Section */}
      <WhatsAppDemoSection />

      {/* 4. How It Works Section */}
      <HowItWorksSection />

      {/* 5. Pricing Section */}
      <PricingSection />

      {/* 6. Testimonials Section */}
      <TestimonialsSection />

      {/* 7. FAQ Section */}
      <FAQSection />

      {/* 8. CTA Section */}
      <CTASection onRegister={handleRegister} />
    </div>
  );
};

export default HomePage;
