const sequelize = require('./sequelize')
const purposize = require('../purposize/index')
const { tableName, tableDefinition, personalDataFields } = require('./model')

const chai = require('chai')
const expect = chai.expect

describe('Testing sequelize.define method', () => {
  before(async () => {
    sequelize.define(tableName, tableDefinition);
    await sequelize.sync({ force: true })
  })

  it('Check for metadata tables', async () => {
    expect(sequelize.isDefined(`purposize_${tableName}Purposes`)).to.equal(true)
    expect(sequelize.isDefined(`purposize_personalDataFields`)).to.equal(true)
    expect(sequelize.isDefined(`purposize_purposeDataFields`)).to.equal(true)
    expect(sequelize.isDefined(`purposize_purposes`)).to.equal(true)
    expect(sequelize.isDefined(`purposize_compatiblePurposes`)).to.equal(true)
  })

  it('Check for eMail and postalAddress in personalDataFieldsTable', async () => {
    let result = await purposize.purposizeTables.personalDataFields.findAll()
    expect(result.every( (x) => {
      return x.tableName === tableName && personalDataFields.includes(x.fieldName)
    })).to.equal(true)
  })

})
