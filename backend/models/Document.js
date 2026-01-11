/**
 * Document Model
 * Represents uploaded files for coordination requests
 * Tracks the document review workflow between students and professors
 */

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Document = sequelize.define('Document', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    requestId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'coordination_requests',
        key: 'id'
      }
    },
    uploadedBy: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    uploaderRole: {
      type: DataTypes.ENUM('student', 'professor'),
      allowNull: false
    },
    fileName: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    originalName: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    mimeType: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    fileSize: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    filePath: {
      type: DataTypes.STRING(500),
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('pending_review', 'accepted', 'rejected'),
      allowNull: false,
      defaultValue: 'pending_review'
    },
    rejectionReason: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: 'documents',
    timestamps: true
  });

  /**
   * Accept this document and complete the coordination request
   * @returns {Promise<void>}
   */
  Document.prototype.accept = async function() {
    const CoordinationRequest = sequelize.models.CoordinationRequest;

    const transaction = await sequelize.transaction();

    try {
      // Update document status
      this.status = 'accepted';
      await this.save({ transaction });

      // Update request status to completed
      await CoordinationRequest.update(
        { status: 'completed' },
        { where: { id: this.requestId }, transaction }
      );

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  };

  /**
   * Reject this document, requiring student to upload a new one
   * @param {string} reason - Reason for rejection
   * @returns {Promise<void>}
   */
  Document.prototype.reject = async function(reason) {
    const CoordinationRequest = sequelize.models.CoordinationRequest;

    const transaction = await sequelize.transaction();

    try {
      // Update document status
      this.status = 'rejected';
      this.rejectionReason = reason;
      await this.save({ transaction });

      // Update request status back to approved (awaiting new document)
      await CoordinationRequest.update(
        { status: 'approved' },
        { where: { id: this.requestId }, transaction }
      );

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  };

  return Document;
};
