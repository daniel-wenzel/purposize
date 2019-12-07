const Sequelize = require('sequelize')

exports.modelName = 'customer'
exports.modelDefinition = {
  eMail: {
    type: Sequelize.STRING,
    isPersonalData: true
  },
  postalAddress: {
    type: Sequelize.STRING,
    isPersonalData: true
  },
  age: {
    type: Sequelize.INTEGER,
    isPersonalData: true
  },
  unfulfilledOrders: {
    type: Sequelize.INTEGER
  }
}
exports.personalDataFields = Object.keys(this.modelDefinition).reduce( (array, field) => {
  if (this.modelDefinition[field].isPersonalData) {
    array.push(field)
  }
  return array
}, [])