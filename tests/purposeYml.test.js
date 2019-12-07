const sequelize = require("./sequelize")
const purposize = require("../purposize/index")
const { modelName, modelDefinition } = require("./model")

const chai = require("chai")
const expect = chai.expect

let Customer
describe("Tests for configuration of purposes.yml file", () => {
  before(async () => {
    await sequelize.getQueryInterface().dropAllTables()
    Customer = sequelize.define(modelName, modelDefinition)
    await sequelize.sync()
    await purposize.loadPurposes(__dirname + "\\purposes.yml")

    const alice = await Customer.create(
      {
        eMail: "alice@email.com",
        postalAddress: "1234 Shoppington",
        unfulfilledOrders: 1,
      },
      {
        purpose: "ORDER",
      }
    )

    const bob = await Customer.create(
      {
        eMail: "bob@email.com",
        postalAddress: "1234 Buytown",
        unfulfilledOrders: 2,
      },
      {
        purpose: ["ORDER", "NEWSLETTER", "WEIRD_PURPOSE"],
      }
    )
  })

  it("No error when marking field as relevant although it is not personal data", async () => {
    const result = await Customer.findOne({
      where: {
        eMail: "bob@email.com",
      },
      purpose: "WEIRD_PURPOSE",
    })
    expect(result.eMail).not.to.be.undefined
    expect(result.postalAddress).to.be.undefined
    expect(result.unfulfilledOrders).to.be.equal(2)
  })
})
