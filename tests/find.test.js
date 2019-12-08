const sequelize = require('./sequelize')
const purposize = require('../purposize/index')
const { modelName, modelDefinition } = require('./model')

const chai = require('chai')
const expect = chai.expect

let Customer
describe('Testing tableDAO.findOne method', () => {
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
  })

  it('Success for no purpose, no where and no select fields', async () => {
    const result = await Customer.findOne({})
    expect(result.eMail).to.be.undefined
    expect(result.postalAddress).to.be.undefined
  })

  it('Error for no purpose, sensitive where fields, no select fields', async () => {
    try {
      const result = await Customer.findOne({ 
        where: {
          eMail: "bob@email.com"
        }
      })

      expect.fail(null, null, 'No error was thrown')
    } catch (error) {
      expect(error).to.be.instanceOf(Error)
    }
  })

  it('Error for no purpose, no where fields, sensitive select fields', async () => {
    try {
      const result = await Customer.findOne({ 
        attributes: ["eMail"]
      })

      expect.fail(null, null, 'No error was thrown')
    } catch (error) {
      expect(error).to.be.instanceOf(Error)
    }
  })

  it('Error for unknown purpose, sensitive where fields, no select fields', async () => {
    try {
      const result = await Customer.findOne({ 
        where: {
          eMail: "bob@email.com"
        },
        purpose: 'TEST'
      })

      expect.fail(null, null, 'No error was thrown')
    } catch (error) {
      expect(error).to.be.instanceOf(Error)
    }
  })

  it('Error for invalid purpose, sensitive where fields, no select fields', async () => {
    try {
      const result = await Customer.findOne({ 
        where: {
          eMail: "bob@email.com"
        },
        purpose: true
      })

      expect.fail(null, null, 'No error was thrown')
    } catch (error) {
      expect(error).to.be.instanceOf(Error)
    }
  })

  it('Success for no purpose, unsensitive where fields, no select fields', async () => {
    const result = await Customer.findOne({ 
      where: {
        unfulfilledOrders: 2
      }
    })
    expect(result.eMail).to.be.undefined
    expect(result.postalAddress).to.be.undefined
    expect(result.unfulfilledOrders).to.be.equal(2)
  })

  it('Success for no purpose, no where fields, sensitive select fields', async () => {
    const result = await Customer.findOne({ 
      attributes: ["unfulfilledOrders"]
    })
    expect(result.eMail).to.be.undefined
    expect(result.postalAddress).to.be.undefined
  })

  it('Success for purpose, unsensitive where fields, no select fields', async () => {
    const result = await Customer.findOne({ 
      where: {
        eMail: "bob@email.com",
      },
      purpose: 'ORDER'
    })
    expect(result.eMail).not.to.be.undefined
    expect(result.postalAddress).not.to.be.undefined
    expect(result.unfulfilledOrders).to.be.equal(2)
  })

  it('Success for purpose, unsensitive where fields, sensitive select fields', async () => {
    const result = await Customer.findOne({ 
      attributes: ["eMail"],
      where: {
        eMail: "bob@email.com",
      },
      purpose: 'ORDER'
    })
    expect(result.eMail).not.to.be.undefined
    expect(result.postalAddress).to.be.undefined
    expect(result.unfulfilledOrders).to.be.undefined
  })

  it('Error for purpose with illegal where fields', async () => {
    try {
      const result = await Customer.findOne({ 
        where: {
          postalAddress: "1234 Buytown"
        },
        purpose: 'NEWSLETTER'
      })

      expect.fail(null, null, 'No error was thrown')
    } catch (error) {
      expect(error).to.be.instanceOf(Error)
    } 
  })

  it('Error for purpose with illegal select fields', async () => {
    try {
      const result = await Customer.findOne({ 
        attributes: ["postalAddress"],
        where: {
          eMail: "bob@email.com"
        },
        purpose: 'NEWSLETTER'
      })

      expect.fail(null, null, 'No error was thrown')
    } catch (error) {
      expect(error).to.be.instanceOf(Error)
    }
  })

  it('Success for purpose with limited fields', async () => {
    const result = await Customer.findOne({
      where: {
        eMail: "bob@email.com"
      },
      purpose: 'NEWSLETTER'
    })
    expect(result.postalAddress).to.be.undefined
    expect(result.unfulfilledOrders).not.to.be.undefined
  })

})
