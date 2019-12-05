const Sequelize = require('sequelize')
const purposize = require('../purposize/index')

const chai = require('chai')
const expect = chai.expect

const sequelize = new Sequelize('testdb', 'root', 'admin', {
  host: 'localhost',
  dialect: 'mysql',
  logging: false // Prevent sequelize from logging all SQL queries
})

describe('Test purposize initialization', () => {
  before(async () => {
    await sequelize.getQueryInterface().dropAllTables()
    purposize.init(sequelize)
  })

  it('Check for metadata tables', async () => {
    expect(sequelize.isDefined('purposize_personalDataFields')).to.equal(true)
    expect(sequelize.isDefined('purposize_purposeDataFields')).to.equal(true)
    expect(sequelize.isDefined('purposize_purposes')).to.equal(true)
    expect(sequelize.isDefined('purposize_compatiblePurposes')).to.equal(true)
  })
})