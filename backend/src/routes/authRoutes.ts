import express from 'express';
import { registerUser, loginUser, getProfile, updateProfile } from '../controllers/authController';
import { protect } from '../middlewares/authMiddleware';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.route('/profile')
    .get(protect, getProfile)
    .put(protect, updateProfile);

export default router;
