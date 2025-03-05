const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db_pg'); // adjust path as needed
const Maid = require('./maid')(sequelize, DataTypes);

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
    booking_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    slot: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    paymentStatus : {
        type : DataTypes.BOOLEAN
    }
  }, {
    tableName: 'Booking',
    timestamps: false
  });
Maid.hasMany(Booking, { foreignKey: 'maid_id' });
module.exports = Booking;