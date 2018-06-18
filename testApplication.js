const Sequelize = require('sequelize');
const purposize = require('./purposize/index.js')

const sequelize = new Sequelize('testdb', 'root', '123456', {
  host: 'localhost',
  dialect: 'mysql',
  logging: false // Prevent sequelize from logging all SQL queries
});
purposize.init(sequelize)

async function run() {
  const Customer = sequelize.define('customers', {
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
  });

  await sequelize.sync({
    force: true
  })
  await purposize.loadPurposes('./purposes.yml')
  const alice = await Customer.create({
    eMail: "alice@email.com",
    postalAddress: "1234 Shoppington",
  }, {
    purpose: 'ORDER'
  })
  console.log(alice.toJSON())

  const bob = await Customer.create({
    eMail: "bob@email.com",
    postalAddress: "1234 Buytown",
    // age: 34
  }, {
    purpose: ['ORDER', 'MARKETING']
  })
  console.log(bob.toJSON())

  const carl = await Customer.create({
    // eMail: "carl@email.com",
    // postalAddress: "1234 Cheapcity",
    unfulfilledOrders: 3
  })
  console.log(carl.toJSON())

  

}

run()

/*
const purposize = require("purposize")
purposize.init(sequelize)
// change sequelize.define

const Customers = sequelize.define('customer', {
  eMail: {
    type: Sequelize.STRING,
    isPersonalData: true
  },
  postalAddress: {
    type: Sequelize.STRING,
    isPersonalData: true
  }
  unfulfilledOrders: {
    type: Sequelize.BOOLEAN
  }
})

purposize.sync()
// Create personal data field table
// Create Purpose table
// Create PurposeField table

Customers.sync()
// Let normal table sync
// Create CustomersPurpose table (if table contains personal data)

purposize.loadPurposes("purposes.yml")
// fills Purpose, PurposeField & XXXPurpose table

customer.save()
// if table contains personal data and no purpose -> error
// if personal data: Add entry in CustomersPurpose too



Customers.create({
	eMail: "alice@e.mail",
	postalAddress: "1234 Shippington",
	unfulfilledOrders: true
}, {for: "ORDER"})
Customer.purposes.create({
	name: "FULFILLMENT",
	allowedFields: ["postalAddress"],
	compatibleWith: ["ORDER"]
})
Customers.findAll({
	attributes: ['postalAddress'],
	where: { unfulfilledOrders: true },
	for: "FULFILLMENT"
})

Patients.findAll({
  attributes: ['name', 'disease'],
  where: { disease: 'Hepatitis'},
  for: "SENDING_WISHES"
});
*/
