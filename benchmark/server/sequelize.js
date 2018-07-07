const Sequelize = require('sequelize')
const purposize = require('purposize')

const sequelize = new Sequelize('benchmarkdb', 'root', '123456', {
  host: 'localhost',
  dialect: 'mysql',
  logging: false // Prevent sequelize from logging all SQL queries
})

sequelize.purposize = true

if (sequelize.purposize) {
  console.log('Using purposize!')
  purposize.init(sequelize, {
    logging: false
  })
}


module.exports = sequelize