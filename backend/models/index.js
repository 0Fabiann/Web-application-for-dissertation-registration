/**
 * Sequelize model initialization and associations
 * Exports all models and the sequelize instance
 */

const { Sequelize } = require('sequelize');
const config = require('../config/database');

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

// Initialize Sequelize with PostgreSQL
const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: dbConfig.dialect,
    logging: dbConfig.logging,
    define: dbConfig.define,
    pool: dbConfig.pool
  }
);

// Import models
const User = require('./User')(sequelize);
const RegistrationSession = require('./RegistrationSession')(sequelize);
const CoordinationRequest = require('./CoordinationRequest')(sequelize);
const Document = require('./Document')(sequelize);

// Define associations

// User (Professor) has many RegistrationSessions
User.hasMany(RegistrationSession, {
  foreignKey: 'professorId',
  as: 'sessions'
});
RegistrationSession.belongsTo(User, {
  foreignKey: 'professorId',
  as: 'professor'
});

// User (Student) has many CoordinationRequests
User.hasMany(CoordinationRequest, {
  foreignKey: 'studentId',
  as: 'studentRequests'
});
CoordinationRequest.belongsTo(User, {
  foreignKey: 'studentId',
  as: 'student'
});

// User (Professor) has many CoordinationRequests
User.hasMany(CoordinationRequest, {
  foreignKey: 'professorId',
  as: 'professorRequests'
});
CoordinationRequest.belongsTo(User, {
  foreignKey: 'professorId',
  as: 'professor'
});

// RegistrationSession has many CoordinationRequests
RegistrationSession.hasMany(CoordinationRequest, {
  foreignKey: 'sessionId',
  as: 'requests'
});
CoordinationRequest.belongsTo(RegistrationSession, {
  foreignKey: 'sessionId',
  as: 'session'
});

// CoordinationRequest has many Documents
CoordinationRequest.hasMany(Document, {
  foreignKey: 'requestId',
  as: 'documents'
});
Document.belongsTo(CoordinationRequest, {
  foreignKey: 'requestId',
  as: 'request'
});

// User (uploader) has many Documents
User.hasMany(Document, {
  foreignKey: 'uploadedBy',
  as: 'uploadedDocuments'
});
Document.belongsTo(User, {
  foreignKey: 'uploadedBy',
  as: 'uploader'
});

// Student approved by Professor relationship
User.belongsTo(User, {
  foreignKey: 'approvedProfessorId',
  as: 'approvedProfessor'
});
User.hasMany(User, {
  foreignKey: 'approvedProfessorId',
  as: 'coordinatedStudents'
});

module.exports = {
  sequelize,
  Sequelize,
  User,
  RegistrationSession,
  CoordinationRequest,
  Document
};
