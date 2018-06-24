const Sequelize = require('sequelize')

exports.tableName = 'customers'
exports.tableDefinition = {
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
exports.personalDataFields = Object.keys(this.tableDefinition).reduce( (array, field) => {
  if (this.tableDefinition[field].isPersonalData) {
    array.push(field)
  }
  return array
}, [])