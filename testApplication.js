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

  const bob = await Customer.create({
    eMail: "bob@email.com",
    postalAddress: "1234 Buytown",
    // age: 34
  }, {
    // purpose: 'ORDER'
    purpose: ['ORDER', 'NEWSLETTER']
  })

  const carl = await Customer.create({
    eMail: "carl@email.com",
    // postalAddress: "1234 Cheapcity",
    unfulfilledOrders: 3,
  }, {
    purpose: 'NEWSLETTER'
  })

  carl.addPurpose('ORDER')
  // await carl.addPurpose('ORDER', {
  //   through: { until }
  // })

  // console.log('########################################')

  // const a = await carl.update({
  //   postalAddress: "1234 Loltown"
  // }, {
  //   purpose: 'FULFILLMENT'
  // })

  // carl.postalAddress = "1234 Loltown"
  // const a = await carl.save({ purpose: 'FULFILLMENT' })

  // console.log(a.dataValues)

  // await bob.update({
  //   eMail: 'bobby@email.bob'
  // })


  const result = await Customer.findAll({
    for: 'ORDER'
  })



  // console.log(c.dataValues)



  // console.log((await Customer.findAll({
  //   for: "NEWSLETTER",
  // })).map(c =>c.dataValues))



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
