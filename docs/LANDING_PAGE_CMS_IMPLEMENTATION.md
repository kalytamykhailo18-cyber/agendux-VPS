# Landing Page CMS Implementation Guide

## Overview

This document describes how to implement a Content Management System (CMS) for the Agendux landing page, allowing administrators to edit content directly from the Admin panel without touching code.

**Sections to be editable:**
- Hero (title, subtitle, CTA button text)
- Features/Benefits (cards with icon, title, description)
- FAQ (questions and answers)
- CTA Section (title, subtitle, button text)

---

## CRITICAL RULES (from rule.txt)

Before implementing, remember these mandatory rules:

```
Flow: Page load → dispatch Redux action → Redux slice calls API → Backend queries DB
      → Response to Redux store → useSelector reads data → UI renders

Rules:
- NO direct API calls from components - all data through Redux
- TypeScript types must match: Database → Backend → Redux → Component
- Single global loading state for all requests
- Routing via useNavigation only (no Link/a tags)
- NO form tags - use button click handlers only
- Page folder structure: index.tsx + flat components (NO subdirectories)
```

---

## Architecture

### Data Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           ADMIN PANEL FLOW                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Admin UI          Redux Slice         Backend API         Database        │
│  ─────────         ───────────         ───────────         ────────        │
│                                                                             │
│  [Edit Hero]  →  dispatch(updateHeroContent)  →  PUT /api/site-content/hero │
│       │                    │                              │                 │
│       │                    ↓                              ↓                 │
│       │           API call via axios           Prisma update SiteContent   │
│       │                    │                              │                 │
│       │                    ↓                              ↓                 │
│       │           Update Redux state  ←────────  Return updated content    │
│       │                    │                                                │
│       ↓                    ↓                                                │
│  UI auto-renders with new content                                          │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                        PUBLIC LANDING PAGE FLOW                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Landing Page      Redux Slice         Backend API         Database        │
│  ────────────      ───────────         ───────────         ────────        │
│                                                                             │
│  Page Load    →  dispatch(getSiteContent)  →  GET /api/site-content        │
│       │                    │                              │                 │
│       │                    ↓                              ↓                 │
│       │           API call via axios        Prisma query SiteContent       │
│       │                    │                              │                 │
│       │                    ↓                              ↓                 │
│       │           Store in Redux state  ←────────  Return all content      │
│       │                    │                                                │
│       ↓                    ↓                                                │
│  useSelector → Render Hero, Features, FAQ, CTA with DB content             │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 1. Database Schema

### File: `/backend/prisma/schema.prisma`

Add these models:

```prisma
// ============================================
// SITE CONTENT (CMS for Landing Page)
// ============================================

model SiteContent {
  id          String    @id @default(uuid())
  section     String    @unique // 'hero', 'cta'
  content     Json      // Flexible JSON for different section structures
  isActive    Boolean   @default(true)
  updatedAt   DateTime  @updatedAt
  updatedBy   String?   // Admin user ID who last updated

  @@index([section])
  @@map("site_content")
}

model Feature {
  id           String    @id @default(uuid())
  icon         String    // Icon name (e.g., 'AccessTime', 'AttachMoney', 'QrCode2', 'Star')
  title        String
  description  String    @db.Text
  isActive     Boolean   @default(true)
  displayOrder Int       @default(0)
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt

  @@index([isActive, displayOrder])
  @@map("features")
}

model FAQ {
  id           String    @id @default(uuid())
  question     String
  answer       String    @db.Text
  isActive     Boolean   @default(true)
  displayOrder Int       @default(0)
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt

  @@index([isActive, displayOrder])
  @@map("faqs")
}
```

### Content JSON Structures

**Hero Section (`section: 'hero'`):**
```json
{
  "title": "Dejá de perder tiempo dando turnos por mensajes y llamadas",
  "subtitle": "Tu link personalizado + código QR para que tus pacientes reserven solos, 24/7",
  "linkExample": "agendux.com/tunombre",
  "ctaButtonText": "Comenzar Gratis - Sin Tarjeta",
  "ctaSubtext": "14 días de prueba gratis • Obtené tu link y QR en minutos"
}
```

**CTA Section (`section: 'cta'`):**
```json
{
  "title": "¿Listo para dejar de perder tiempo con los turnos?",
  "subtitle": "Obtené tu link y QR en minutos. Empezá hoy mismo sin complicaciones.",
  "buttonText": "Comenzar Gratis - Sin Tarjeta",
  "subtext": "14 días de prueba gratis • Sin compromiso • Cancelá cuando quieras"
}
```

