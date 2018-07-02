const Sequelize = require('sequelize')
const sequelize = require('../sequelize')

const Users = sequelize.define('users', {
  eMail: {
    type: Sequelize.STRING,
    isPersonalData: true
  },
  postalAddress: {
    type: Sequelize.STRING,
    isPersonalData: true
  },
  age: {
    type: Sequelize.INTEGER,
    isPersonalData: true
  },
  favoriteNumber: {
    type: Sequelize.INTEGER
  },
  unfulfilledOrders: {
    type: Sequelize.INTEGER
  },
});

module.exports = Users