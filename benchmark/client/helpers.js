const Faker = require('faker')

let currentUserId = 0

exports.createUsers = function(requestParams, context, ee, next) {
  const x = Math.random()
  if (x < 0.5) {
    requestParams.json = {
      eMail: Faker.internet.exampleEmail(),
      postalAddress: Faker.address.streetAddress(),
      favoriteNumber: Math.random()*100,
      unfulfilledOrders: Math.random()*5,
      purpose: ['ORDER', 'NEWSLETTER']
    }
  } else if (0.5 <= x && x < 0.8) {
    requestParams.json = {
      eMail: Faker.internet.exampleEmail(),
      // postalAddress: Faker.address.streetAddress(),
      favoriteNumber: Math.random()*100,
      unfulfilledOrders: Math.random()*5,
      purpose: ['NEWSLETTER']
    }
  } else {
    requestParams.json = {
      // eMail: Faker.internet.exampleEmail(),
      postalAddress: Faker.address.streetAddress(),
      favoriteNumber: Math.floor(Math.random()*100),
      unfulfilledOrders: Math.floor(Math.random()*5),
      purpose: 'FULFILLMENT'
    }
  }
  currentUserId++
  return next()
}

exports.findRandomUsers = function(requestParams, context, ee, next) {
  context.vars.id = Math.floor(Math.random()*currentUserId)
  const x = Math.random()
  if (x < 0.3) {
    requestParams.url += "?purpose=ORDER"
  } else if (0.3 <= x && x < 0.5) {
    requestParams.url += "?purpose=FULFILLMENT"
  } else if (0.5 <= x && x < 0.8) {
    requestParams.url += "?purpose=NEWSLETTER"
  }
  return next()
}

exports.findRandomMultipleUsers = function(requestParams, context, ee, next) {
  const x = Math.random()
  if (x < 0.3) {
    requestParams.url += "?purpose=ORDER"
  } else if (0.3 <= x && x < 0.5) {
    requestParams.url += "?purpose=FULFILLMENT"
  } else if (0.5 <= x && x < 0.8) {
    requestParams.url += "?purpose=NEWSLETTER"
  }
  return next()
}