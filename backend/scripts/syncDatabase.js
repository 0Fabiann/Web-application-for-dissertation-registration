/**
 * Database Sync Script
 * Creates/updates all database tables based on Sequelize models
 *
 * Usage: npm run db:sync
 */

require('dotenv').config();
const { sequelize } = require('../models');

async function syncDatabase() {
  try {
    console.log('Starting database synchronization...');
    console.log(`Database: ${process.env.DB_NAME}`);
    console.log(`Host: ${process.env.DB_HOST}:${process.env.DB_PORT}`);

    // Test connection
    await sequelize.authenticate();
    console.log('✓ Database connection established');

    // Sync all models
    // Use { force: true } to drop and recreate tables (CAUTION: destroys data)
    // Use { alter: true } to update tables without destroying data
    await sequelize.sync({ alter: true });

    console.log('✓ All models synchronized successfully');
    console.log('Database tables created/updated:');
    console.log('  - users');
    console.log('  - registration_sessions');
    console.log('  - coordination_requests');
    console.log('  - documents');

    process.exit(0);
  } catch (error) {
    console.error('✗ Database synchronization failed:', error.message);
    console.error(error);
    process.exit(1);
  }
}

syncDatabase();
