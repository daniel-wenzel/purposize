const sequelize = require('sequelize')
const Op = sequelize.Op

const log = require('../log')

module.exports = async function(originalArgs, originalFind, tableDAO, metaDataPurposeTable, purposizeTables, options) {
  // 1. Get a list of all attributes which can be accessed for purpose itself
  // 2. Check if where & select contains attributes that dont match the purpose
  // 3. If no attributes in select are set, insert all allowed attributes (compatible attributes + non personal data)
  // 4. Add list of compatible purposes to where clause

  const userQuery = originalArgs['0'] || {}
  const purposeName = userQuery.purpose

  // Check purpose validity if given
  let purposeInstance
  if (typeof purposeName === 'string') {
    purposeInstance = await purposizeTables.purposes.findOne({ where: { purpose: purposeName }})
    if (purposeInstance === null) {
      return sequelize.Promise.reject(new Error('Unknown purpose: ' + purposeName))
    }
  } else if (purposeName !== undefined) {
    // This only executes if purposeName is anything except string or undefined
    return sequelize.Promise.reject(new Error("Incorrect purpose format!"))
  }

  // Step 1: Get a list of all attributes which can be accessed for purpose itself
  const allPersonalDataFields = await purposizeTables.personalDataFields.findAll({ where: {
    tableName: tableDAO.tableName
  }}).map( r => r.fieldName )

  const nonPersonalDataFields = Object.keys(tableDAO.tableAttributes).filter(f => !allPersonalDataFields.includes(f))

  let allowedPersonalDataFields = []
  if (typeof purposeName === 'string') {
    allowedPersonalDataFields = await purposizeTables.purposeDataFields.findAll({
      where: {
        purpose: purposeName,
        tableName: tableDAO.tableName
      }
    }).map( r => r.fieldName )
  }
  const allAllowedFields = nonPersonalDataFields.concat(allowedPersonalDataFields)

  // Step 2: Check if where & select contains attributes that dont match the purpose
  // Check where clause
  const illegalWhereField = Object.keys(userQuery.where || {}).find( f => !allAllowedFields.includes(f) )
  if (illegalWhereField) {
    if (purposeName === undefined) {
      return sequelize.Promise.reject(new Error(`Please specify a purpose when querying for personal data fields such as "${illegalWhereField}"`))
    } else {
      return sequelize.Promise.reject(new Error(`Field "${illegalWhereField}" is incompatible with purpose(s): ${purposeName}`))
    }
  }

  // Check select clause
  if (userQuery.attributes !== undefined) {
    // Helper function
    const checkSelectArray = (selectArray) => {
      let illegalSelectField = selectArray.find( f => {
        if (Array.isArray(f)) {
          // Array structure might be used for renaming attributes
          return !allAllowedFields.includes(f[0])
        } else {
          return !allAllowedFields.includes(f)
        }
      })

      if (illegalSelectField) {
        if (purposeName === undefined) {
          selectError = new Error(`Please specify a purpose when querying for personal data fields such as "${illegalSelectField}"`)
        } else {
          selectError = new Error(`Field "${illegalSelectField}" is incompatible with purpose(s): ${purposeName}`)
        }
      }
    }

    let selectError

    // Select clause is given as an array
    if (Array.isArray(userQuery.attributes)) {
      if (userQuery.attributes !== 0) {
        checkSelectArray(userQuery.attributes)
        if (selectError) {
          return sequelize.Promise.reject(selectError)
        }
      }
    }
    
    // Select clause is given as an object
    if (typeof userQuery.attributes === "object") {
      // Exclude all fields that are not allowed by given purpose
      const excludeFields = allPersonalDataFields.reduce((excludeFields, f) => {
        if (!allAllowedFields.includes(f)) {
          excludeFields.push(f)
        }
        return excludeFields
      }, [])

      if (userQuery.attributes.include) {
        checkSelectArray(userQuery.attributes.include)
        if (selectError) {
          return sequelize.Promise.reject(selectError)
        }
      } 
      
      // If user has given exclude array extend it. If not set the exclude array
      if (userQuery.attributes.exclude) {
        userQuery.attributes.exclude = userQuery.attributes.exclude.concat(excludeFields)
      } else {
        userQuery.attributes.exclude = excludeFields
      }
    }
  } else {
    // Step 3: If no attributes in select are set, insert all allowed attributes (compatible attributes + non personal data)
    userQuery.attributes = allAllowedFields
  }

  // Step 4: Add list of compatible purposes to where clause
  if (typeof purposeName === 'string') {
    const allPossiblePurposes = await purposeInstance.transitiveCompatiblePurposes
    userQuery.include = userQuery.include || []
    userQuery.include.push({
      model: metaDataPurposeTable,
      where: {
        purpose: {
          [Op.or]: allPossiblePurposes.map( p => p.purpose )
        }
      },
      as: 'attachedPurposes',
      attributes: []
    })
  }

  const tableEntries = await originalFind.apply(tableDAO, originalArgs)

  const loggingTriggers = ['ACCESS', 'ALL']
  if (
    typeof purposeName === 'string' &&
    tableEntries !== null &&
    loggingTriggers.includes(purposeInstance.loggingLevel) &&
    options.logging
  ) {
    log(tableEntries, purposeName, 'findAll', options.logFunction)
  }

  return tableEntries
}
