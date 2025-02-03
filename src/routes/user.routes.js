import {Router} from 'express';
import {forgotPassword, loginUser, logoutUser, registerUser, resetPassword} from "../controllers/user.controller.js";

const router = Router();

router.route('/signup').post(registerUser);
router.route('/login').post(loginUser);
router.route('/logout').post(logoutUser);
router.route('/forgot-password').post(forgotPassword);
router.route('/forgot-password/:token').post(resetPassword);

export default router;