---

## 2. Backend Implementation

### 2.1 TypeScript Types

**File: `/backend/src/types/site-content.types.ts`**

```typescript
// Hero content structure
export interface HeroContent {
  title: string;
  subtitle: string;
  linkExample: string;
  ctaButtonText: string;
  ctaSubtext: string;
}

// CTA content structure
export interface CTAContent {
  title: string;
  subtitle: string;
  buttonText: string;
  subtext: string;
}

// Feature structure
export interface Feature {
  id: string;
  icon: string;
  title: string;
  description: string;
  isActive: boolean;
  displayOrder: number;
}

// FAQ structure
export interface FAQ {
  id: string;
  question: string;
  answer: string;
  isActive: boolean;
  displayOrder: number;
}

// All site content for landing page
export interface SiteContentResponse {
  hero: HeroContent;
  cta: CTAContent;
  features: Feature[];
  faqs: FAQ[];
}
```

### 2.2 Routes

**File: `/backend/src/routes/site-content.routes.ts`**

```typescript
import { Router } from 'express';
import {
  getPublicSiteContent,
  getAdminHeroContent,
  updateHeroContent,
  getAdminCTAContent,
  updateCTAContent,
  getAdminFeatures,
  createFeature,
  updateFeature,
  deleteFeature,
  reorderFeatures,
  getAdminFAQs,
  createFAQ,
  updateFAQ,
  deleteFAQ,
  reorderFAQs,
} from '../controllers/site-content.controller';
import { authenticateAdmin } from '../middlewares/auth.middleware';
import { validateBody } from '../middleware/validation.middleware';
import { z } from 'zod';

const router = Router();

// ============================================
// PUBLIC ROUTES (No authentication)
// ============================================

// GET /api/site-content - Get all content for landing page
router.get('/', getPublicSiteContent);

// ============================================
// ADMIN ROUTES (Require admin authentication)
// ============================================

// --- Hero ---
const heroSchema = z.object({
  title: z.string().min(1).max(200),
  subtitle: z.string().min(1).max(500),
  linkExample: z.string().min(1).max(100),
  ctaButtonText: z.string().min(1).max(100),
  ctaSubtext: z.string().min(1).max(200),
});

router.get('/admin/hero', authenticateAdmin, getAdminHeroContent);
router.put('/admin/hero', authenticateAdmin, validateBody(heroSchema), updateHeroContent);

// --- CTA ---
const ctaSchema = z.object({
  title: z.string().min(1).max(200),
  subtitle: z.string().min(1).max(500),
  buttonText: z.string().min(1).max(100),
  subtext: z.string().min(1).max(200),
});

router.get('/admin/cta', authenticateAdmin, getAdminCTAContent);
router.put('/admin/cta', authenticateAdmin, validateBody(ctaSchema), updateCTAContent);

// --- Features ---
const featureSchema = z.object({
  icon: z.string().min(1).max(50),
  title: z.string().min(1).max(100),
  description: z.string().min(1).max(500),
  isActive: z.boolean().optional(),
  displayOrder: z.number().int().min(0).optional(),
});

const reorderSchema = z.object({
  orders: z.array(
    z.object({
      id: z.string().uuid(),
      displayOrder: z.number().int().min(0),
    })
  ).min(1),
});

router.get('/admin/features', authenticateAdmin, getAdminFeatures);
router.post('/admin/features', authenticateAdmin, validateBody(featureSchema), createFeature);
router.put('/admin/features/:id', authenticateAdmin, validateBody(featureSchema.partial()), updateFeature);
router.delete('/admin/features/:id', authenticateAdmin, deleteFeature);
router.post('/admin/features/reorder', authenticateAdmin, validateBody(reorderSchema), reorderFeatures);

// --- FAQs ---
const faqSchema = z.object({
  question: z.string().min(1).max(300),
  answer: z.string().min(1).max(2000),
  isActive: z.boolean().optional(),
  displayOrder: z.number().int().min(0).optional(),
});

router.get('/admin/faqs', authenticateAdmin, getAdminFAQs);
router.post('/admin/faqs', authenticateAdmin, validateBody(faqSchema), createFAQ);
router.put('/admin/faqs/:id', authenticateAdmin, validateBody(faqSchema.partial()), updateFAQ);
router.delete('/admin/faqs/:id', authenticateAdmin, deleteFAQ);
router.post('/admin/faqs/reorder', authenticateAdmin, validateBody(reorderSchema), reorderFAQs);

export default router;
```

### 2.3 Controller

**File: `/backend/src/controllers/site-content.controller.ts`**

