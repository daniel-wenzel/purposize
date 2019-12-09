const sequelize = require('./sequelize')
const purposize = require('../purposize/index')
const { modelName, modelDefinition } = require('./model')

const chai = require('chai')
const expect = chai.expect
const { expectThrowsAsync } = require("./helpers")

let Customer
describe('Testing update through instance.save method', () => {
  beforeEach(async () => {
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

    const david = await Customer.create({
      eMail: "david@email.com",
      postalAddress: "1234 Idktown",
    }, {
      purpose: ["NEWSLETTER", 'FULFILLMENT']
    })
  })

  it('Successful update without adding new data fields', async () => {
    const carl = await Customer.findOne({
      where: {
        postalAddress: "1234 Cheapcity"
      },
      purpose: 'FULFILLMENT'
    })

    const oldCarlPurposes = await sequelize.model(`purposize_${Customer.tableName}Purposes`).findAll({
      where: {
        customerId: carl.id
      }
    })
    // Check that carl was only stored for the purpose FULFILLMENT
    expect(oldCarlPurposes.length).to.equal(1)

    carl.postalAddress = "9876 Berlin"
    const a = await carl.save({
      purpose: "FULFILLMENT"
    })
    // console.log(a.dataValues)

    const oldCarl = await Customer.findOne({
      where: {
        postalAddress: "1234 Cheapcity"
      },
      purpose: 'FULFILLMENT'
    })
    expect(oldCarl).to.be.null

    const newCarl = await Customer.findOne({
      where: {
        postalAddress: "9876 Berlin"
      },
      purpose: 'FULFILLMENT'
    })

    expect(newCarl).not.to.be.null
    expect(newCarl.postalAddress).to.equal("9876 Berlin")

    const newCarlPurposes = await sequelize.model(`purposize_${Customer.tableName}Purposes`).findAll({
      where: {
        customerId: carl.id
      }
    })
    // Check that carl is still only stored for the purpose FULFILLMENT
    expect(newCarlPurposes.length).to.equal(1)
  })

  it('Error when adding a new illegal field and saving', async () => {
    const carl = await Customer.findOne({
      where: {
        postalAddress: "1234 Cheapcity"
      },
      purpose: 'FULFILLMENT'
    })

    carl.eMail = "carl@email.com"

    await expectThrowsAsync(() => carl.save())
  })

  it('Successful update with adding new data fields for a new purpose', async () => {
    const carl = await Customer.findOne({
      where: {
        postalAddress: "1234 Cheapcity"
      },
      purpose: 'FULFILLMENT'
    })

    const oldCarlPurposes = await sequelize.model(`purposize_${Customer.tableName}Purposes`).findAll({
      where: {
        customerId: carl.id
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
    expect(newCarl.eMail).not.to.be.undefined

    newCarl = await Customer.findOne({
      where: {
        eMail: "carl@email.com"
      },
      purpose: 'NEWSLETTER'
    })
    expect(newCarl).not.to.be.null
    expect(newCarl.postalAddress).to.be.undefined
    expect(newCarl.eMail).to.equal("carl@email.com")

    const newCarlPurposes = await sequelize.model(`purposize_${Customer.tableName}Purposes`).findAll({
      where: {
        customerId: newCarl.id
      }
    })
    // Check that carl is now stored for two purposes: FULFILLMENT and NEWSLETTER
    expect(newCarlPurposes.length).to.equal(2)
    expect(newCarlPurposes.map( p => p.purpose ).includes('NEWSLETTER')).to.equal(true)
  })

  it("Make sure update does not leak personal data", async () => {
    const bob = await Customer.findOne({
      where: {
        eMail: "bob@email.com"
      },
      purpose: 'NEWSLETTER'
    })

    bob.eMail = "newBob@email.com"
    const newBob = await bob.save({
      purpose: "NEWSLETTER"
    })

    expect(newBob.eMail).not.to.be.undefined
    expect(newBob.postalAddress).to.be.undefined

  })

  it("Make sure update does not leak personal data", async () => {
    const david = await Customer.findOne({
      where: {
        eMail: "david@email.com"
      },
      purpose: 'NEWSLETTER'
    })

    expect(david.postalAddress).to.be.undefined


    david.postalAddress = "1234 Sometown"

    await expectThrowsAsync(() => (
      david.save({
        // purpose: ["NEWSLETTER", "FULFILLMENT"]
        purpose: "NEWSLETTER"
      })
    ))
  })
})

describe('Testing update through instance.update method', () => {
  beforeEach(async () => {
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

  it('Successful update without adding new data fields', async () => {
    const carl = await Customer.findOne({
      where: {
        postalAddress: "1234 Cheapcity"
      },
      purpose: 'FULFILLMENT'
    })

    const oldCarlPurposes = await sequelize.model(`purposize_${Customer.tableName}Purposes`).findAll({
      where: {
        customerId: carl.id
      }
    })
    // Check that carl was only stored for the purpose FULFILLMENT
    expect(oldCarlPurposes.length).to.equal(1)

    const a = await carl.update({
      postalAddress: "9876 Berlin"
    }, {
      purpose: "FULFILLMENT"
    })

    // console.log(a.dataValues)

    const oldCarl = await Customer.findOne({
      where: {
        postalAddress: "1234 Cheapcity"
      },
      purpose: 'FULFILLMENT'
    })
    expect(oldCarl).to.be.null

    const newCarl = await Customer.findOne({
      where: {
        postalAddress: "9876 Berlin"
      },
      purpose: 'FULFILLMENT'
    })

    expect(newCarl).not.to.be.null
    expect(newCarl.postalAddress).to.equal("9876 Berlin")

    const newCarlPurposes = await sequelize.model(`purposize_${Customer.tableName}Purposes`).findAll({
      where: {
        customerId: carl.id
      }
    })
    // Check that carl is still only stored for the purpose FULFILLMENT
    expect(newCarlPurposes.length).to.equal(1)
  })

  it('Error when adding a new illegal field and saving', async () => {
    const carl = await Customer.findOne({
      where: {
        postalAddress: "1234 Cheapcity"
      },
      purpose: 'FULFILLMENT'
    })

    await expectThrowsAsync(() => (
      carl.update({
        eMail: "carl@email.com"
      })
    ))
  })

  it('Successful update with adding new data fields', async () => {
    const carl = await Customer.findOne({
      where: {
        postalAddress: "1234 Cheapcity"
      },
      purpose: 'FULFILLMENT'
    })

    const oldCarlPurposes = await sequelize.model(`purposize_${Customer.tableName}Purposes`).findAll({
      where: {
        customerId: carl.id
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
    expect(newCarl.eMail).not.to.be.undefined

    newCarl = await Customer.findOne({
      where: {
        eMail: "carl@email.com"
      },
      purpose: 'NEWSLETTER'
    })
    expect(newCarl).not.to.be.null
    expect(newCarl.postalAddress).to.be.undefined
    expect(newCarl.eMail).to.equal("carl@email.com")

    const newCarlPurposes = await sequelize.model(`purposize_${Customer.tableName}Purposes`).findAll({
      where: {
        customerId: newCarl.id
      }
    })
    // Check that carl is now stored for two purposes: FULFILLMENT and NEWSLETTER
    expect(newCarlPurposes.length).to.equal(2)
    expect(newCarlPurposes.map( p => p.purpose ).includes('NEWSLETTER')).to.equal(true)
  })
})
