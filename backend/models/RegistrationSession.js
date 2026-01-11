/**
 * RegistrationSession Model
 * Represents a time-bounded period during which students can request coordination
 * Sessions cannot temporally overlap for the same professor
 */

const { DataTypes, Op } = require('sequelize');

module.exports = (sequelize) => {
  const RegistrationSession = sequelize.define('RegistrationSession', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    professorId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('upcoming', 'active', 'closed'),
      allowNull: false,
      defaultValue: 'upcoming'
    },
    maxSlots: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 5,
      validate: {
        min: 1
      }
    },
    availableSlots: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 5
    }
  }, {
    tableName: 'registration_sessions',
    timestamps: true,
    hooks: {
      // Set available slots equal to max slots on creation
      beforeCreate: (session) => {
        if (session.availableSlots === undefined) {
          session.availableSlots = session.maxSlots;
        }
      }
    },
    validate: {
      // Ensure end date is after start date
      endDateAfterStart() {
        if (this.endDate <= this.startDate) {
          throw new Error('End date must be after start date');
        }
      }
    }
  });

  /**
   * Check if this session overlaps with existing sessions for the same professor
   * @returns {Promise<boolean>} - True if overlapping session exists
   */
  RegistrationSession.prototype.hasOverlap = async function() {
    const overlapping = await RegistrationSession.findOne({
      where: {
        professorId: this.professorId,
        id: { [Op.ne]: this.id || null },
        [Op.or]: [
          {
            startDate: {
              [Op.between]: [this.startDate, this.endDate]
            }
          },
          {
            endDate: {
              [Op.between]: [this.startDate, this.endDate]
            }
          },
          {
            [Op.and]: [
              { startDate: { [Op.lte]: this.startDate } },
              { endDate: { [Op.gte]: this.endDate } }
            ]
          }
        ]
      }
    });
    return overlapping !== null;
  };

  /**
   * Update session status based on current date
   * @returns {Promise<void>}
   */
  RegistrationSession.prototype.updateStatus = async function() {
    const now = new Date();
    let newStatus;

    if (now < this.startDate) {
      newStatus = 'upcoming';
    } else if (now >= this.startDate && now <= this.endDate) {
      newStatus = 'active';
    } else {
      newStatus = 'closed';
    }

    if (this.status !== newStatus) {
      this.status = newStatus;
      await this.save();
    }
  };

  /**
   * Update all sessions' statuses based on current date
   * @returns {Promise<void>}
   */
  RegistrationSession.updateAllStatuses = async function() {
    const now = new Date();

    // Update upcoming to active
    await RegistrationSession.update(
      { status: 'active' },
      {
        where: {
          status: 'upcoming',
          startDate: { [Op.lte]: now },
          endDate: { [Op.gte]: now }
        }
      }
    );

    // Update active to closed
    await RegistrationSession.update(
      { status: 'closed' },
      {
        where: {
          status: { [Op.in]: ['upcoming', 'active'] },
          endDate: { [Op.lt]: now }
        }
      }
    );
  };

  return RegistrationSession;
};
