const sequelize = require('./sequelize')
const purposize = require('../purposize/index')
const { modelName, modelDefinition } = require('./model')

const chai = require('chai')
const expect = chai.expect
const { expectThrowsAsync } = require("./helpers")

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
    await expectThrowsAsync(() => (
      Customer.findOne({ 
        where: {
          eMail: "bob@email.com"
        }
      })
    ))
  })

  it('Error for no purpose, no where fields, sensitive select fields', async () => {
    await expectThrowsAsync(() => (
      Customer.findOne({ 
        attributes: ["eMail"]
      })
    ))
  })

  it('Error for unknown purpose, sensitive where fields, no select fields', async () => {
    await expectThrowsAsync(() => (
      Customer.findOne({ 
        where: {
          eMail: "bob@email.com"
        },
        purpose: 'TEST'
      })
    ))
  })

  it('Error for invalid purpose, sensitive where fields, no select fields', async () => {
    await expectThrowsAsync(() => (
      Customer.findOne({ 
        where: {
          eMail: "bob@email.com"
        },
        purpose: true
      })
    ))
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
    await expectThrowsAsync(() => (
      Customer.findOne({ 
        where: {
          postalAddress: "1234 Buytown"
        },
        purpose: 'NEWSLETTER'
      })
    ))
  })

  it('Error for purpose with illegal select fields', async () => {
    await expectThrowsAsync(() => (
      Customer.findOne({ 
        attributes: ["postalAddress"],
        where: {
          eMail: "bob@email.com"
        },
        purpose: 'NEWSLETTER'
      })
    ))
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

  it("Success for empty attribute array", async () => {
    const result = await Customer.findOne({
      where: {
        eMail: "bob@email.com"
      },
      attributes: [],
      purpose: 'NEWSLETTER'
    })

    expect(result.postalAddress).to.be.undefined
    expect(result.eMail).to.be.undefined
    expect(result.unfulfilledOrders).to.be.undefined
  })

  it("Success for selecting with attribute object with empty include", async () => {
    const result = await Customer.findOne({
      where: {
        eMail: "bob@email.com"
      },
      attributes: {
        include: []
      },
      purpose: 'NEWSLETTER'
    })

    expect(result.postalAddress).to.be.undefined
    expect(result.eMail).not.to.be.undefined
    expect(result.unfulfilledOrders).not.to.be.undefined
  })

  it("Success for selecting with attribute object without exclude", async () => {
    const result = await Customer.findOne({
      where: {
        eMail: "bob@email.com"
      },
      attributes: {
        include: ["unfulfilledOrders"]
      },
      purpose: 'NEWSLETTER'
    })

    expect(result.postalAddress).to.be.undefined
    expect(result.eMail).not.to.be.undefined
    expect(result.unfulfilledOrders).not.to.be.undefined
  })

  it("Success for selecting with attribute object using exclude", async () => {
    const result = await Customer.findOne({
      where: {
        eMail: "bob@email.com"
      },
      attributes: {
        include: ["eMail"],
        exclude: ["unfulfilledOrders"]
      },
      purpose: 'NEWSLETTER'
    })

    // console.log(result.dataValues)

    expect(result.postalAddress).to.be.undefined
    expect(result.eMail).not.to.be.undefined
    expect(result.unfulfilledOrders).to.be.undefined
  })

  it('Error for purpose with illegal select fields in attributes object', async () => {
    await expectThrowsAsync(() => (
      Customer.findOne({ 
        attributes: {
          include: ["postalAddress"]
        },
        where: {
          eMail: "bob@email.com"
        },
        purpose: 'NEWSLETTER'
      })
    ))
  })

  it("Check for no 'attachedPurposes' field", async () => {
    const result = await Customer.findOne({ 
      where: {
        eMail: "bob@email.com",
      },
      purpose: 'ORDER'
    })
    expect(result.attachedPurposes).to.be.undefined
  })

})
