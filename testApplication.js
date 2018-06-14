const Sequelize = require('sequelize');
const purposize = require('./purposize/index.js')

const sequelize = new Sequelize('testdb', 'root', '123456', {
  host: 'localhost',
  dialect: 'mysql',
  logging: false
});
purposize.init(sequelize)


async function run() {
  const Customer = sequelize.define('customer', {
    eMail: {
      type: Sequelize.STRING,
      personalData: true
    },
    postalAddress: {
      type: Sequelize.STRING,
      personalData: true
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
    postalAddress: "1234 Shoppington"
  })

  console.log(alice.toJSON())

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
