const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db_pg'); // adjust path as needed

const Maid = sequelize.define('Maid', {
  // Auto-generated primary key
  maidId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  contact: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  gender: {
    type: DataTypes.ENUM('Male', 'Female'),
    allowNull: false,
  },
  location: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  govtId: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  imageUrl: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: '',
  },
  // Using Postgres ARRAY to store an array of strings
  timeAvailable: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: true,
  },
  daysAvailable: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: true,
  },
  // Store an array of strings indicating types of work (e.g., cleaning, cooking)
  cleaning: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
  },
  cooking: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
  },
  // Using JSON type to store key-value pairs for service prices
  pricePerService: {
    type: DataTypes.JSON,
    allowNull: true,
  },
}, {
  tableName: 'maids', // Specify the table name in your database
  timestamps: true,   // Adds createdAt and updatedAt columns
});

module.exports = Maid;
