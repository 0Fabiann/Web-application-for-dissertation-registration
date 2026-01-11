/**
 * Authentication Routes
 * Handles user registration, login, and profile management
 */

const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const authController = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth.middleware');

// Validation rules for registration
const registerValidation = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('name')
    .notEmpty()
    .withMessage('Name is required'),
  body('role')
    .isIn(['student', 'professor'])
    .withMessage('Role must be student or professor'),
  body('department')
    .notEmpty()
    .withMessage('Department is required'),
  body('studentId')
    .if(body('role').equals('student'))
    .notEmpty()
    .withMessage('Student ID is required for students')
    .matches(/^\d{8}$/)
    .withMessage('Student ID must be exactly 8 digits')
];

// Validation rules for login
const loginValidation = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

// Public routes
router.post('/register', registerValidation, authController.register);
router.post('/login', loginValidation, authController.login);

// Protected routes
router.get('/me', authenticate, authController.getProfile);
router.put('/me', authenticate, authController.updateProfile);
router.put('/password', authenticate, authController.changePassword);

module.exports = router;
