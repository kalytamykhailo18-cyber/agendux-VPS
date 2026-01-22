import { Router } from 'express';
import { authenticateToken, requireRole } from '../middlewares/auth.middleware';
import {
  getDashboardStats,
  getProfessionals,
  getProfessionalDetail,
  suspendProfessional,
  activateProfessional,
  getProfessionalAvailability,
  updateProfessionalAvailability,
  getProfessionalBlockedDates,
  addProfessionalBlockedDate,
  removeProfessionalBlockedDate,
  getPlans,
  createPlan,
  updatePlan,
  deletePlan,
  reorderPlans,
  getStatistics,
  getSettings,
  updateSettings
} from '../controllers/admin.controller';

const router = Router();

// All routes require admin authentication
router.use(authenticateToken);
router.use(requireRole(['ADMIN']));

// Dashboard
router.get('/dashboard', getDashboardStats);

// Professionals management
router.get('/professionals', getProfessionals);
router.get('/professionals/:id', getProfessionalDetail);
router.put('/professionals/:id/suspend', suspendProfessional);
router.put('/professionals/:id/activate', activateProfessional);

// Professional settings management (admin can edit)
router.get('/professionals/:id/availability', getProfessionalAvailability);
router.put('/professionals/:id/availability', updateProfessionalAvailability);
router.get('/professionals/:id/blocked-dates', getProfessionalBlockedDates);
router.post('/professionals/:id/blocked-dates', addProfessionalBlockedDate);
router.delete('/professionals/:id/blocked-dates/:dateId', removeProfessionalBlockedDate);

// Subscription plans management
router.get('/plans', getPlans);
router.post('/plans', createPlan);
router.put('/plans/reorder', reorderPlans);
router.put('/plans/:id', updatePlan);
router.delete('/plans/:id', deletePlan);

// Statistics
router.get('/statistics', getStatistics);

// Platform settings
router.get('/settings', getSettings);
router.put('/settings', updateSettings);

export default router;
