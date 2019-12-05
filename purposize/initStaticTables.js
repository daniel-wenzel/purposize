const purposizeTablePrefix = "purposize_"
const Sequelize = require("sequelize")

module.exports = (sequelize) => {
  const tables = {}
  tables.purposes = sequelize.define(purposizeTablePrefix + 'purposes', {
    purpose: {
      type: Sequelize.STRING,
      primaryKey: true
    },
    retentionPeriod: {
      type: Sequelize.INTEGER,
      defaultValue: -1
    },
    loggingLevel: {
      type: Sequelize.STRING,
      defaultValue: 'NONE'
    }
  }, {
    getterMethods: {
      async transitiveCompatiblePurposes() {
        const allCompatiblePurposes = []
        let uncheckedPurposes = [this]
        while (uncheckedPurposes.length > 0) {
          const nextPurpose = uncheckedPurposes.splice(0,1)[0]
          // continue if the purpose is already in our list
          if (allCompatiblePurposes.find(p => p.purpose == nextPurpose.purpose)) continue
          allCompatiblePurposes.push(nextPurpose)
          uncheckedPurposes = uncheckedPurposes.concat(await nextPurpose.getCompatiblePurposes())
        }
        return allCompatiblePurposes
      }
    }
  })
  /*  tables.purposeCompatible = sequelize.define(purposizeTablePrefix + 'purposeCompatibleWith', {
      purpose: {
        type: Sequelize.STRING,
        primaryKey: true
      },
      compatiblePurpose: {
        type: Sequelize.STRING,
        primaryKey: true
      }
    })*/
  tables.purposes.belongsToMany(tables.purposes, {
    as: "CompatiblePurposes",
    through: purposizeTablePrefix + "compatiblePurposes",
    foreignKey: 'originalPurpose'
  })
  tables.purposes.belongsToMany(tables.purposes, {
    as: "CompatiblingPurposes",
    through: purposizeTablePrefix + "compatiblePurposes",
    foreignKey: 'compatiblePurpose'
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
