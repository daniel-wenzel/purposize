const Sequelize = require("sequelize")

const purposize = require('../purposize')

const sequelize = new Sequelize('testdb', 'postgres', 'admin', {
  host: 'localhost',
  dialect: 'postgres',
  logging: false // Prevent sequelize from logging all SQL queries
})

sequelize.usePurposize = true

if (sequelize.usePurposize) {
  console.log('Using purposize')
  purposize.init(sequelize, {
    logging: false
  })
} else {
  console.log("Not using purposize")
}

module.exports = sequelize