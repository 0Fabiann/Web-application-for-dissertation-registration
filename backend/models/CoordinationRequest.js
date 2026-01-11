/**
 * CoordinationRequest Model
 * Represents a student's request to be coordinated by a professor
 * Tracks the full workflow from request to approval/rejection and document exchange
 */

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const CoordinationRequest = sequelize.define('CoordinationRequest', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    studentId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    professorId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    sessionId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'registration_sessions',
        key: 'id'
      }
    },
    dissertationTopic: {
      type: DataTypes.STRING(500),
      allowNull: false
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM(
        'pending',           // Initial state, awaiting professor review
        'approved',          // Professor approved, awaiting document upload
        'rejected',          // Professor rejected the request
        'document_pending',  // Student uploaded document, awaiting professor review
        'completed'          // Professor accepted document, process complete
      ),
      allowNull: false,
      defaultValue: 'pending'
    },
    rejectionReason: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: 'coordination_requests',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['student_id', 'session_id'],
        name: 'unique_student_session_request'
      }
    ]
  });

  /**
   * Check if the student can be approved
   * Students can only be approved by one professor
   * @returns {Promise<Object>} - Object with canApprove boolean and reason
   */
  CoordinationRequest.prototype.canBeApproved = async function() {
    const User = sequelize.models.User;
    const student = await User.findByPk(this.studentId);

    if (!student) {
      return { canApprove: false, reason: 'Student not found' };
    }

    if (student.approvedProfessorId) {
      const approvedProfessor = await User.findByPk(student.approvedProfessorId);
      return {
        canApprove: false,
        reason: `Student already approved by ${approvedProfessor?.name || 'another professor'}`
      };
    }

    const professor = await User.findByPk(this.professorId);
    if (!professor) {
      return { canApprove: false, reason: 'Professor not found' };
    }

    if (professor.currentStudentCount >= professor.maxStudents) {
      return { canApprove: false, reason: 'Professor has reached maximum student capacity' };
    }

    return { canApprove: true };
  };

  /**
   * Approve this request and update related records
   * @returns {Promise<void>}
   */
  CoordinationRequest.prototype.approve = async function() {
    const { canApprove, reason } = await this.canBeApproved();

    if (!canApprove) {
      throw new Error(reason);
    }

    const User = sequelize.models.User;
    const RegistrationSession = sequelize.models.RegistrationSession;

    // Start transaction
    const transaction = await sequelize.transaction();

    try {
      // Update request status
      this.status = 'approved';
      await this.save({ transaction });

      // Update student's approved professor
      await User.update(
        { approvedProfessorId: this.professorId },
        { where: { id: this.studentId }, transaction }
      );

      // Increment professor's student count
      await User.increment('currentStudentCount', {
        where: { id: this.professorId },
        transaction
      });

      // Decrement session available slots
      await RegistrationSession.decrement('availableSlots', {
        where: { id: this.sessionId },
        transaction
      });

      // Reject all other pending requests from this student
      await CoordinationRequest.update(
        {
          status: 'rejected',
          rejectionReason: 'Student was approved by another professor'
        },
        {
          where: {
            studentId: this.studentId,
            id: { [sequelize.Sequelize.Op.ne]: this.id },
            status: 'pending'
          },
          transaction
        }
      );

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  };

  /**
   * Reject this request with a reason
   * @param {string} reason - Reason for rejection
   * @returns {Promise<void>}
   */
  CoordinationRequest.prototype.reject = async function(reason) {
    this.status = 'rejected';
    this.rejectionReason = reason;
    await this.save();
  };

  return CoordinationRequest;
};
