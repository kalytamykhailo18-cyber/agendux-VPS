// ============================================
// SITE CONTENT CMS TYPES
// Types must match: Database → Backend → Redux → Component
// ============================================

// Hero section content structure
export interface HeroContent {
  title: string;
  subtitle: string;
  linkExample: string;
  ctaButtonText: string;
  ctaSubtext: string;
}

// CTA section content structure
export interface CTAContent {
  title: string;
  subtitle: string;
  buttonText: string;
  subtext: string;
}

// Feature structure (matches Prisma model)
export interface Feature {
  id: string;
  icon: string;
  title: string;
  description: string;
  isActive: boolean;
  displayOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

// FAQ structure (matches Prisma model)
export interface FAQ {
  id: string;
  question: string;
  answer: string;
  isActive: boolean;
  displayOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

// Public API response - all site content for landing page
export interface SiteContentResponse {
  hero: HeroContent;
  cta: CTAContent;
  features: Feature[];
  faqs: FAQ[];
}

// Reorder request body
export interface ReorderItem {
  id: string;
  displayOrder: number;
}
