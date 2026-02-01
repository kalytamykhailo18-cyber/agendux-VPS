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

// Feature structure (matches backend/Prisma model)
export interface Feature {
  id: string;
  icon: string;
  title: string;
  description: string;
  isActive: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

// FAQ structure (matches backend/Prisma model)
export interface FAQ {
  id: string;
  question: string;
  answer: string;
  isActive: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

// Public API response - all site content for landing page
export interface SiteContent {
  hero: HeroContent;
  cta: CTAContent;
  features: Feature[];
  faqs: FAQ[];
}

// Create/Update DTOs
export interface CreateFeatureDTO {
  icon: string;
  title: string;
  description: string;
}

export interface UpdateFeatureDTO {
  icon?: string;
  title?: string;
  description?: string;
  isActive?: boolean;
  displayOrder?: number;
}

export interface CreateFAQDTO {
  question: string;
  answer: string;
}

export interface UpdateFAQDTO {
  question?: string;
  answer?: string;
  isActive?: boolean;
  displayOrder?: number;
}

export interface ReorderItem {
  id: string;
  displayOrder: number;
}
