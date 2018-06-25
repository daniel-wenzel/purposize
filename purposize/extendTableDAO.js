const sequelize = require('sequelize')
const Op = sequelize.Op

const purposizeCreate = require('./methods/create')
const purposizeFindAll = require('./methods/findAll')
const purposizeFind = require('./methods/find')

module.exports = (tableDAO, metaDataPurposeTable, purposizeTables) => {

  const originalCreate = tableDAO.create
  tableDAO.create = async function() {
    return await purposizeCreate(arguments, originalCreate, tableDAO, metaDataPurposeTable, purposizeTables)
  }

  const originalFindAll = tableDAO.findAll
  tableDAO.findAll = async function() {
    return await purposizeFindAll(arguments, originalFindAll, tableDAO, metaDataPurposeTable, purposizeTables)
  }

  const originalFind = tableDAO.find
  tableDAO.find = async function() {
    return await purposizeFind(arguments, originalFind, tableDAO, metaDataPurposeTable, purposizeTables)
  }

}
