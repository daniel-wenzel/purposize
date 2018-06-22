const Sequelize = require('sequelize')
const purposize = require('../purposize/index')

const sequelize = new Sequelize('testdb', 'root', '123456', {
  host: 'localhost',
  dialect: 'mysql',
  logging: false // Prevent sequelize from logging all SQL queries
})
purposize.init(sequelize)

module.exports = sequelize