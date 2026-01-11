/**
 * User Routes
 * Handles user listing and profile endpoints
 */

const express = require('express');
const router = express.Router();
const { User, CoordinationRequest } = require('../models');
const { authenticate, isProfessor } = require('../middleware/auth.middleware');

/**
 * Get all professors (public)
 * GET /api/users/professors
 */
router.get('/professors', async (req, res, next) => {
  try {
    const professors = await User.findAll({
      where: { role: 'professor' },
      attributes: ['id', 'name', 'department', 'maxStudents', 'currentStudentCount']
    });

    res.json({
      success: true,
      data: { professors }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Get professor's coordinated students (professors only)
 * GET /api/users/my-students
 */
router.get('/my-students', authenticate, isProfessor, async (req, res, next) => {
  try {
    const students = await User.findAll({
      where: {
        role: 'student',
        approvedProfessorId: req.user.id
      },
      attributes: ['id', 'name', 'email', 'studentId', 'department', 'createdAt'],
      include: [
        {
          model: CoordinationRequest,
          as: 'studentRequests',
          where: { professorId: req.user.id },
          required: false,
          attributes: ['id', 'dissertationTopic', 'status', 'createdAt']
        }
      ]
    });

    res.json({
      success: true,
      data: { students }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Get user by ID (authenticated users)
 * GET /api/users/:id
 */
router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
