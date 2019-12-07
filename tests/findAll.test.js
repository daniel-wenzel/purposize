const sequelize = require('./sequelize')
const purposize = require('../purposize/index')
const { modelName, modelDefinition } = require('./model')

const chai = require('chai')
const expect = chai.expect

let Customer
describe('Testing tableDAO.findAll method', () => {
  before(async () => {
    await sequelize.getQueryInterface().dropAllTables()
    Customer = sequelize.define(modelName, modelDefinition);
    await sequelize.sync()
    await purposize.loadPurposes(__dirname + "\\purposes.yml")
    
    const alice = await Customer.create({
      eMail: "alice@email.com",
      postalAddress: "1234 Shoppington",
      unfulfilledOrders: 1
    }, {
      purpose: 'ORDER'
    })

    const bob = await Customer.create({
      eMail: "bob@email.com",
      postalAddress: "1234 Buytown",
      unfulfilledOrders: 2
    }, {
      purpose: ['ORDER', 'NEWSLETTER']
    })

    const carl = await Customer.create({
      // eMail: "carl@email.com",
      postalAddress: "1234 Cheapcity",
    }, {
      purpose: 'FULFILLMENT'
    })
  })

  it('Success for retrieval of customers with transitive purpose', async () => {
    const result = await Customer.findAll({ 
      purpose: 'FULFILLMENT'
    })
    expect(result.length).to.equal(3)
    result.forEach( r => {
      expect(r.eMail).to.be.undefined
      expect(r.postalAddress).not.to.be.undefined
    })
  })

  it('Successful findAll without conditions', async () => {
    const result = await Customer.findAll({ 
      purpose: 'ORDER'
    })
    expect(result.length).to.equal(2)
    result.forEach( r => {
      expect(r.eMail).not.to.be.undefined
      expect(r.postalAddress).not.to.be.undefined
    })
  })

})