```typescript
import { Request, Response } from 'express';
import prisma from '../config/database';
import { logger } from '../utils/logger';

// Default content (used if database is empty)
const DEFAULT_HERO = {
  title: 'Dejá de perder tiempo dando turnos por mensajes y llamadas',
  subtitle: 'Tu link personalizado + código QR para que tus pacientes reserven solos, 24/7',
  linkExample: 'agendux.com/tunombre',
  ctaButtonText: 'Comenzar Gratis - Sin Tarjeta',
  ctaSubtext: '14 días de prueba gratis • Obtené tu link y QR en minutos',
};

const DEFAULT_CTA = {
  title: '¿Listo para dejar de perder tiempo con los turnos?',
  subtitle: 'Obtené tu link y QR en minutos. Empezá hoy mismo sin complicaciones.',
  buttonText: 'Comenzar Gratis - Sin Tarjeta',
  subtext: '14 días de prueba gratis • Sin compromiso • Cancelá cuando quieras',
};

// ============================================
// PUBLIC: Get all site content
// ============================================

export async function getPublicSiteContent(req: Request, res: Response) {
  try {
    // Get Hero and CTA from SiteContent
    const [heroRow, ctaRow] = await Promise.all([
      prisma.siteContent.findUnique({ where: { section: 'hero' } }),
      prisma.siteContent.findUnique({ where: { section: 'cta' } }),
    ]);

    // Get Features and FAQs
    const [features, faqs] = await Promise.all([
      prisma.feature.findMany({
        where: { isActive: true },
        orderBy: { displayOrder: 'asc' },
      }),
      prisma.fAQ.findMany({
        where: { isActive: true },
        orderBy: { displayOrder: 'asc' },
      }),
    ]);

    res.json({
      success: true,
      data: {
        hero: heroRow?.content || DEFAULT_HERO,
        cta: ctaRow?.content || DEFAULT_CTA,
        features,
        faqs,
      },
    });
  } catch (error) {
    logger.error('Error fetching site content:', error);
    res.status(500).json({ success: false, error: 'Error al obtener contenido' });
  }
}

// ============================================
// ADMIN: Hero Content
// ============================================

export async function getAdminHeroContent(req: Request, res: Response) {
  try {
    const hero = await prisma.siteContent.findUnique({ where: { section: 'hero' } });
    res.json({ success: true, data: hero?.content || DEFAULT_HERO });
  } catch (error) {
    logger.error('Error fetching hero content:', error);
    res.status(500).json({ success: false, error: 'Error al obtener contenido' });
  }
}

export async function updateHeroContent(req: Request, res: Response) {
  try {
    const content = req.body;
    const adminId = req.userId;

    const hero = await prisma.siteContent.upsert({
      where: { section: 'hero' },
      update: { content, updatedBy: adminId },
      create: { section: 'hero', content, updatedBy: adminId },
    });

    res.json({ success: true, data: hero.content });
  } catch (error) {
    logger.error('Error updating hero content:', error);
    res.status(500).json({ success: false, error: 'Error al actualizar contenido' });
  }
}

// ============================================
// ADMIN: CTA Content
// ============================================

export async function getAdminCTAContent(req: Request, res: Response) {
  try {
    const cta = await prisma.siteContent.findUnique({ where: { section: 'cta' } });
    res.json({ success: true, data: cta?.content || DEFAULT_CTA });
  } catch (error) {
    logger.error('Error fetching CTA content:', error);
    res.status(500).json({ success: false, error: 'Error al obtener contenido' });
  }
}

export async function updateCTAContent(req: Request, res: Response) {
  try {
    const content = req.body;
    const adminId = req.userId;

    const cta = await prisma.siteContent.upsert({
      where: { section: 'cta' },
      update: { content, updatedBy: adminId },
      create: { section: 'cta', content, updatedBy: adminId },
    });

    res.json({ success: true, data: cta.content });
  } catch (error) {
    logger.error('Error updating CTA content:', error);
    res.status(500).json({ success: false, error: 'Error al actualizar contenido' });
  }
}

// ============================================
// ADMIN: Features (CRUD)
// ============================================

export async function getAdminFeatures(req: Request, res: Response) {
  try {
    const features = await prisma.feature.findMany({
      orderBy: { displayOrder: 'asc' },
    });
    res.json({ success: true, data: features });
  } catch (error) {
    logger.error('Error fetching features:', error);
    res.status(500).json({ success: false, error: 'Error al obtener features' });
  }
}

export async function createFeature(req: Request, res: Response) {
  try {
    const { icon, title, description } = req.body;

    // Get max display order
    const maxOrder = await prisma.feature.aggregate({ _max: { displayOrder: true } });
    const displayOrder = (maxOrder._max.displayOrder || 0) + 1;

    const feature = await prisma.feature.create({
      data: { icon, title, description, displayOrder },
    });

    res.status(201).json({ success: true, data: feature });
  } catch (error) {
    logger.error('Error creating feature:', error);
    res.status(500).json({ success: false, error: 'Error al crear feature' });
  }
}

export async function updateFeature(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const data = req.body;

    const feature = await prisma.feature.update({
      where: { id },
      data,
    });

    res.json({ success: true, data: feature });
  } catch (error) {
    logger.error('Error updating feature:', error);
    res.status(500).json({ success: false, error: 'Error al actualizar feature' });
  }
}

export async function deleteFeature(req: Request, res: Response) {
  try {
    const { id } = req.params;
    await prisma.feature.delete({ where: { id } });
    res.json({ success: true, message: 'Feature eliminado' });
  } catch (error) {
    logger.error('Error deleting feature:', error);
    res.status(500).json({ success: false, error: 'Error al eliminar feature' });
  }
}

export async function reorderFeatures(req: Request, res: Response) {
  try {
    const { orders } = req.body;

    await prisma.$transaction(
      orders.map((item: { id: string; displayOrder: number }) =>
        prisma.feature.update({
          where: { id: item.id },
          data: { displayOrder: item.displayOrder },
        })
      )
    );

    const features = await prisma.feature.findMany({ orderBy: { displayOrder: 'asc' } });
    res.json({ success: true, data: features });
  } catch (error) {
    logger.error('Error reordering features:', error);
    res.status(500).json({ success: false, error: 'Error al reordenar features' });
  }
}

// ============================================
// ADMIN: FAQs (CRUD)
// ============================================

export async function getAdminFAQs(req: Request, res: Response) {
  try {
    const faqs = await prisma.fAQ.findMany({
      orderBy: { displayOrder: 'asc' },
    });
    res.json({ success: true, data: faqs });
  } catch (error) {
    logger.error('Error fetching FAQs:', error);
    res.status(500).json({ success: false, error: 'Error al obtener FAQs' });
  }
}

export async function createFAQ(req: Request, res: Response) {
  try {
    const { question, answer } = req.body;

    const maxOrder = await prisma.fAQ.aggregate({ _max: { displayOrder: true } });
    const displayOrder = (maxOrder._max.displayOrder || 0) + 1;

    const faq = await prisma.fAQ.create({
      data: { question, answer, displayOrder },
    });

    res.status(201).json({ success: true, data: faq });
  } catch (error) {
    logger.error('Error creating FAQ:', error);
    res.status(500).json({ success: false, error: 'Error al crear FAQ' });
  }
}

export async function updateFAQ(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const data = req.body;

    const faq = await prisma.fAQ.update({
      where: { id },
      data,
    });

    res.json({ success: true, data: faq });
  } catch (error) {
    logger.error('Error updating FAQ:', error);
    res.status(500).json({ success: false, error: 'Error al actualizar FAQ' });
  }
}

export async function deleteFAQ(req: Request, res: Response) {
  try {
    const { id } = req.params;
    await prisma.fAQ.delete({ where: { id } });
    res.json({ success: true, message: 'FAQ eliminado' });
  } catch (error) {
    logger.error('Error deleting FAQ:', error);
    res.status(500).json({ success: false, error: 'Error al eliminar FAQ' });
  }
}

export async function reorderFAQs(req: Request, res: Response) {
  try {
    const { orders } = req.body;

    await prisma.$transaction(
      orders.map((item: { id: string; displayOrder: number }) =>
        prisma.fAQ.update({
          where: { id: item.id },
          data: { displayOrder: item.displayOrder },
        })
      )
    );

    const faqs = await prisma.fAQ.findMany({ orderBy: { displayOrder: 'asc' } });
    res.json({ success: true, data: faqs });
  } catch (error) {
    logger.error('Error reordering FAQs:', error);
    res.status(500).json({ success: false, error: 'Error al reordenar FAQs' });
  }
}
```

