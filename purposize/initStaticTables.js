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

  tables.compatiblePurposes = sequelize.define(purposizeTablePrefix + "compatiblePurposes", {
    // Properties are filled by association
  }, {
    tableName: purposizeTablePrefix + "compatible_purposes"
  })
  tables.purposes.belongsToMany(tables.purposes, {
    as: "CompatiblePurposes",
    through: tables.compatiblePurposes,
    foreignKey: "originalPurpose",
    otherKey: "compatiblePurpose"
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
  }, { 
    tableName: purposizeTablePrefix + "personal_data_fields"
  })

  tables.purposeDataFields = sequelize.define(purposizeTablePrefix + 'purposeDataFields', {
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
  }, { 
    tableName: purposizeTablePrefix + "purpose_data_fields"
  })

  return tables
}
