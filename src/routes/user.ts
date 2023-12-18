import express, { Router } from 'express';
import { auth } from '../middleware/auth';
import UserController from '../controller/user';

const router: Router = express.Router();

router.get('/me', auth, UserController.getMe);
router.post('/', auth, UserController.registerUser);

export default router;
