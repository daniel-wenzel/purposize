const sequelize = require('sequelize')
const Op = sequelize.Op

const purposizeCreate = require('./methods/create')
const purposizeFindAll = require('./methods/findAll')

module.exports = (tableDAO, metaDataPurposeTable, purposizeTables) => {

  const originalCreate = tableDAO.create
  tableDAO.create = async function() {
    return await purposizeCreate(arguments, originalCreate, tableDAO, metaDataPurposeTable, purposizeTables)
  }

  const originalFindAll = tableDAO.findAll
  tableDAO.findAll = async function() {
    return await purposizeFindAll(arguments, originalFindAll, tableDAO, metaDataPurposeTable, purposizeTables)
  }

}
