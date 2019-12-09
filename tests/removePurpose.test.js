const Sequelize = require('sequelize')
const sequelize = require('./sequelize')
const purposize = require('../purposize/index')
const { modelName, modelDefinition } = require('./model')

const chai = require('chai')
const expect = chai.expect
const { expectThrowsAsync } = require("./helpers")

let Customer
describe('Testing instance.removePurpose method', () => {
  before(async () => {
    await sequelize.getQueryInterface().dropAllTables()
    Customer = sequelize.define(modelName, modelDefinition);
    await sequelize.sync()
    await purposize.loadPurposes(__dirname + "\\purposes.yml")
  })

  it('Successful purpose removal', async () => {
    const alice = await Customer.create({
      eMail: 'alice@email.com',
      unfulfilledOrders: 2
    }, {
      purpose: ['NEWSLETTER']
    })

    let rawRes = (await sequelize.query('SELECT * FROM customers WHERE id='+alice.id, { model: Customer }))[0]
    expect(rawRes.eMail).not.to.be.null

    const metaDataTable = sequelize.model(`purposize_${Customer.tableName}Purposes`)
    let result = await metaDataTable.findAll()
    
    expect(result.length).to.equal(1)
    await alice.removePurpose('NEWSLETTER')
    result = await metaDataTable.findAll()
    expect(result.length).to.equal(0)

    let newAlice = await Customer.findOne({
      where: {
        id: alice.id
      },
      purpose: 'NEWSLETTER'
    })
    expect(newAlice).to.be.null

    rawRes = (await sequelize.query('SELECT * FROM customers WHERE id='+alice.id, { model: Customer }))[0]
    expect(rawRes.eMail).to.be.null
    

  })

  it('Error when removing unknown purpose', async () => {
    const alice = await Customer.create({
      eMail: 'alice@email.com',
      unfulfilledOrders: 2
    }, {
      purpose: ['NEWSLETTER']
    })

    await expectThrowsAsync(() => alice.removePurpose('TEST'))
    
  })

  it('Error when adding empty purpose', async () => {
    const alice = await Customer.create({
      eMail: 'alice@email.com',
      unfulfilledOrders: 2
    }, {
      purpose: ['NEWSLETTER']
    })

    await expectThrowsAsync(() => alice.removePurpose(''))
  })

  it('Error when adding empty purpose', async () => {
    const alice = await Customer.create({
      eMail: 'alice@email.com',
      unfulfilledOrders: 2
    }, {
      purpose: ['NEWSLETTER']
    })

    await expectThrowsAsync(() => alice.removePurpose())  
  })
})