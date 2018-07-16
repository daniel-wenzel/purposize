const Sequelize = require('sequelize');
const purposize = require('./purposize/index.js')

const sequelize = new Sequelize('testdb', 'root', '123456', {
  host: 'localhost',
  dialect: 'mysql',
  logging: false // Prevent sequelize from logging all SQL queries
});
purposize.init(sequelize, {
  // logging: false
})

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
    unfulfilledOrders: 2
  }, {
    purpose: 'ORDER'
  })

  const bob = await Customer.create({
    eMail: "bob@email.com",
    postalAddress: "1234 Loltown",
    unfulfilledOrders: 2
  }, {
    purpose: ['ORDER', 'NEWSLETTER']
  })

  // console.log(alice.dataValues)

}

run()