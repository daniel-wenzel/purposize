const personalDataStorage = require("./personalDataStorage")
const purposizeTablePrefix = "purposize_"
const Sequelize = require("sequelize")
module.exports = (sequelize, purposizeTables) => {
  const originalDefine = sequelize.define
  const originalSync = sequelize.sync

  sequelize.define = function() {
    const tableName = arguments['0']
    const fields = arguments['1']
    let containsPersonalData = false
    Object.keys(fields).forEach(fieldName => {
      const field = fields[fieldName]
      if (field.personalData) {
        personalDataStorage.add(tableName, fieldName)
        containsPersonalData = true
      }
    })
    const result = originalDefine.apply(this, arguments);

    // Create metadata purpose table
    if (containsPersonalData) {
      const resultPurposeTable = sequelize.define(purposizeTablePrefix + tableName + "Purposes", {
        until: Sequelize.DATE
      })
      result.belongsToMany(purposizeTables.purpose, {
        through: purposizeTablePrefix + tableName + "Purposes"
      });
      purposizeTables.purpose.belongsToMany(result, {
        through: purposizeTablePrefix + tableName + "Purposes"
      });

      purposizeTables.metaDataTables[tableName] = resultPurposeTable
    }
    return result
  };
  sequelize.sync = async function() {
    await originalSync.apply(this, arguments)
    await personalDataStorage.flushToDB(purposizeTables.personalDataFields)
  }
}
