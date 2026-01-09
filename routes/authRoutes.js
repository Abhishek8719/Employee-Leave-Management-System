import express from 'express';
import { redirectIfEmployeeAuthed } from '../middleware/auth.js';
import * as authController from '../controllers/authController.js';

const router = express.Router();

router.get('/signup', redirectIfEmployeeAuthed, authController.getSignup);
router.post('/signup', redirectIfEmployeeAuthed, authController.postSignup);

router.get('/login', redirectIfEmployeeAuthed, authController.getLogin);
router.post('/login', redirectIfEmployeeAuthed, authController.postLogin);

router.post('/logout', authController.postLogout);

router.get('/dashboard', authController.getDashboard);
export default router;
