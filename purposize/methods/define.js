const personalDataStorage = require("../personalDataStorage")
const extendTableDAO = require("../extendTableDAO")
const purposizeTablePrefix = "purposize_"
const Sequelize = require("sequelize")

module.exports = function(originalArgs, originalDefine, sequelize, purposizeTables) {
  const tableName = originalArgs['0']
  const fields = originalArgs['1']
  let containsPersonalData = false
  // Check if the fields contain personal data
  Object.keys(fields).forEach(fieldName => {
    const field = fields[fieldName]
    if (field.isPersonalData) {
      personalDataStorage.add(tableName, fieldName)
      containsPersonalData = true
    }
  })

  // Execute original define method
  const tableDAO = originalDefine.apply(sequelize, originalArgs);

  // When there is personal data, create metadata purpose table
  if (containsPersonalData) {
    const metaDataPurposeTable = sequelize.define(purposizeTablePrefix + tableName + "Purposes", {
      until: Sequelize.DATE
    })
    tableDAO.belongsToMany(purposizeTables.purpose, {
      through: metaDataPurposeTable,
      foreignKey: tableName + 'Id',
    }); 
    tableDAO.hasMany(metaDataPurposeTable, { 
      as: 'attachedPurposes',
      foreignKey: tableName + 'Id'
    })
    purposizeTables.purpose.belongsToMany(tableDAO, {
      through: metaDataPurposeTable,
      foreignKey: 'purpose',
    });

    // Store metadata table for later access
    purposizeTables.metaDataTables[tableName] = metaDataPurposeTable  

    // console.log(`Extending ${tableName}DAO...`)
    // Extend the DAO methods
    extendTableDAO(tableDAO, metaDataPurposeTable, purposizeTables)
    // console.log('Done!')
  }

  return tableDAO
}