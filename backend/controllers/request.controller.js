/**
 * Request Controller
 * Handles coordination request CRUD and workflow operations
 */

const { validationResult } = require('express-validator');
const { CoordinationRequest, User, RegistrationSession, Document } = require('../models');
const { Op } = require('sequelize');
const emailService = require('../services/email.service');

/**
 * Get all requests for current user (student's requests or professor's received requests)
 * GET /api/requests
 */
const getMyRequests = async (req, res, next) => {
  try {
    const { status } = req.query;

    const where = {};
    if (status) where.status = status;

    // Students see their own requests, professors see requests to them
    if (req.user.role === 'student') {
      where.studentId = req.user.id;
    } else {
      where.professorId = req.user.id;
    }

    const requests = await CoordinationRequest.findAll({
      where,
      include: [
        { model: User, as: 'student', attributes: ['id', 'name', 'studentId', 'department', 'email'] },
        { model: User, as: 'professor', attributes: ['id', 'name', 'department', 'email'] },
        { model: RegistrationSession, as: 'session', attributes: ['id', 'title', 'status'] },
        { model: Document, as: 'documents' }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: { requests }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get request by ID
 * GET /api/requests/:id
 */
const getRequestById = async (req, res, next) => {
  try {
    const request = await CoordinationRequest.findByPk(req.params.id, {
      include: [
        { model: User, as: 'student', attributes: ['id', 'name', 'studentId', 'department', 'email'] },
        { model: User, as: 'professor', attributes: ['id', 'name', 'department', 'email'] },
        { model: RegistrationSession, as: 'session' },
        { model: Document, as: 'documents', include: [
          { model: User, as: 'uploader', attributes: ['id', 'name', 'role'] }
        ]}
      ]
    });

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }

    // Check authorization
    if (request.studentId !== req.user.id && request.professorId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view this request'
      });
    }

    res.json({
      success: true,
      data: { request }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new coordination request (students only)
 * POST /api/requests
 */
const createRequest = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { sessionId, dissertationTopic, message } = req.body;

    // Check if student already has an approved professor
    if (req.user.approvedProfessorId) {
      return res.status(400).json({
        success: false,
        message: 'You have already been approved by a professor'
      });
    }

    // Get the session
    const session = await RegistrationSession.findByPk(sessionId);
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    // Check session is active
    await session.updateStatus();
    if (session.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'This session is not currently accepting requests'
      });
    }

    // Check available slots
    if (session.availableSlots <= 0) {
      return res.status(400).json({
        success: false,
        message: 'This session has no available slots'
      });
    }

    // Check if student already has a request for this session
    const existingRequest = await CoordinationRequest.findOne({
      where: {
        studentId: req.user.id,
        sessionId
      }
    });

    if (existingRequest) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted a request for this session'
      });
    }

    // Create the request
    const request = await CoordinationRequest.create({
      studentId: req.user.id,
      professorId: session.professorId,
      sessionId,
      dissertationTopic,
      message,
      status: 'pending'
    });

    // Reload with associations
    await request.reload({
      include: [
        { model: User, as: 'student', attributes: ['id', 'name', 'studentId', 'department'] },
        { model: User, as: 'professor', attributes: ['id', 'name', 'department', 'email'] },
        { model: RegistrationSession, as: 'session', attributes: ['id', 'title'] }
      ]
    });

    // Send email notification to professor (external API integration)
    emailService.sendRequestSubmittedEmail(
      request.professor.email,
      request.student.name,
      dissertationTopic,
      request.session.title
    ).catch(err => console.error('[Email] Failed to send request notification:', err));

    res.status(201).json({
      success: true,
      message: 'Request submitted successfully',
      data: { request }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Approve a request (professors only)
 * PUT /api/requests/:id/approve
 */
const approveRequest = async (req, res, next) => {
  try {
    const request = await CoordinationRequest.findByPk(req.params.id, {
      include: [
        { model: User, as: 'student' },
        { model: RegistrationSession, as: 'session' }
      ]
    });

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }

    // Check authorization
    if (request.professorId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You can only approve requests made to you'
      });
    }

    // Check status
    if (request.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Only pending requests can be approved'
      });
    }

    // Use the model's approve method which handles all the business logic
    await request.approve();

    // Reload with associations
    await request.reload({
      include: [
        { model: User, as: 'student', attributes: ['id', 'name', 'studentId', 'department', 'email'] },
        { model: User, as: 'professor', attributes: ['id', 'name', 'department'] },
        { model: RegistrationSession, as: 'session', attributes: ['id', 'title'] }
      ]
    });

    // Send email notification to student (external API integration)
    emailService.sendRequestApprovedEmail(
      request.student.email,
      req.user.name,
      request.dissertationTopic
    ).catch(err => console.error('[Email] Failed to send approval notification:', err));

    res.json({
      success: true,
      message: 'Request approved successfully',
      data: { request }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Reject a request (professors only)
 * PUT /api/requests/:id/reject
 */
const rejectRequest = async (req, res, next) => {
  try {
    const { reason } = req.body;

    if (!reason || reason.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Rejection reason is required'
      });
    }

    const request = await CoordinationRequest.findByPk(req.params.id, {
      include: [
        { model: User, as: 'student', attributes: ['id', 'name', 'email'] }
      ]
    });

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }

    // Check authorization
    if (request.professorId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You can only reject requests made to you'
      });
    }

    // Check status
    if (request.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Only pending requests can be rejected'
      });
    }

    await request.reject(reason);

    // Send email notification to student (external API integration)
    emailService.sendRequestRejectedEmail(
      request.student.email,
      req.user.name,
      request.dissertationTopic,
      reason
    ).catch(err => console.error('[Email] Failed to send rejection notification:', err));

    await request.reload({
      include: [
        { model: User, as: 'student', attributes: ['id', 'name', 'studentId', 'department'] },
        { model: User, as: 'professor', attributes: ['id', 'name', 'department'] },
        { model: RegistrationSession, as: 'session', attributes: ['id', 'title'] }
      ]
    });

    res.json({
      success: true,
      message: 'Request rejected',
      data: { request }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Cancel a request (students only, only pending requests)
 * DELETE /api/requests/:id
 */
const cancelRequest = async (req, res, next) => {
  try {
    const request = await CoordinationRequest.findByPk(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }

    // Check authorization
    if (request.studentId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You can only cancel your own requests'
      });
    }

    // Check status
    if (request.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Only pending requests can be cancelled'
      });
    }

    await request.destroy();

    res.json({
      success: true,
      message: 'Request cancelled successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get statistics for professor dashboard
 * GET /api/requests/stats
 */
const getRequestStats = async (req, res, next) => {
  try {
    const where = req.user.role === 'student'
      ? { studentId: req.user.id }
      : { professorId: req.user.id };

    const [pending, approved, rejected, completed] = await Promise.all([
      CoordinationRequest.count({ where: { ...where, status: 'pending' } }),
      CoordinationRequest.count({ where: { ...where, status: 'approved' } }),
      CoordinationRequest.count({ where: { ...where, status: 'rejected' } }),
      CoordinationRequest.count({ where: { ...where, status: 'completed' } })
    ]);

    res.json({
      success: true,
      data: {
        stats: {
          pending,
          approved,
          rejected,
          completed,
          total: pending + approved + rejected + completed
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyRequests,
  getRequestById,
  createRequest,
  approveRequest,
  rejectRequest,
  cancelRequest,
  getRequestStats
};
