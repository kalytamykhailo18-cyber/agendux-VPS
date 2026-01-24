# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Agendux is a SaaS appointment booking platform for professionals (doctors, therapists, etc.) in Argentina/LATAM. Three user roles: Admin (platform management), Professional (booking/calendar management), Patient (public booking).

## Tech Stack

- **Frontend**: React 19 + TypeScript + Vite + Redux Toolkit + Tailwind CSS + Material-UI
- **Backend**: Node.js Express + TypeScript + PostgreSQL + Prisma ORM
- **Real-time**: Socket.IO WebSockets
- **Integrations**: Google Calendar (OAuth2), Twilio WhatsApp, Mercado Pago, Resend Email

## Commands

### Frontend (from `/frontend`)
```bash
npm run build        # Build and deploy directly to /var/www/agendux/frontend/dist/
npm run lint         # ESLint
```

### Backend (from `/backend`)
```bash
npm run build                  # TypeScript compile + Prisma generate
npm run prisma:migrate         # Create migration
npm run prisma:studio          # Visual database editor
npm run prisma:seed            # Seed database
npm run db:setup               # Full setup: generate + migrate + seed
```

### Backend Deployment
After building, restart PM2:
```bash
cd /home/agendux-booking-platform/backend && npm run build && pm2 restart agendux-backend
```

## Critical Development Rules

**Re-read `/overview/rule.txt` at start of every session.**

### Data Flow Pattern (REQUIRED)
```
Page load → dispatch Redux action → Redux slice calls API → Backend queries DB → Response to Redux → useSelector → UI renders
```
- NO direct API calls from components - all through Redux slices
- TypeScript types must match: Database → Backend → Redux → Component
- Single global loading state for all requests
- Use `useNavigation()` only for routing (no `<Link>` or `<a>` tags)

### Page File Structure
Each page folder has `index.tsx` as main component with all other files flat in same folder (NO subdirectories).

### NEVER Do These
- Modify database models/migrations without explicit approval
- Work on multiple pages in parallel
- Use `<form>` tags or form submit events - use button click handlers only

## UI/Design Rules

- **MUI only for**: Buttons, inputs, icons, dialogs, modals, drawers
- **HTML+Tailwind for**: Layout containers (`<div>`, `<section>`, etc.)
- **Max border radius**: 6px (use `rounded-md` or smaller, never `rounded-lg`+)
- **Animations**: Staggered per-item with varied directions/durations, never use delay

## Architecture

### Frontend Structure
- `/frontend/src/pages/{admin,professional,public}/` - Page components by role
- `/frontend/src/store/slices/` - 15 Redux slices (auth, appointments, availability, etc.)
- `/frontend/src/layouts/` - AdminLayout, ProfessionalLayout, PublicLayout
- `/frontend/src/contexts/WebSocketContext.tsx` - Real-time updates
- `/frontend/src/config/api.ts` - Axios with retry logic (3 retries, exponential backoff)

### Backend Structure (MVC Pattern)
- `/backend/src/controllers/` - Request handlers
- `/backend/src/services/` - Business logic + external integrations
- `/backend/src/routes/` - API endpoint definitions
- `/backend/src/middleware/` - Auth, rate limiting, validation, logging
- `/backend/prisma/schema.prisma` - Database schema (20+ models)

### Key Services
- `reminder-worker.service.ts` - BullMQ job queue for WhatsApp/email reminders
- `subscription-renewal.service.ts` - Recurring subscription charges
- `google-calendar.service.ts` - Two-way calendar sync
- `whatsapp.service.ts` - Twilio WhatsApp messaging

### Security
- JWT auth (7-day expiration) + Google OAuth for professionals
- AES-256-GCM encryption for patient PII (email, phone)
- SHA-256 hash for WhatsApp number lookups
- Zod validation on all routes

## Database Key Models

- `Professional` - Has availability, appointments, subscription, Google Calendar tokens
- `Appointment` - Links professional and patient, tracks status/deposit/reminders
- `Patient` - Encrypted PII, tied to one professional
- `Availability` - Multiple time slots per day per professional
- `SlotHold` - Temporary booking holds (5 min) to prevent double-booking

## Environment

**Production VPS** - This server runs in production mode only (no local dev). Domain DNS, nginx, and SSL (certbot) are already configured.

Separate `.env` files for frontend and backend. All config via env vars, never hardcoded.
