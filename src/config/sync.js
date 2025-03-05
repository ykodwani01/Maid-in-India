const { sequelize } = require('./db_pg');

const syncDB = async () => {
  try {
    // Use { force: true } to drop and recreate tables (development only)
    await sequelize.sync({ force: true });
    console.log('Table created or updated successfully!');
  } catch (err) {
    console.error('Error synchronizing the database:', err);
  } finally {
    await sequelize.close();
  }
};

syncDB();
