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

  it('Successful creation', async () => {
    const alice = await Customers.create({
      eMail: "alice@email.com",
      postalAddress: "1234 Shoppington",
      unfulfilledOrders: 1
    }, {
      purpose: 'ORDER'
    })
    expect(alice).not.to.be.undefined 
  })
})
