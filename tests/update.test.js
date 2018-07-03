const sequelize = require('./sequelize')
const purposize = require('../purposize/index')
const { tableName, tableDefinition } = require('./model')

const chai = require('chai')
const expect = chai.expect

let Customers
describe('Testing update through instance.save method', () => {
  beforeEach(async () => {
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

  it('Successful update without adding new data fields', async () => {
    const carl = await Customers.find({ 
      where: {
        postalAddress: "1234 Cheapcity"
      },
      purpose: 'FULFILLMENT'
    })

    const oldCarlPurposes = await sequelize.model('purposize_customersPurposes').findAll({
      where: { 
        customersId: carl.id
      }
    })
    // Check that carl was only stored for the purpose FULFILLMENT
    expect(oldCarlPurposes.length).to.equal(1)

    carl.postalAddress = "9876 Berlin"
    const a = await carl.save()
    // console.log(a.dataValues)

    const oldCarl = await Customers.find({ 
      where: {
        postalAddress: "1234 Cheapcity"
      },
      purpose: 'FULFILLMENT'
    })
    expect(oldCarl).to.be.null

    const newCarl = await Customers.find({ 
      where: {
        postalAddress: "9876 Berlin"
      },
      purpose: 'FULFILLMENT'
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
          postalAddress: "1234 Cheapcity"
        },
        purpose: 'FULFILLMENT'
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
        postalAddress: "1234 Cheapcity"
      },
      purpose: 'FULFILLMENT'
    })

    const oldCarlPurposes = await sequelize.model('purposize_customersPurposes').findAll({
      where: { 
        customersId: carl.id
      }
    })
    // Check that carl was only stored for the purpose FULFILLMENT
    expect(oldCarlPurposes.length).to.equal(1)

    carl.eMail = "carl@email.com"
    let newCarl = await carl.save({
      purpose: 'NEWSLETTER'
    })

    // Check that save method does not leak personal data
    expect(newCarl).not.to.be.null
    expect(newCarl.postalAddress).to.be.undefined
    expect(newCarl.eMail).to.be.undefined

    newCarl = await Customers.find({ 
      where: {
        eMail: "carl@email.com"
      },
      purpose: 'NEWSLETTER'
    })
    expect(newCarl).not.to.be.null
    expect(newCarl.postalAddress).to.be.undefined
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

describe('Testing update through instance.update method', () => {
  beforeEach(async () => {
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

  it('Successful update without adding new data fields', async () => {
    const carl = await Customers.find({ 
      where: {
        postalAddress: "1234 Cheapcity"
      },
      purpose: 'FULFILLMENT'
    })

    const oldCarlPurposes = await sequelize.model('purposize_customersPurposes').findAll({
      where: { 
        customersId: carl.id
      }
    })
    // Check that carl was only stored for the purpose FULFILLMENT
    expect(oldCarlPurposes.length).to.equal(1)

    const a = await carl.update({
      postalAddress: "9876 Berlin"
    })

    // console.log(a.dataValues)

    const oldCarl = await Customers.find({ 
      where: {
        postalAddress: "1234 Cheapcity"
      },
      purpose: 'FULFILLMENT'
    })
    expect(oldCarl).to.be.null

    const newCarl = await Customers.find({ 
      where: {
        postalAddress: "9876 Berlin"
      },
      purpose: 'FULFILLMENT'
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
          postalAddress: "1234 Cheapcity"
        },
        purpose: 'FULFILLMENT'
      })
  
      await carl.update({
        eMail: "carl@email.com"
      })

    } catch (error) {
      expect(error).to.be.instanceOf(Error)
      return
    }
    expect.fail(null, null, 'No error was thrown')
  })

  it('Successful update with adding new data fields', async () => {
    const carl = await Customers.find({ 
      where: {
        postalAddress: "1234 Cheapcity"
      },
      purpose: 'FULFILLMENT'
    })

    const oldCarlPurposes = await sequelize.model('purposize_customersPurposes').findAll({
      where: { 
        customersId: carl.id
      }
    })
    // Check that carl was only stored for the purpose FULFILLMENT
    expect(oldCarlPurposes.length).to.equal(1)

    let newCarl = await carl.update({
      eMail: "carl@email.com"
    }, {
      purpose: 'NEWSLETTER'
    })

    // Update method should not leak personal data
    expect(newCarl).not.to.be.null
    expect(newCarl.postalAddress).to.be.undefined
    expect(newCarl.eMail).to.be.undefined

    newCarl = await Customers.find({ 
      where: {
        eMail: "carl@email.com"
      },
      purpose: 'NEWSLETTER'
    })
    expect(newCarl).not.to.be.null
    expect(newCarl.postalAddress).to.be.undefined
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
