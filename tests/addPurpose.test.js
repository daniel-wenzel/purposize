const sequelize = require('./sequelize')
const purposize = require('../purposize/index')
const { modelName, modelDefinition } = require('./model')

const chai = require('chai')
const expect = chai.expect


let Customer
describe('Testing instance.addPurpose method', () => {
  before(async () => {
    await sequelize.getQueryInterface().dropAllTables()
    Customer = sequelize.define(modelName, modelDefinition);
    await sequelize.sync()
    await purposize.loadPurposes(__dirname + "\\purposes.yml")
  })

  it('Successful purpose addition', async () => {
    const alice = await Customer.create({
        unfulfilledOrders: 2
    })

    const metaDataTable = sequelize.model(`purposize_${Customer.tableName}Purposes`)
    let result = await metaDataTable.findAll()
    
    expect(result.length).to.equal(0)
    await alice.addPurpose('NEWSLETTER')
    result = await metaDataTable.findAll()
    expect(result.length).to.equal(1)
    expect(result[0].purpose).to.equal('NEWSLETTER')
  })

  it('Error when adding unknown purpose', async () => {
    const alice = await Customer.create({
      unfulfilledOrders: 2
    })

    try {
      await alice.addPurpose('TEST')

      expect.fail(null, null, 'No error was thrown')
    } catch (error) {
      expect(error).to.be.instanceOf(Error)
    }
  })

  it('Error when adding empty purpose', async () => {
    const alice = await Customer.create({
      unfulfilledOrders: 2
    })

    try {
      await alice.addPurpose('')

      expect.fail(null, null, 'No error was thrown')
    } catch (error) {
      expect(error).to.be.instanceOf(Error)
    }
  })

  it('Error when adding empty purpose', async () => {
    const alice = await Customer.create({
      unfulfilledOrders: 2
    })

    try {
      await alice.addPurpose()

      expect.fail(null, null, 'No error was thrown')
    } catch (error) {
      expect(error).to.be.instanceOf(Error)
    }
  })
})