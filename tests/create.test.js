const sequelize = require('./sequelize')
const purposize = require('../purposize/index')
const { modelName, modelDefinition } = require('./model')

const chai = require('chai')
const expect = chai.expect
const { expectThrowsAsync } = require("./helpers")

let Customer
describe('Testing tableDAO.create method', () => {
  before(async () => {
    await sequelize.getQueryInterface().dropAllTables()
    Customer = sequelize.define(modelName, modelDefinition);
    await sequelize.sync()
    await purposize.loadPurposes(__dirname + "\\purposes.yml")
  })

  it('Error when creating instance without purpose', async () => {
    await expectThrowsAsync(() => (
      Customer.create({
        eMail: "alice@email.com",
        postalAddress: "1234 Shoppington",
        unfulfilledOrders: 1
      })
    ))
  })

  it('Error when creating instance with incompatible data fields to given purpose', async () => {
    await expectThrowsAsync(() => (
      Customer.create({
        eMail: "alice@email.com",
        postalAddress: "1234 Shoppington",
        unfulfilledOrders: 1
      }, {
        purpose: 'NEWSLETTER'
      })
    ))
  })

  it('Error when creating instance with unknown purpose', async () => {
    await expectThrowsAsync(() => (
      Customer.create({
        eMail: "alice@email.com",
        postalAddress: "1234 Shoppington",
        unfulfilledOrders: 1
      }, {
        purpose: 'TEST'
      })
    ))
  })

  it('Error when creating instance with unknown purpose for multiple purposes', async () => {
    await expectThrowsAsync(() => (
      Customer.create({
        eMail: "alice@email.com",
        postalAddress: "1234 Shoppington",
        unfulfilledOrders: 1
      }, {
        purpose: ['ORDER', 'TEST']
      })
    ))
  })

  it('Error when creating instance with multiple purposes and incompatible data fields', async () => {
    await expectThrowsAsync(() => (
      Customer.create({
        eMail: "alice@email.com",
        postalAddress: "1234 Shoppington",
        age: 30,
        unfulfilledOrders: 1
      }, {
        purpose: ['FULFILLMENT', 'NEWSLETTER']
      })
    ))
  })

  it('Successful creation with all compatible attributes', async () => {
    const alice = await Customer.create({
      eMail: "alice@email.com",
      postalAddress: "1234 Shoppington",
      unfulfilledOrders: 1
    }, {
      purpose: 'ORDER'
    })
    expect(alice).not.to.be.undefined 
  })

  it('Successful creation with some compatible attributes', async () => {
    const alice = await Customer.create({
      eMail: "alice@email.com",
      // postalAddress: "1234 Shoppington",
      unfulfilledOrders: 1
    }, {
      purpose: 'ORDER'
    })
    expect(alice).not.to.be.undefined 
  })

  it('Successful creation with no personal attributes', async () => {
    const alice = await Customer.create({
      // eMail: "alice@email.com",
      // postalAddress: "1234 Shoppington",
      unfulfilledOrders: 1
    }, {
      purpose: 'ORDER'
    })
    expect(alice).not.to.be.undefined 
  })

  it('Successful creation with only personal attributes', async () => {
    const alice = await Customer.create({
      eMail: "alice@email.com",
      postalAddress: "1234 Shoppington",
      // unfulfilledOrders: 1
    }, {
      purpose: 'ORDER'
    })
    expect(alice).not.to.be.undefined 
  })

  it('Successful creation with multiple purposes', async () => {
    const alice = await Customer.create({
      eMail: "alice@email.com",
      postalAddress: "1234 Shoppington",
      unfulfilledOrders: 1
    }, {
      purpose: ['FULFILLMENT', 'NEWSLETTER']
    })
    expect(alice).not.to.be.undefined 
  })

  it('Successful creation with no purpose and no personal data', async () => {
    const alice = await Customer.create({
      unfulfilledOrders: 1
    })
    expect(alice).not.to.be.undefined
  })

  it('Test that creation does not leak personal data', async () => {
    const alice = await Customer.create({
      eMail: "alice@email.com",
      postalAddress: "1234 Shoppington",
      unfulfilledOrders: 1
    }, {
      purpose: ['FULFILLMENT', 'NEWSLETTER']
    })
    expect(alice).not.to.be.undefined
    expect(alice.eMail).not.to.be.undefined 
    expect(alice.postalAddress).not.to.be.undefined
    expect(alice.unfulfilledOrders).not.to.be.undefined
  })

  it('Test metadata table includes entry', async () => {
    const alice = await Customer.create({
      eMail: "alice@email.com",
      postalAddress: "1234 Shoppington",
      unfulfilledOrders: 1
    }, {
      purpose: ['FULFILLMENT', 'NEWSLETTER']
    })

    const metaDataTable = sequelize.model(`purposize_${Customer.tableName}Purposes`)
    const metaDataEntries = await metaDataTable.findAll({
      where: {
        [modelName + 'Id']: alice.id
      }
    })

    expect(metaDataEntries.length).to.equal(2)
    expect(metaDataEntries.find( e => e.purpose = 'FULFILLMENT')).not.to.be.undefined
    expect(metaDataEntries.find( e => e.purpose = 'NEWSLETTER')).not.to.be.undefined
  })
})
