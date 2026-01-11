/**
 * Session Routes
 * Handles registration session endpoints
 */

const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const sessionController = require('../controllers/session.controller');
const { authenticate, isProfessor } = require('../middleware/auth.middleware');

// Validation rules for creating/updating sessions
const sessionValidation = [
  body('title')
    .notEmpty()
    .withMessage('Title is required'),
  body('startDate')
    .isISO8601()
    .withMessage('Start date must be a valid date'),
  body('endDate')
    .isISO8601()
    .withMessage('End date must be a valid date'),
  body('maxSlots')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Max slots must be a positive integer')
];

// Public routes
router.get('/', sessionController.getAllSessions);
router.get('/active', sessionController.getActiveSessions);
router.get('/:id', sessionController.getSessionById);

// Protected routes (professors only)
router.get('/professor/my', authenticate, isProfessor, sessionController.getMySessions);
router.post('/', authenticate, isProfessor, sessionValidation, sessionController.createSession);
router.put('/:id', authenticate, isProfessor, sessionController.updateSession);
router.delete('/:id', authenticate, isProfessor, sessionController.deleteSession);

module.exports = router;
