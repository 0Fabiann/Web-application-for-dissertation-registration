/**
 * Request Routes
 * Handles coordination request endpoints
 */

const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const requestController = require('../controllers/request.controller');
const { authenticate, isStudent, isProfessor } = require('../middleware/auth.middleware');

// Validation rules for creating requests
const createRequestValidation = [
  body('sessionId')
    .notEmpty()
    .withMessage('Session ID is required')
    .isUUID()
    .withMessage('Invalid session ID'),
  body('dissertationTopic')
    .notEmpty()
    .withMessage('Dissertation topic is required')
    .isLength({ min: 10, max: 500 })
    .withMessage('Dissertation topic must be between 10 and 500 characters'),
  body('message')
    .optional()
    .isLength({ max: 2000 })
    .withMessage('Message cannot exceed 2000 characters')
];

// All routes require authentication
router.use(authenticate);

// Routes accessible by both roles
router.get('/', requestController.getMyRequests);
router.get('/stats', requestController.getRequestStats);
router.get('/:id', requestController.getRequestById);

// Student-only routes
router.post('/', isStudent, createRequestValidation, requestController.createRequest);
router.delete('/:id', isStudent, requestController.cancelRequest);

// Professor-only routes
router.put('/:id/approve', isProfessor, requestController.approveRequest);
router.put('/:id/reject', isProfessor, requestController.rejectRequest);

module.exports = router;
