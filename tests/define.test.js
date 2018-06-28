const sequelize = require('./sequelize')
const { tableName, tableDefinition, personalDataFields } = require('./model')

const chai = require('chai')
const expect = chai.expect

describe('Testing sequelize.define method', () => {
  before(async () => {
    await sequelize.getQueryInterface().dropAllTables()
    sequelize.define(tableName, tableDefinition);
    await sequelize.sync()
  })

  it(`Check for ${tableName} metadata table`, async () => {
    expect(sequelize.isDefined(`purposize_${tableName}Purposes`)).to.equal(true)
  })

  it.only('Check for eMail and postalAddress in personalDataFieldsTable', async () => {
    let result = await sequelize.model('purposize_personalDataFields').findAll()
    expect(result.every( (x) => {
      return x.tableName === tableName && personalDataFields.includes(x.fieldName)
    })).to.equal(true)
  })

})
