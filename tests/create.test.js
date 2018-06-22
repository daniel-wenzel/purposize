const Sequelize = require('sequelize')
const sequelize = require('./sequelize')
const purposize = require('../purposize/index')

const chai = require('chai')
const expect = chai.expect

const tableName = 'customers'
const personalDataFields = ['eMail', 'postalAddress']
const tableDefinition = {
  eMail: {
    type: Sequelize.STRING,
    isPersonalData: true
  },
  postalAddress: {
    type: Sequelize.STRING,
    isPersonalData: true
  },
  unfulfilledOrders: {
    type: Sequelize.INTEGER
  }
}

let Customers
describe('Testing tableDAO.create method', () => {
  before(async () => {
    Customers = sequelize.define(tableName, tableDefinition);
    await sequelize.sync({ force: true })
    purposize.loadPurposes('./purposes.yml')
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