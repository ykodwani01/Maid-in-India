const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db_pg'); // adjust path as needed
const Maid = require('./Maid');

const Booking = sequelize.define('Booking', {
    BookingId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    maidId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Maid,
        key: 'maidId'
      }
    },
    // Using a string to store the MongoDB ObjectId for the user
    userId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    slot: {
      type: DataTypes.JSON,
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    service : {
      type : DataTypes.STRING,
      allowNull : true
    },
    paymentStatus : {
        type : DataTypes.BOOLEAN
    },
    cost : {
        type : DataTypes.INTEGER
    },
    userLocation : {
      type : DataTypes.INTEGER
  },
    userContact : {
      type : DataTypes.INTEGER
    }
  }, {
    tableName: 'bookings',
    timestamps: false
  });
Maid.hasMany(Booking, { foreignKey: 'maidId' });
module.exports = Booking;