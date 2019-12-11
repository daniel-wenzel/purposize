const Sequelize = require("sequelize")

const cache = require("./cache")

const purposizeTablePrefix = "purposize_"

module.exports = (sequelize, options) => {
  const tables = {}
  tables.purposes = sequelize.define(purposizeTablePrefix + 'purposes', {
    purpose: {
      type: Sequelize.STRING,
      primaryKey: true
    },
    retentionPeriod: {
      type: Sequelize.INTEGER,
      defaultValue: -1,
    },
    loggingLevel: {
      type: Sequelize.STRING,
      defaultValue: 'NONE',
    }
  }, {
    getterMethods: {
      async transitiveCompatiblePurposes() {
        const allCompatiblePurposes = []

        if (options.cache) {
          const compatiblePurposes = cache.get("compatiblePurposes")
          let uncheckedPurposes = [this.purpose]
          while (uncheckedPurposes.length > 0) {
            const nextPurpose = uncheckedPurposes.pop()
            // continue if the purpose is already in our list
            if (allCompatiblePurposes.includes(p => p == nextPurpose)) continue
            allCompatiblePurposes.push(nextPurpose)

            if (compatiblePurposes[nextPurpose]) {
              uncheckedPurposes = uncheckedPurposes.concat(compatiblePurposes[nextPurpose])
            }
          }
        } else {
          let uncheckedPurposes = [this]
          while (uncheckedPurposes.length > 0) {
            const nextPurpose = uncheckedPurposes.pop()
            // continue if the purpose is already in our list
            if (allCompatiblePurposes.find(p => p == nextPurpose.purpose)) continue
            allCompatiblePurposes.push(nextPurpose.purpose)
            uncheckedPurposes = uncheckedPurposes.concat(await nextPurpose.getCompatiblePurposes())
          }
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
    foreignKey: "original_purpose",
    otherKey: "compatible_purpose"
  })


  tables.personalDataFields = sequelize.define(purposizeTablePrefix + 'personalDataFields', {
    fieldName: {
      type: Sequelize.STRING,
    },
    tableName: {
      type: Sequelize.STRING,
    },
  }, { 
    tableName: purposizeTablePrefix + "personal_data_fields"
  })

  tables.purposeDataFields = sequelize.define(purposizeTablePrefix + 'purposeDataFields', {
    tableName: {
      type: Sequelize.STRING,
    },
    fieldName: {
      type: Sequelize.STRING,
    },
  }, { 
    tableName: purposizeTablePrefix + "purpose_data_fields"
  })

  
  
  tables.purposeDataFields.belongsTo(tables.personalDataFields, {
    foreignKey: "personalDataFieldId",
  })
  tables.personalDataFields.hasMany(tables.purposeDataFields, {
    foreignKey: "personalDataFieldId",
  })

  tables.purposeDataFields.belongsTo(tables.purposes, {
    foreignKey: "purpose",
  })
  tables.purposes.hasMany(tables.purposeDataFields, {
    foreignKey: "purpose",
  })

  return tables
}