### 2.4 Register Routes

**File: `/backend/src/routes/index.ts`**

Add to existing routes:

```typescript
import siteContentRoutes from './site-content.routes';

// ... existing routes ...

router.use('/site-content', siteContentRoutes);
```

---

## 3. Frontend Implementation

### 3.1 TypeScript Types

**File: `/frontend/src/types/site-content.ts`**

```typescript
export interface HeroContent {
  title: string;
  subtitle: string;
  linkExample: string;
  ctaButtonText: string;
  ctaSubtext: string;
}

export interface CTAContent {
  title: string;
  subtitle: string;
  buttonText: string;
  subtext: string;
}

export interface Feature {
  id: string;
  icon: string;
  title: string;
  description: string;
  isActive: boolean;
  displayOrder: number;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  isActive: boolean;
  displayOrder: number;
}

export interface SiteContent {
  hero: HeroContent;
  cta: CTAContent;
  features: Feature[];
  faqs: FAQ[];
}
```

### 3.2 Redux Slice

**File: `/frontend/src/store/slices/siteContentSlice.ts`**

```typescript
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../config/api';
import type { SiteContent, HeroContent, CTAContent, Feature, FAQ } from '../../types/site-content';
import { setLoading } from './loadingSlice';

interface SiteContentState {
  // Public content (landing page)
  content: SiteContent | null;

  // Admin edit states
  adminHero: HeroContent | null;
  adminCTA: CTAContent | null;
  adminFeatures: Feature[];
  adminFAQs: FAQ[];

  error: string | null;
  successMessage: string | null;
}

const initialState: SiteContentState = {
  content: null,
  adminHero: null,
  adminCTA: null,
  adminFeatures: [],
  adminFAQs: [],
  error: null,
  successMessage: null,
};

// ============================================
// PUBLIC THUNKS
// ============================================

export const getSiteContent = createAsyncThunk(
  'siteContent/getSiteContent',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const response = await api.get('/site-content');
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Error al cargar contenido');
    } finally {
      dispatch(setLoading(false));
    }
  }
);

// ============================================
// ADMIN THUNKS - Hero
// ============================================

export const getAdminHero = createAsyncThunk(
  'siteContent/getAdminHero',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const response = await api.get('/site-content/admin/hero');
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Error al cargar hero');
    } finally {
      dispatch(setLoading(false));
    }
  }
);

export const updateAdminHero = createAsyncThunk(
  'siteContent/updateAdminHero',
  async (data: HeroContent, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const response = await api.put('/site-content/admin/hero', data);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Error al actualizar hero');
    } finally {
      dispatch(setLoading(false));
    }
  }
);

// ============================================
// ADMIN THUNKS - CTA
// ============================================

export const getAdminCTA = createAsyncThunk(
  'siteContent/getAdminCTA',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const response = await api.get('/site-content/admin/cta');
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Error al cargar CTA');
    } finally {
      dispatch(setLoading(false));
    }
  }
);

export const updateAdminCTA = createAsyncThunk(
  'siteContent/updateAdminCTA',
  async (data: CTAContent, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const response = await api.put('/site-content/admin/cta', data);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Error al actualizar CTA');
    } finally {
      dispatch(setLoading(false));
    }
  }
);

// ============================================
// ADMIN THUNKS - Features
// ============================================

export const getAdminFeatures = createAsyncThunk(
  'siteContent/getAdminFeatures',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const response = await api.get('/site-content/admin/features');
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Error al cargar features');
    } finally {
      dispatch(setLoading(false));
    }
  }
);

export const createAdminFeature = createAsyncThunk(
  'siteContent/createAdminFeature',
  async (data: Omit<Feature, 'id' | 'isActive' | 'displayOrder'>, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const response = await api.post('/site-content/admin/features', data);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Error al crear feature');
    } finally {
      dispatch(setLoading(false));
    }
  }
);

export const updateAdminFeature = createAsyncThunk(
  'siteContent/updateAdminFeature',
  async ({ id, data }: { id: string; data: Partial<Feature> }, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const response = await api.put(`/site-content/admin/features/${id}`, data);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Error al actualizar feature');
    } finally {
      dispatch(setLoading(false));
    }
  }
);

export const deleteAdminFeature = createAsyncThunk(
  'siteContent/deleteAdminFeature',
  async (id: string, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      await api.delete(`/site-content/admin/features/${id}`);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Error al eliminar feature');
    } finally {
      dispatch(setLoading(false));
    }
  }
);

// ============================================
// ADMIN THUNKS - FAQs
// ============================================

export const getAdminFAQs = createAsyncThunk(
  'siteContent/getAdminFAQs',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const response = await api.get('/site-content/admin/faqs');
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Error al cargar FAQs');
    } finally {
      dispatch(setLoading(false));
    }
  }
);

export const createAdminFAQ = createAsyncThunk(
  'siteContent/createAdminFAQ',
  async (data: { question: string; answer: string }, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const response = await api.post('/site-content/admin/faqs', data);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Error al crear FAQ');
    } finally {
      dispatch(setLoading(false));
    }
  }
);

export const updateAdminFAQ = createAsyncThunk(
  'siteContent/updateAdminFAQ',
  async ({ id, data }: { id: string; data: Partial<FAQ> }, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const response = await api.put(`/site-content/admin/faqs/${id}`, data);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Error al actualizar FAQ');
    } finally {
      dispatch(setLoading(false));
    }
  }
);

export const deleteAdminFAQ = createAsyncThunk(
  'siteContent/deleteAdminFAQ',
  async (id: string, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      await api.delete(`/site-content/admin/faqs/${id}`);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Error al eliminar FAQ');
    } finally {
      dispatch(setLoading(false));
    }
  }
);

// ============================================
// SLICE
// ============================================

const siteContentSlice = createSlice({
  name: 'siteContent',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    // Public content
    builder.addCase(getSiteContent.fulfilled, (state, action) => {
      state.content = action.payload;
      state.error = null;
    });
    builder.addCase(getSiteContent.rejected, (state, action) => {
      state.error = action.payload as string;
    });

    // Admin Hero
    builder.addCase(getAdminHero.fulfilled, (state, action) => {
      state.adminHero = action.payload;
    });
    builder.addCase(updateAdminHero.fulfilled, (state, action) => {
      state.adminHero = action.payload;
      state.successMessage = 'Hero actualizado correctamente';
    });

    // Admin CTA
    builder.addCase(getAdminCTA.fulfilled, (state, action) => {
      state.adminCTA = action.payload;
    });
    builder.addCase(updateAdminCTA.fulfilled, (state, action) => {
      state.adminCTA = action.payload;
      state.successMessage = 'CTA actualizado correctamente';
    });

    // Admin Features
    builder.addCase(getAdminFeatures.fulfilled, (state, action) => {
      state.adminFeatures = action.payload;
    });
    builder.addCase(createAdminFeature.fulfilled, (state, action) => {
      state.adminFeatures.push(action.payload);
      state.successMessage = 'Feature creado correctamente';
    });
    builder.addCase(updateAdminFeature.fulfilled, (state, action) => {
      const index = state.adminFeatures.findIndex(f => f.id === action.payload.id);
      if (index !== -1) state.adminFeatures[index] = action.payload;
      state.successMessage = 'Feature actualizado correctamente';
    });
    builder.addCase(deleteAdminFeature.fulfilled, (state, action) => {
      state.adminFeatures = state.adminFeatures.filter(f => f.id !== action.payload);
      state.successMessage = 'Feature eliminado correctamente';
    });

    // Admin FAQs
    builder.addCase(getAdminFAQs.fulfilled, (state, action) => {
      state.adminFAQs = action.payload;
    });
    builder.addCase(createAdminFAQ.fulfilled, (state, action) => {
      state.adminFAQs.push(action.payload);
      state.successMessage = 'FAQ creado correctamente';
    });
    builder.addCase(updateAdminFAQ.fulfilled, (state, action) => {
      const index = state.adminFAQs.findIndex(f => f.id === action.payload.id);
      if (index !== -1) state.adminFAQs[index] = action.payload;
      state.successMessage = 'FAQ actualizado correctamente';
    });
    builder.addCase(deleteAdminFAQ.fulfilled, (state, action) => {
      state.adminFAQs = state.adminFAQs.filter(f => f.id !== action.payload);
      state.successMessage = 'FAQ eliminado correctamente';
    });

    // Handle all rejections
    builder.addMatcher(
      (action) => action.type.startsWith('siteContent/') && action.type.endsWith('/rejected'),
      (state, action: any) => {
        state.error = action.payload || 'Error desconocido';
      }
    );
  },
});

export const { clearError, clearSuccess } = siteContentSlice.actions;
export default siteContentSlice.reducer;
```

