const sequelize = require('sequelize')

module.exports = (tableDAO, metaDataTable, purposizeTables) => {

  tableDAO.hook('beforeCreate', async (values, options) => {
    if (typeof options === 'undefined' || typeof options.purpose === 'undefined') {
      return sequelize.Promise.reject(new Error('Please specify a purpose when creating a new instance!'))
    }
    if (typeof options.purpose === 'string' || Array.isArray(options.purpose)) {
      // TODO: 
      // 1. Check if values are allowed to be stored for the specified purpose
      // 2. Store which fields are being stored for which purpose in metadata tables
      // Maybe more?
    } else {
      return sequelize.Promise.reject(new Error("Incorrect purpose format!"))
    }

  })
}