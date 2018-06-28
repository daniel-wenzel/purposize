const extendTableEntries = require('./extendTableEntries')
const purposizeFindAll = require('./methods/findAll')

module.exports = (tableDAO, metaDataPurposeTable, purposizeTables) => {

  // FindAll is called by sequelize for find and findAll
  const originalFindAll = tableDAO.findAll
  tableDAO.findAll = async function() {
    return await purposizeFindAll(arguments, originalFindAll, tableDAO, metaDataPurposeTable, purposizeTables)
  }

  const originalBuild = tableDAO.build
  tableDAO.build = function() {
    originalBuild.apply(tableDAO, arguments)
    const result = originalBuild.apply(tableDAO, arguments)
    extendTableEntries(result, purposizeTables)
    return result
  }

}
