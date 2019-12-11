const Sequelize = require('sequelize')
const purposize = require('../purposize/index')

const chai = require('chai')
const expect = chai.expect

const sequelize = new Sequelize('testdb', 'postgres', 'admin', {
  host: 'localhost',
  dialect: 'postgres',
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

  it("Loading purposes twice should not lead to double entries in tables", async () => {
    await sequelize.sync()
    
    await purposize.loadPurposes(__dirname + "\\purposes.yml")
    await purposize.loadPurposes(__dirname + "\\purposes.yml")

    const res = await sequelize.model("purposize_purposeDataFields").findAll()
    expect(res.length).to.be.equal(8)
  })
})