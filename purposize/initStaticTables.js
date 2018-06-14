const purposizeTablePrefix = "purposize_"
const Sequelize = require("sequelize")
module.exports = (sequelize) => {
  const tables = {}
  tables.purpose = sequelize.define(purposizeTablePrefix + 'purpose', {
    purpose: {
      type: Sequelize.STRING,
      primaryKey: true
    },
    retentionPeriod: {
      type: Sequelize.INTEGER
    }
  })
  tables.personalDataFields = sequelize.define(purposizeTablePrefix + 'personalDataFields', {
    tableName: {
      type: Sequelize.STRING,
      primaryKey: true
    },
    fieldName: {
      type: Sequelize.STRING,
      primaryKey: true
    }
  })

  const purposeDataFieldsName = purposizeTablePrefix + 'purposeDataFields'
  tables.purposeDataFields = sequelize.define(purposeDataFieldsName, {
    purpose: {
      type: Sequelize.STRING,
      primaryKey: true
    },
    tableName: {
      type: Sequelize.STRING,
      primaryKey: true
    },
    fieldName: {
      type: Sequelize.STRING,
      primaryKey: true
    },
  })

  return tables
}
