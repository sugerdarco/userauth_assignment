import {Router} from 'express';
import {forgotPassword, loginUser, logoutUser, registerUser, resetPassword} from "../controllers/user.controller.js";
import {verifyJWT} from "../middlewares/auth.middleware.js";

const router = Router();

router.route('/signup').post(registerUser);
router.route('/login').post(loginUser);
router.route('/logout').post(verifyJWT, logoutUser);
router.route('/forgot-password').post(forgotPassword);
router.route('/forgot-password/:token').patch(resetPassword);

export default router;