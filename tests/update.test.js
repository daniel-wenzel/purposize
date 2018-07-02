const sequelize = require('./sequelize')
const purposize = require('../purposize/index')
const { tableName, tableDefinition } = require('./model')

const chai = require('chai')
const expect = chai.expect

let Customers
describe('Testing update through instance.save method', () => {
  before(async () => {
    await sequelize.getQueryInterface().dropAllTables()
    Customers = sequelize.define(tableName, tableDefinition);
    await sequelize.sync()
    await purposize.loadPurposes('./purposes.yml')
    
    const alice = await Customers.create({
      eMail: "alice@email.com",
      postalAddress: "1234 Shoppington",
      unfulfilledOrders: 1
    }, {
      purpose: 'ORDER'
    })

    const bob = await Customers.create({
      eMail: "bob@email.com",
      postalAddress: "1234 Buytown",
      unfulfilledOrders: 2
    }, {
      purpose: ['ORDER', 'NEWSLETTER']
    })

    const carl = await Customers.create({
      // eMail: "carl@email.com",
      postalAddress: "1234 Cheapcity",
    }, {
      purpose: 'FULFILLMENT'
    })
  })

  it('Successful update with adding new data fields', async () => {
    const carl = await Customers.find({ 
      where: {
        postalAddress: "1234 Cheapcity"
      },
      for: 'FULFILLMENT'
    })

    const oldCarlPurposes = await sequelize.model('purposize_customersPurposes').findAll({
      where: { 
        customersId: carl.id
      }
    })
    // Check that carl was only stored for the purpose FULFILLMENT
    expect(oldCarlPurposes.length).to.equal(1)

    carl.postalAddress = "9876 Berlin"
    await carl.save()

    const oldCarl = await Customers.find({ 
      where: {
        postalAddress: "1234 Cheapcity"
      },
      for: 'FULFILLMENT'
    })
    expect(oldCarl).to.be.null

    const newCarl = await Customers.find({ 
      where: {
        postalAddress: "9876 Berlin"
      },
      for: 'FULFILLMENT'
    })

    expect(newCarl).not.to.be.null
    expect(newCarl.postalAddress).to.equal("9876 Berlin")

    const newCarlPurposes = await sequelize.model('purposize_customersPurposes').findAll({
      where: { 
        customersId: carl.id
      }
    })
    // Check that carl is still only stored for the purpose FULFILLMENT
    expect(newCarlPurposes.length).to.equal(1)
  })

  it('Error when adding a new illegal field and saving', async () => {
    try {
      const carl = await Customers.find({ 
        where: {
          postalAddress: "9876 Berlin"
        },
        for: 'FULFILLMENT'
      })
  
      carl.eMail = "carl@email.com"
      await carl.save()

    } catch (error) {
      expect(error).to.be.instanceOf(Error)
      return
    }
    expect.fail(null, null, 'No error was thrown')
  })

  it('Successful update with adding new data fields', async () => {
    const carl = await Customers.find({ 
      where: {
        postalAddress: "9876 Berlin"
      },
      for: 'FULFILLMENT'
    })

    const oldCarlPurposes = await sequelize.model('purposize_customersPurposes').findAll({
      where: { 
        customersId: carl.id
      }
    })
    // Check that carl was only stored for the purpose FULFILLMENT
    expect(oldCarlPurposes.length).to.equal(1)

    carl.eMail = "carl@email.com"
    await carl.save({
      purpose: 'NEWSLETTER'
    })

    const newCarl = await Customers.find({ 
      where: {
        eMail: "carl@email.com"
      },
      for: 'NEWSLETTER'
    })
    expect(newCarl).not.to.be.null
    expect(newCarl.eMail).to.equal("carl@email.com")

    const newCarlPurposes = await sequelize.model('purposize_customersPurposes').findAll({
      where: { 
        customersId: newCarl.id
      }
    })
    // Check that carl is now stored for two purposes: FULFILLMENT and NEWSLETTER
    expect(newCarlPurposes.length).to.equal(2)
    expect(newCarlPurposes.map( p => p.purpose ).includes('NEWSLETTER')).to.equal(true)
  })
})
