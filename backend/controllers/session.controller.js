/**
 * Session Controller
 * Handles registration session CRUD operations
 */

const { validationResult } = require('express-validator');
const { RegistrationSession, User, CoordinationRequest } = require('../models');
const { Op } = require('sequelize');

/**
 * Get all sessions (with filtering)
 * GET /api/sessions
 */
const getAllSessions = async (req, res, next) => {
  try {
    // Update session statuses based on current date
    await RegistrationSession.updateAllStatuses();

    const { status, professorId, search } = req.query;

    const where = {};
    if (status) where.status = status;
    if (professorId) where.professorId = professorId;

    const sessions = await RegistrationSession.findAll({
      where,
      include: [
        {
          model: User,
          as: 'professor',
          attributes: ['id', 'name', 'department', 'maxStudents', 'currentStudentCount']
        }
      ],
      order: [['startDate', 'ASC']]
    });

    // Filter by search term if provided
    let filteredSessions = sessions;
    if (search) {
      const searchLower = search.toLowerCase();
      filteredSessions = sessions.filter(session =>
        session.title.toLowerCase().includes(searchLower) ||
        session.description?.toLowerCase().includes(searchLower) ||
        session.professor.name.toLowerCase().includes(searchLower)
      );
    }

    res.json({
      success: true,
      data: { sessions: filteredSessions }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get active sessions available for requests
 * GET /api/sessions/active
 */
const getActiveSessions = async (req, res, next) => {
  try {
    await RegistrationSession.updateAllStatuses();

    const sessions = await RegistrationSession.findAll({
      where: {
        status: 'active',
        availableSlots: { [Op.gt]: 0 }
      },
      include: [
        {
          model: User,
          as: 'professor',
          attributes: ['id', 'name', 'department', 'maxStudents', 'currentStudentCount']
        }
      ],
      order: [['endDate', 'ASC']]
    });

    res.json({
      success: true,
      data: { sessions }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get session by ID
 * GET /api/sessions/:id
 */
const getSessionById = async (req, res, next) => {
  try {
    const session = await RegistrationSession.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'professor',
          attributes: ['id', 'name', 'department', 'maxStudents', 'currentStudentCount']
        },
        {
          model: CoordinationRequest,
          as: 'requests',
          include: [
            { model: User, as: 'student', attributes: ['id', 'name', 'studentId', 'department'] }
          ]
        }
      ]
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    // Update status if needed
    await session.updateStatus();

    res.json({
      success: true,
      data: { session }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new session (professors only)
 * POST /api/sessions
 */
const createSession = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { title, description, startDate, endDate, maxSlots } = req.body;

    // Create session object to check for overlaps
    const sessionData = {
      professorId: req.user.id,
      title,
      description,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      maxSlots: maxSlots || 5,
      availableSlots: maxSlots || 5
    };

    // Check for overlapping sessions
    const tempSession = RegistrationSession.build(sessionData);
    const hasOverlap = await tempSession.hasOverlap();

    if (hasOverlap) {
      return res.status(400).json({
        success: false,
        message: 'Session dates overlap with an existing session'
      });
    }

    // Determine initial status
    const now = new Date();
    if (sessionData.startDate <= now && sessionData.endDate >= now) {
      sessionData.status = 'active';
    } else if (sessionData.startDate > now) {
      sessionData.status = 'upcoming';
    } else {
      sessionData.status = 'closed';
    }

    const session = await RegistrationSession.create(sessionData);

    // Reload with professor data
    await session.reload({
      include: [
        { model: User, as: 'professor', attributes: ['id', 'name', 'department'] }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Session created successfully',
      data: { session }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update a session (owner professor only)
 * PUT /api/sessions/:id
 */
const updateSession = async (req, res, next) => {
  try {
    const session = await RegistrationSession.findByPk(req.params.id);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    // Check ownership
    if (session.professorId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own sessions'
      });
    }

    const { title, description, startDate, endDate, maxSlots } = req.body;

    // Update fields if provided
    if (title) session.title = title;
    if (description !== undefined) session.description = description;
    if (startDate) session.startDate = new Date(startDate);
    if (endDate) session.endDate = new Date(endDate);
    if (maxSlots) {
      const slotDifference = maxSlots - session.maxSlots;
      session.maxSlots = maxSlots;
      session.availableSlots = Math.max(0, session.availableSlots + slotDifference);
    }

    // Check for overlaps if dates changed
    if (startDate || endDate) {
      const hasOverlap = await session.hasOverlap();
      if (hasOverlap) {
        return res.status(400).json({
          success: false,
          message: 'Updated dates would overlap with an existing session'
        });
      }
    }

    await session.save();
    await session.updateStatus();

    await session.reload({
      include: [
        { model: User, as: 'professor', attributes: ['id', 'name', 'department'] }
      ]
    });

    res.json({
      success: true,
      message: 'Session updated successfully',
      data: { session }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a session (owner professor only)
 * DELETE /api/sessions/:id
 */
const deleteSession = async (req, res, next) => {
  try {
    const session = await RegistrationSession.findByPk(req.params.id, {
      include: [{ model: CoordinationRequest, as: 'requests' }]
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    // Check ownership
    if (session.professorId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own sessions'
      });
    }

    // Check if session has approved requests
    const hasApprovedRequests = session.requests.some(r =>
      ['approved', 'document_pending', 'completed'].includes(r.status)
    );

    if (hasApprovedRequests) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete session with approved requests'
      });
    }

    await session.destroy();

    res.json({
      success: true,
      message: 'Session deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get professor's own sessions
 * GET /api/sessions/my
 */
const getMySessions = async (req, res, next) => {
  try {
    await RegistrationSession.updateAllStatuses();

    const sessions = await RegistrationSession.findAll({
      where: { professorId: req.user.id },
      include: [
        {
          model: CoordinationRequest,
          as: 'requests',
          include: [
            { model: User, as: 'student', attributes: ['id', 'name', 'studentId', 'department'] }
          ]
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: { sessions }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllSessions,
  getActiveSessions,
  getSessionById,
  createSession,
  updateSession,
  deleteSession,
  getMySessions
};
