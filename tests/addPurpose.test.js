const sequelize = require('./sequelize')
const purposize = require('../purposize/index')
const { tableName, tableDefinition } = require('./model')

const chai = require('chai')
const expect = chai.expect


let Customers
describe('Testing instance.addPurpose method', () => {
  before(async () => {
    await sequelize.getQueryInterface().dropAllTables()
    Customers = sequelize.define(tableName, tableDefinition);
    await sequelize.sync()
    await purposize.loadPurposes('./purposes.yml')
  })

  it('Successful purpose addition', async () => {
    const alice = await Customers.create({
        unfulfilledOrders: 2
    })

    const metaDataTable = sequelize.model('purposize_customersPurposes')
    let result = await metaDataTable.findAll()
    
    expect(result.length).to.equal(0)
    await alice.addPurpose('NEWSLETTER')
    result = await metaDataTable.findAll()
    expect(result.length).to.equal(1)
    expect(result[0].purpose).to.equal('NEWSLETTER')
  })

  it('Error when adding unknown purpose', async () => {
    const alice = await Customers.create({
      unfulfilledOrders: 2
    })

    try {
      await alice.addPurpose('TEST')
    } catch (error) {
      expect(error).to.be.instanceOf(Error)
      return
    }
    expect.fail(null, null, 'No error was thrown')
  })

  it('Error when adding empty purpose', async () => {
    const alice = await Customers.create({
      unfulfilledOrders: 2
    })

    try {
      await alice.addPurpose('')
    } catch (error) {
      expect(error).to.be.instanceOf(Error)
      return
    }
    expect.fail(null, null, 'No error was thrown')
  })

  it('Error when adding empty purpose', async () => {
    const alice = await Customers.create({
      unfulfilledOrders: 2
    })

    try {
      await alice.addPurpose()
    } catch (error) {
      expect(error).to.be.instanceOf(Error)
      return
    }
    expect.fail(null, null, 'No error was thrown')
  })
})