### 3.3 Register Slice in Store

**File: `/frontend/src/store/index.ts`**

```typescript
import siteContentReducer from './slices/siteContentSlice';

// Add to combineReducers:
export const store = configureStore({
  reducer: {
    // ... existing reducers ...
    siteContent: siteContentReducer,
  },
});
```

---

## 4. Admin UI Pages

### 4.1 File Structure

```
/frontend/src/pages/admin/site-content/
├── index.tsx              # Main page with tabs
├── HeroEditor.tsx         # Hero section editor
├── CTAEditor.tsx          # CTA section editor
├── FeaturesEditor.tsx     # Features list + CRUD
├── FeatureFormModal.tsx   # Feature create/edit modal
├── FAQsEditor.tsx         # FAQs list + CRUD
└── FAQFormModal.tsx       # FAQ create/edit modal
```

### 4.2 Main Page Component

**File: `/frontend/src/pages/admin/site-content/index.tsx`**

```typescript
import { useState } from 'react';
import { Tabs, Tab, Box } from '@mui/material';
import HeroEditor from './HeroEditor';
import CTAEditor from './CTAEditor';
import FeaturesEditor from './FeaturesEditor';
import FAQsEditor from './FAQsEditor';

// RULE: Page folder structure - index.tsx + flat components (NO subdirectories)
// RULE: Page load → dispatch action → API call → state updates → component renders
// RULE: NO direct API calls from component

const AdminSiteContentPage = () => {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Contenido del Sitio
        </h1>

        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)}>
            <Tab label="Hero" />
            <Tab label="Features" />
            <Tab label="FAQ" />
            <Tab label="CTA" />
          </Tabs>
        </Box>

        {activeTab === 0 && <HeroEditor />}
        {activeTab === 1 && <FeaturesEditor />}
        {activeTab === 2 && <FAQsEditor />}
        {activeTab === 3 && <CTAEditor />}
      </div>
    </div>
  );
};

export default AdminSiteContentPage;
```

