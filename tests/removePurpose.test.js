const Sequelize = require('sequelize')
const sequelize = require('./sequelize')
const purposize = require('../purposize/index')
const { tableName, tableDefinition } = require('./model')

const chai = require('chai')
const expect = chai.expect


let Customers
describe('Testing instance.removePurpose method', () => {
  before(async () => {
    await sequelize.getQueryInterface().dropAllTables()
    Customers = sequelize.define(tableName, tableDefinition);
    await sequelize.sync()
    await purposize.loadPurposes('./purposes.yml')
  })

  it('Successful purpose removal', async () => {
    const alice = await Customers.create({
      eMail: 'alice@email.com',
      unfulfilledOrders: 2
    }, {
      purpose: ['NEWSLETTER']
    })

    let rawRes = (await sequelize.query('SELECT * FROM customers WHERE id='+alice.id, { model: Customers }))[0]
    expect(rawRes.eMail).not.to.be.null

    const metaDataTable = sequelize.model('purposize_customersPurposes')
    let result = await metaDataTable.findAll()
    
    expect(result.length).to.equal(1)
    await alice.removePurpose('NEWSLETTER')
    result = await metaDataTable.findAll()
    expect(result.length).to.equal(0)

    let newAlice = await Customers.findOne({
      where: {
        id: alice.id
      },
      purpose: 'NEWSLETTER'
    })
    expect(newAlice).to.be.null

    rawRes = (await sequelize.query('SELECT * FROM customers WHERE id='+alice.id, { model: Customers }))[0]
    expect(rawRes.eMail).to.be.null
    

  })

  it('Error when removing unknown purpose', async () => {
    const alice = await Customers.create({
      eMail: 'alice@email.com',
      unfulfilledOrders: 2
    }, {
      purpose: ['NEWSLETTER']
    })

    try {
      await alice.removePurpose('TEST')
    } catch (error) {
      expect(error).to.be.instanceOf(Error)
      return
    }
    expect.fail(null, null, 'No error was thrown')
  })

  it('Error when adding empty purpose', async () => {
    const alice = await Customers.create({
      eMail: 'alice@email.com',
      unfulfilledOrders: 2
    }, {
      purpose: ['NEWSLETTER']
    })

    try {
      await alice.removePurpose('')
    } catch (error) {
      expect(error).to.be.instanceOf(Error)
      return
    }
    expect.fail(null, null, 'No error was thrown')
  })

  it('Error when adding empty purpose', async () => {
    const alice = await Customers.create({
      eMail: 'alice@email.com',
      unfulfilledOrders: 2
    }, {
      purpose: ['NEWSLETTER']
    })

    try {
      await alice.removePurpose()
    } catch (error) {
      expect(error).to.be.instanceOf(Error)
      return
    }
    expect.fail(null, null, 'No error was thrown')
  })
})