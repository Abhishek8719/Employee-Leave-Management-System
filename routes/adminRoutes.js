import express from 'express';
import { requireAdmin } from '../middleware/auth.js';
import * as adminController from '../controllers/adminController.js';
import * as leaveController from '../controllers/leaveController.js';

const router = express.Router();

router.get('/admin/login', adminController.getAdminLogin);
router.post('/admin/login', adminController.postAdminLogin);

router.get('/admin/dashboard', requireAdmin, adminController.getAdminDashboard);

router.post('/leave/:id/approve', requireAdmin, leaveController.postApproveLeave);
router.post('/leave/:id/reject', requireAdmin, leaveController.postRejectLeave);

export default router;
