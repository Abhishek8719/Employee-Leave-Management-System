import express from 'express';
import { requireEmployee } from '../middleware/auth.js';
import * as leaveController from '../controllers/leaveController.js';

const router = express.Router();

router.get('/apply-leave', requireEmployee, leaveController.getApplyLeave);
router.post('/apply-leave', requireEmployee, leaveController.postApplyLeave);

router.get('/leave/:id/edit', requireEmployee, leaveController.getEditLeave);
router.post('/leave/:id/update', requireEmployee, leaveController.postUpdateLeave);
router.post('/leave/:id/delete', requireEmployee, leaveController.postDeleteLeave);

export default router;
