/**
 * Authentication Controller
 * Handles user registration, login, and profile management
 */

const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const { User } = require('../models');

// Default maximum number of students a professor can coordinate
const DEFAULT_MAX_STUDENTS = 5;

/**
 * Generate JWT token for user
 * @param {Object} user - User object
 * @returns {string} JWT token
 */
const generateToken = (user) => {
  return jwt.sign(
    { userId: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  );
};

/**
 * Register a new user
 * POST /api/auth/register
 */
const register = async (req, res, next) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email, password, name, role, department, studentId, maxStudents } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Check if studentId is already taken (for students)
    if (role === 'student' && studentId) {
      const existingStudent = await User.findOne({ where: { studentId } });
      if (existingStudent) {
        return res.status(409).json({
          success: false,
          message: 'Student ID already registered'
        });
      }
    }

    // Create user
    const userData = {
      email,
      password,
      name,
      role,
      department
    };

    // Add role-specific fields
    if (role === 'student') {
      userData.studentId = studentId;
    } else if (role === 'professor') {
      userData.maxStudents = maxStudents || DEFAULT_MAX_STUDENTS;
      userData.currentStudentCount = 0;
    }

    const user = await User.create(userData);

    // Generate token
    const token = generateToken(user);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: user.toJSON(),
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Login user
 * POST /api/auth/login
 */
const login = async (req, res, next) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Verify password
    const isValidPassword = await user.validatePassword(password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate token
    const token = generateToken(user);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: user.toJSON(),
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get current user profile
 * GET /api/auth/me
 */
const getProfile = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id, {
      include: req.user.role === 'student' ? [
        { model: User, as: 'approvedProfessor', attributes: ['id', 'name', 'department'] }
      ] : []
    });

    res.json({
      success: true,
      data: { user: user.toJSON() }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update user profile
 * PUT /api/auth/me
 */
const updateProfile = async (req, res, next) => {
  try {
    const { name, department, maxStudents } = req.body;

    const updateData = {};
    if (name) updateData.name = name;
    if (department) updateData.department = department;
    if (req.user.role === 'professor' && maxStudents) {
      updateData.maxStudents = maxStudents;
    }

    await req.user.update(updateData);

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: { user: req.user.toJSON() }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Change password
 * PUT /api/auth/password
 */
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Verify current password
    const isValid = await req.user.validatePassword(currentPassword);
    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    req.user.password = newPassword;
    await req.user.save();

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword
};
