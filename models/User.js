const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: {
        msg: 'Please provide a valid email'
      }
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  phone: {
    type: DataTypes.STRING,
    validate: {
      len: {
        args: [10, 15],
        msg: 'Phone number must be between 10-15 characters'
      }
    }
  },
  address: {
    type: DataTypes.TEXT
  }
}, {
  tableName: 'users',
  timestamps: true,
  underscored: true
});

module.exports = User;