/**
 * Document Controller
 * Handles document upload, download, and review operations
 */

const path = require('path');
const fs = require('fs');
const { Document, CoordinationRequest, User } = require('../models');
const emailService = require('../services/email.service');

/**
 * Upload a document for a coordination request
 * POST /api/documents/upload
 */
const uploadDocument = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const { requestId } = req.body;

    // Validate request exists and user has access
    const request = await CoordinationRequest.findByPk(requestId, {
      include: [
        { model: User, as: 'student', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'professor', attributes: ['id', 'name', 'email'] }
      ]
    });

    if (!request) {
      // Clean up uploaded file
      fs.unlinkSync(req.file.path);
      return res.status(404).json({
        success: false,
        message: 'Coordination request not found'
      });
    }

    // Check authorization
    const isStudent = request.studentId === req.user.id;
    const isProfessor = request.professorId === req.user.id;

    if (!isStudent && !isProfessor) {
      fs.unlinkSync(req.file.path);
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to upload documents for this request'
      });
    }

    // Students can upload when request is approved
    // Professors can upload as a response
    if (isStudent && request.status !== 'approved') {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({
        success: false,
        message: 'You can only upload documents for approved requests'
      });
    }

    if (isProfessor && !['document_pending'].includes(request.status)) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({
        success: false,
        message: 'You can only upload documents when reviewing student documents'
      });
    }

    // Create document record
    const document = await Document.create({
      requestId,
      uploadedBy: req.user.id,
      uploaderRole: req.user.role,
      fileName: req.file.filename,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      fileSize: req.file.size,
      filePath: req.file.path,
      status: 'pending_review'
    });

    // Update request status if student uploaded
    if (isStudent) {
      request.status = 'document_pending';
      await request.save();

      // Send email notification to professor (external API integration)
      emailService.sendDocumentUploadedEmail(
        request.professor.email,
        request.student.name,
        request.dissertationTopic
      ).catch(err => console.error('[Email] Failed to send document upload notification:', err));
    }

    await document.reload({
      include: [
        { model: User, as: 'uploader', attributes: ['id', 'name', 'role'] }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Document uploaded successfully',
      data: { document }
    });
  } catch (error) {
    // Clean up file on error
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    next(error);
  }
};

/**
 * Download a document
 * GET /api/documents/:id/download
 */
const downloadDocument = async (req, res, next) => {
  try {
    const document = await Document.findByPk(req.params.id, {
      include: [{ model: CoordinationRequest, as: 'request' }]
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    // Check authorization
    const request = document.request;
    if (request.studentId !== req.user.id && request.professorId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to download this document'
      });
    }

    // Check file exists
    if (!fs.existsSync(document.filePath)) {
      return res.status(404).json({
        success: false,
        message: 'File not found on server'
      });
    }

    res.download(document.filePath, document.originalName);
  } catch (error) {
    next(error);
  }
};

/**
 * Get all documents for a request
 * GET /api/documents/request/:requestId
 */
const getDocumentsByRequest = async (req, res, next) => {
  try {
    const request = await CoordinationRequest.findByPk(req.params.requestId);

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
        message: 'You are not authorized to view documents for this request'
      });
    }

    const documents = await Document.findAll({
      where: { requestId: req.params.requestId },
      include: [
        { model: User, as: 'uploader', attributes: ['id', 'name', 'role'] }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: { documents }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Accept a document (professors only)
 * PUT /api/documents/:id/accept
 */
const acceptDocument = async (req, res, next) => {
  try {
    const document = await Document.findByPk(req.params.id, {
      include: [{
        model: CoordinationRequest,
        as: 'request',
        include: [
          { model: User, as: 'student', attributes: ['id', 'name', 'email'] }
        ]
      }]
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    // Check authorization
    if (document.request.professorId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Only the assigned professor can accept documents'
      });
    }

    // Check document status
    if (document.status !== 'pending_review') {
      return res.status(400).json({
        success: false,
        message: 'Only pending documents can be accepted'
      });
    }

    // Accept document (also completes the request)
    await document.accept();

    // Send email notification to student (external API integration)
    emailService.sendDocumentAcceptedEmail(
      document.request.student.email,
      req.user.name,
      document.request.dissertationTopic
    ).catch(err => console.error('[Email] Failed to send document acceptance notification:', err));

    await document.reload({
      include: [
        { model: User, as: 'uploader', attributes: ['id', 'name', 'role'] },
        { model: CoordinationRequest, as: 'request' }
      ]
    });

    res.json({
      success: true,
      message: 'Document accepted. Coordination request completed.',
      data: { document }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Reject a document (professors only)
 * PUT /api/documents/:id/reject
 */
const rejectDocument = async (req, res, next) => {
  try {
    const { reason } = req.body;

    if (!reason || reason.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Rejection reason is required'
      });
    }

    const document = await Document.findByPk(req.params.id, {
      include: [{
        model: CoordinationRequest,
        as: 'request',
        include: [
          { model: User, as: 'student', attributes: ['id', 'name', 'email'] }
        ]
      }]
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    // Check authorization
    if (document.request.professorId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Only the assigned professor can reject documents'
      });
    }

    // Check document status
    if (document.status !== 'pending_review') {
      return res.status(400).json({
        success: false,
        message: 'Only pending documents can be rejected'
      });
    }

    // Reject document (request goes back to approved status)
    await document.reject(reason);

    // Send email notification to student (external API integration)
    emailService.sendDocumentRejectedEmail(
      document.request.student.email,
      req.user.name,
      document.request.dissertationTopic,
      reason
    ).catch(err => console.error('[Email] Failed to send document rejection notification:', err));

    await document.reload({
      include: [
        { model: User, as: 'uploader', attributes: ['id', 'name', 'role'] },
        { model: CoordinationRequest, as: 'request' }
      ]
    });

    res.json({
      success: true,
      message: 'Document rejected. Student must upload a new document.',
      data: { document }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  uploadDocument,
  downloadDocument,
  getDocumentsByRequest,
  acceptDocument,
  rejectDocument
};
