const Sequelize = require("sequelize")
const Op = Sequelize.Op

const personalDataStorage = require("../personalDataStorage")
const extendTableDAO = require("../extendTableDAO")
const purposizeTablePrefix = "purposize_"

module.exports = function(originalArgs, originalDefine, sequelize, purposizeTables, options) {
  // Execute original define method
  const tableDAO = originalDefine.apply(sequelize, originalArgs);
  
  const tableName = tableDAO.tableName
  const modelName = tableDAO.name
  const fields = originalArgs['1']
  let containsPersonalData = false

  // console.log(Object.getOwnPropertyNames(tableDAO))
  // console.log(tableDAO.tableName)

  // Check if the fields contain personal data
  Object.keys(fields).forEach(fieldName => {
    const field = fields[fieldName]
    if (field.isPersonalData) {
      personalDataStorage.add(tableName, fieldName)
      containsPersonalData = true
    }
  })

  // When there is personal data, create metadata purpose table
  if (containsPersonalData) {
    const metaDataPurposeTable = sequelize.define(purposizeTablePrefix + tableName + "Purposes", {
      until: Sequelize.DATE
    }, {
      tableName: purposizeTablePrefix + tableName + "_purposes"
    })
    tableDAO.belongsToMany(purposizeTables.purposes, {
      through: metaDataPurposeTable,
      as: 'Purposes',
      foreignKey: modelName + 'Id',
    });
    tableDAO.hasMany(metaDataPurposeTable, {
      as: 'attachedPurposes',
      foreignKey: modelName + 'Id'
    })
    purposizeTables.purposes.belongsToMany(tableDAO, {
      through: metaDataPurposeTable,
      foreignKey: 'purpose',
    });

    // Store metadata table for later access
    purposizeTables.metaDataTables[tableName] = metaDataPurposeTable

    // console.log(`Extending ${tableName}DAO...`)
    // Extend the DAO methods
    extendTableDAO(tableDAO, metaDataPurposeTable, purposizeTables, options)
    // console.log('Done!')

    // Check in a given interval (default 6 hours) which data fields have an outdated retention period
    // Delete all outdated purposes and the unnecessary data fields
    setInterval(async () => {
      console.log('Checking for outdated purposes')
      const result = await tableDAO.findAll({
        include: [
          {
            model: metaDataPurposeTable,
            where: {
              until: {
                [Op.lt]: Date.now()
              }
            },
            as: 'attachedPurposes'
          }
        ]
      })
      for (let tableEntry of result) {
        for (let attachedPurpose of tableEntry.attachedPurposes) {
          await tableEntry.removePurpose(attachedPurpose.purpose)
        }
      }
    }, options.deletionCheckInterval ) // Default: runs every 6 hours

  }

  return tableDAO
}
