const sequelize = require('./sequelize')
const { modelName, modelDefinition, personalDataFields } = require('./model')

const chai = require('chai')
const expect = chai.expect

let Customer
describe('Testing sequelize.define method', () => {
  before(async () => {
    await sequelize.getQueryInterface().dropAllTables()
    Customer = sequelize.define(modelName, modelDefinition);
    await sequelize.sync()
  })

  it(`Check for ${modelName} metadata table`, async () => {
    expect(sequelize.isDefined(`purposize_${Customer.tableName}Purposes`)).to.equal(true)
  })

  it('Check for eMail and postalAddress in personalDataFieldsTable', async () => {
    let result = await sequelize.model('purposize_personalDataFields').findAll()
    expect(result.every( (x) => {
      return x.tableName === Customer.tableName && personalDataFields.includes(x.fieldName)
    })).to.equal(true)
  })

})
