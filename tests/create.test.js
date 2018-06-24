const sequelize = require('./sequelize')
const purposize = require('../purposize/index')
const { tableName, tableDefinition, personalDataFields } = require('./model')

const chai = require('chai')
const expect = chai.expect


let Customers
describe('Testing tableDAO.create method', () => {
  before(async () => {
    Customers = sequelize.define(tableName, tableDefinition);
    await sequelize.sync({ force: true })
    await purposize.loadPurposes('./purposes.yml')
  })

  it('Error when creating instance without purpose', async () => {
    try {
      await Customers.create({
        eMail: "alice@email.com",
        postalAddress: "1234 Shoppington",
        unfulfilledOrders: 1
      })
    } catch (error) {
      expect(error).to.be.instanceOf(Error)
      return
    }
    expect.fail(null, null, 'No error was thrown')
  })

  it('Error when creating instance with incompatible data fields to given purpose', async () => {
    try {
      await Customers.create({
        eMail: "alice@email.com",
        postalAddress: "1234 Shoppington",
        unfulfilledOrders: 1
      }, {
        purpose: 'NEWSLETTER'
      })
    } catch (error) {
      expect(error).to.be.instanceOf(Error)
      return
    }
    expect.fail(null, null, 'No error was thrown')
  })

  it('Error when creating instance with unknown purpose', async () => {
    try {
      await Customers.create({
        eMail: "alice@email.com",
        postalAddress: "1234 Shoppington",
        unfulfilledOrders: 1
      }, {
        purpose: 'TEST'
      })
    } catch (error) {
      expect(error).to.be.instanceOf(Error)
      return
    }
    expect.fail(null, null, 'No error was thrown')
  })

  it('Error when creating instance with unknown purpose for multiple purposes', async () => {
    try {
      await Customers.create({
        eMail: "alice@email.com",
        postalAddress: "1234 Shoppington",
        unfulfilledOrders: 1
      }, {
        purpose: ['ORDER', 'TEST']
      })
    } catch (error) {
      expect(error).to.be.instanceOf(Error)
      return
    }
    expect.fail(null, null, 'No error was thrown')
  })

  it('Error when creating instance with multiple purposes and incompatible data fields', async () => {
    try {
      await Customers.create({
        eMail: "alice@email.com",
        postalAddress: "1234 Shoppington",
        age: 30,
        unfulfilledOrders: 1
      }, {
        purpose: ['FULFILLMENT', 'NEWSLETTER']
      })
    } catch (error) {
      expect(error).to.be.instanceOf(Error)
      return
    }
    expect.fail(null, null, 'No error was thrown')
  })

  it('Successful creation with all compatible attributes', async () => {
    const alice = await Customers.create({
      eMail: "alice@email.com",
      postalAddress: "1234 Shoppington",
      unfulfilledOrders: 1
    }, {
      purpose: 'ORDER'
    })
    expect(alice).not.to.be.undefined 
  })

  it('Successful creation with some compatible attributes', async () => {
    const alice = await Customers.create({
      eMail: "alice@email.com",
      // postalAddress: "1234 Shoppington",
      unfulfilledOrders: 1
    }, {
      purpose: 'ORDER'
    })
    expect(alice).not.to.be.undefined 
  })

  it('Successful creation with no personal attributes', async () => {
    const alice = await Customers.create({
      // eMail: "alice@email.com",
      // postalAddress: "1234 Shoppington",
      unfulfilledOrders: 1
    }, {
      purpose: 'ORDER'
    })
    expect(alice).not.to.be.undefined 
  })

  it('Successful creation with only personal attributes', async () => {
    const alice = await Customers.create({
      eMail: "alice@email.com",
      postalAddress: "1234 Shoppington",
      // unfulfilledOrders: 1
    }, {
      purpose: 'ORDER'
    })
    expect(alice).not.to.be.undefined 
  })

  it('Successful creation with multiple purposes', async () => {
    const alice = await Customers.create({
      eMail: "alice@email.com",
      postalAddress: "1234 Shoppington",
      unfulfilledOrders: 1
    }, {
      purpose: ['FULFILLMENT', 'NEWSLETTER']
    })
    expect(alice).not.to.be.undefined 
  })
})
