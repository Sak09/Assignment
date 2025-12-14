const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const upload = require('../middleware/multer');
const { authenticateToken } = require('../middleware/auth');


const registerValidations = [
  body('firstName').isString().isLength({ min: 2 }),
  body('email').isEmail(),
  body('password').isLength({ min: 6 })
];

router.post('/register', upload.single('profileImage'), registerValidations, authController.register);


router.get('/verify-email', authController.verifyEmail);
router.post('/login', [body('email').isEmail(), body('password').exists()], authController.login);
router.post('/refresh', authController.refreshToken);
router.post('/forgot-password', [body('email').isEmail()], authController.forgotPassword);
router.post('/reset-password', [body('password').isLength({ min: 6 })], authController.resetPassword);


router.get('/users', authenticateToken, authController.getUsers);
router.get('/profile/:id', authenticateToken, authController.getMe);
router.put('/profile/:id', authenticateToken, upload.single('profileImage'), authController.updateProfile);


module.exports = router;