### 4.3 Add Route

**File: `/frontend/src/routes/index.tsx`**

Add to admin routes:

```typescript
{
  path: 'site-content',
  element: <AdminSiteContentPage />,
},
```

### 4.4 Add to Admin Sidebar

Update the admin sidebar navigation to include "Contenido del Sitio" link.

---

## 5. Update Landing Page Components

### 5.1 Update HeroSection.tsx

Replace hardcoded content with Redux data:

```typescript
import { useAppSelector } from '../../../store';

const HeroSection = ({ onStartFree }: HeroSectionProps) => {
  const { content } = useAppSelector((state) => state.siteContent);
  const hero = content?.hero;

  // Fallback to default if not loaded
  const title = hero?.title || 'Dejá de perder tiempo...';
  const subtitle = hero?.subtitle || 'Tu link personalizado...';
  // ... etc

  return (
    <section>
      <h1>{title}</h1>
      <p>{subtitle}</p>
      {/* ... */}
    </section>
  );
};
```

### 5.2 Update FeaturesSection.tsx

```typescript
import { useAppSelector } from '../../../store';
import { getIconComponent } from '../../../utils/icons';

const FeaturesSection = () => {
  const { content } = useAppSelector((state) => state.siteContent);
  const features = content?.features || [];

  return (
    <section>
      {features.map((feature) => (
        <div key={feature.id}>
          {getIconComponent(feature.icon)}
          <h3>{feature.title}</h3>
          <p>{feature.description}</p>
        </div>
      ))}
    </section>
  );
};
```

