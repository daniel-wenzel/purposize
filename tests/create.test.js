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
      const alice = await Customers.create({
        eMail: "alice@email.com",
        postalAddress: "1234 Shoppington",
        unfulfilledOrders: 1
      })
    } catch (error) {
      expect(error).to.not.be.undefined
    }
  })
})
