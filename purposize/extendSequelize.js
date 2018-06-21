const personalDataStorage = require("./personalDataStorage")
const extendTableDAO = require("./extendTableDAO")
const purposizeTablePrefix = "purposize_"
const Sequelize = require("sequelize")
module.exports = (sequelize, purposizeTables) => {
  const originalDefine = sequelize.define
  const originalSync = sequelize.sync

  sequelize.define = function() {
    const tableName = arguments['0']
    const fields = arguments['1']
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
    const tableDAO = originalDefine.apply(this, arguments);

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
  };
  
  sequelize.sync = async function() {
    await originalSync.apply(this, arguments)
    await personalDataStorage.flushToDB(purposizeTables.personalDataFields)
  }
}