### 5.3 Update FAQSection.tsx

```typescript
import { useAppSelector } from '../../../store';

const FAQSection = () => {
  const { content } = useAppSelector((state) => state.siteContent);
  const faqs = content?.faqs || [];

  return (
    <section>
      {faqs.map((faq) => (
        <div key={faq.id}>
          <h3>{faq.question}</h3>
          <p>{faq.answer}</p>
        </div>
      ))}
    </section>
  );
};
```

### 5.4 Load Content on App Init

**File: `/frontend/src/pages/public/home/index.tsx`**

```typescript
import { useEffect } from 'react';
import { useAppDispatch } from '../../../store';
import { getSiteContent } from '../../../store/slices/siteContentSlice';

const HomePage = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(getSiteContent());
  }, [dispatch]);

  // ... rest of component
};
```

---

## 6. Icon Mapping Utility

**File: `/frontend/src/utils/icons.tsx`**

```typescript
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import StarIcon from '@mui/icons-material/Star';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AutorenewIcon from '@mui/icons-material/Autorenew';
// ... add more as needed

const iconMap: Record<string, React.ComponentType<any>> = {
  AccessTime: AccessTimeIcon,
  AttachMoney: AttachMoneyIcon,
  QrCode2: QrCode2Icon,
  Star: StarIcon,
  CalendarMonth: CalendarMonthIcon,
  Autorenew: AutorenewIcon,
};

export function getIconComponent(iconName: string) {
  const IconComponent = iconMap[iconName];
  return IconComponent ? <IconComponent sx={{ fontSize: 40 }} /> : null;
}

export const availableIcons = Object.keys(iconMap);
```

---

## 7. Migration & Seed Data

### 7.1 Create Migration

