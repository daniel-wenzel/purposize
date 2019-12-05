const Sequelize = require('sequelize')
const purposize = require('../purposize/index')

const chai = require('chai')
const expect = chai.expect

const sequelize = new Sequelize('testdb', 'root', 'admin', {
  host: 'localhost',
  dialect: 'mysql',
  logging: false // Prevent sequelize from logging all SQL queries
})

purposize.init(sequelize, {
  logging: false
})

module.exports = sequelize