const extendTableEntries = require('./extendTableEntries')
const purposizeFindAll = require('./methods/findAll')

module.exports = (tableDAO, metaDataPurposeTable, purposizeTables, options) => {

  // FindAll is called by sequelize for find and findAll
  const originalFindAll = tableDAO.findAll
  tableDAO.findAll = async function() {
    return await purposizeFindAll(arguments, originalFindAll, tableDAO, metaDataPurposeTable, purposizeTables, options)
  }

  const originalBuild = tableDAO.build
  tableDAO.build = function() {
    const result = originalBuild.apply(tableDAO, arguments)
    extendTableEntries(result, purposizeTables, options)
    return result
  }

}