```bash
cd /backend
npx prisma migrate dev --name add_site_content_cms
```

### 7.2 Seed Initial Data

**File: `/backend/prisma/seed.ts`**

Add to existing seed:

```typescript
// Seed Hero content
await prisma.siteContent.upsert({
  where: { section: 'hero' },
  update: {},
  create: {
    section: 'hero',
    content: {
      title: 'Dejá de perder tiempo dando turnos por mensajes y llamadas',
      subtitle: 'Tu link personalizado + código QR para que tus pacientes reserven solos, 24/7',
      linkExample: 'agendux.com/tunombre',
      ctaButtonText: 'Comenzar Gratis - Sin Tarjeta',
      ctaSubtext: '14 días de prueba gratis • Obtené tu link y QR en minutos',
    },
  },
});

// Seed CTA content
await prisma.siteContent.upsert({
  where: { section: 'cta' },
  update: {},
  create: {
    section: 'cta',
    content: {
      title: '¿Listo para dejar de perder tiempo con los turnos?',
      subtitle: 'Obtené tu link y QR en minutos. Empezá hoy mismo sin complicaciones.',
      buttonText: 'Comenzar Gratis - Sin Tarjeta',
      subtext: '14 días de prueba gratis • Sin compromiso • Cancelá cuando quieras',
    },
  },
});

// Seed Features
const features = [
  { icon: 'AccessTime', title: 'Sin más llamadas ni WhatsApp', description: '...' },
  { icon: 'AttachMoney', title: 'Cobrá señas automáticamente', description: '...' },
  { icon: 'QrCode2', title: 'Tu link y QR propios', description: '...' },
  { icon: 'Star', title: 'Imagen profesional sin esfuerzo', description: '...' },
];

for (let i = 0; i < features.length; i++) {
  await prisma.feature.create({
    data: { ...features[i], displayOrder: i },
  });
}

// Seed FAQs
const faqs = [
  { question: '¿Cómo obtengo mi link personalizado?', answer: '...' },
  // ... more FAQs
];

for (let i = 0; i < faqs.length; i++) {
  await prisma.fAQ.create({
    data: { ...faqs[i], displayOrder: i },
  });
}
```

---

## 8. Implementation Checklist

### Backend
- [ ] Add models to Prisma schema
- [ ] Run migration
- [ ] Create types file
- [ ] Create controller
- [ ] Create routes
- [ ] Register routes in index.ts
- [ ] Run seed

### Frontend
- [ ] Create types file
- [ ] Create Redux slice
- [ ] Register slice in store
- [ ] Create admin page components
- [ ] Add admin route
- [ ] Update sidebar navigation
- [ ] Update HeroSection to use Redux
- [ ] Update FeaturesSection to use Redux
- [ ] Update FAQSection to use Redux
- [ ] Update CTASection to use Redux
- [ ] Create icon utility
- [ ] Test full flow

### Testing
- [ ] Test public endpoint returns content
- [ ] Test admin CRUD for each section
- [ ] Test landing page renders DB content
- [ ] Test fallback to defaults when DB empty

---

## 9. API Endpoints Summary

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/site-content` | Public | Get all content for landing page |
| GET | `/api/site-content/admin/hero` | Admin | Get hero content |
| PUT | `/api/site-content/admin/hero` | Admin | Update hero content |
| GET | `/api/site-content/admin/cta` | Admin | Get CTA content |
| PUT | `/api/site-content/admin/cta` | Admin | Update CTA content |
| GET | `/api/site-content/admin/features` | Admin | Get all features |
| POST | `/api/site-content/admin/features` | Admin | Create feature |
| PUT | `/api/site-content/admin/features/:id` | Admin | Update feature |
| DELETE | `/api/site-content/admin/features/:id` | Admin | Delete feature |
| POST | `/api/site-content/admin/features/reorder` | Admin | Reorder features |
| GET | `/api/site-content/admin/faqs` | Admin | Get all FAQs |
| POST | `/api/site-content/admin/faqs` | Admin | Create FAQ |
| PUT | `/api/site-content/admin/faqs/:id` | Admin | Update FAQ |
| DELETE | `/api/site-content/admin/faqs/:id` | Admin | Delete FAQ |
| POST | `/api/site-content/admin/faqs/reorder` | Admin | Reorder FAQs |

---

## Notes

- All content has fallback defaults if database is empty
- Features and FAQs support drag-and-drop reordering via `displayOrder`
- Icon selection uses a predefined list of MUI icons
- FAQ answers support basic HTML for formatting (bold, links, lists)
- Changes are reflected immediately on the landing page (no cache)
