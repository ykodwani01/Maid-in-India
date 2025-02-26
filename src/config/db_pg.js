const { Sequelize } = require('sequelize');
require('dotenv').config(); // Load environment variables

const sequelize = new Sequelize(process.env.NEON_PG_CONNECTION_STRING, {
  dialect: 'postgres',
  logging: false, // Disable SQL query logging
});

const connectDB_pg = async () => {
  try {
    await sequelize.authenticate();
    console.log('PostgreSQL Connected via Sequelize');
  } catch (err) {
    console.error(`Error connecting to PostgreSQL: ${err.message}`);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB_pg };
