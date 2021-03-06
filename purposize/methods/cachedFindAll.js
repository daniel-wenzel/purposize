const sequelize = require('sequelize')
const Op = sequelize.Op

const log = require('../log')
const cache = require("../cache")

module.exports = async function(originalArgs, originalFind, tableDAO, metaDataPurposeTable, purposizeTables, options) {
  // 1. Get a list of all attributes which can be accessed for purpose itself
  // 2. Check if where & select contains attributes that dont match the purpose
  // 3. If no attributes in select are set, insert all allowed attributes (compatible attributes + non personal data)
  // 4. Add list of compatible purposes to where clause

  const userQuery = originalArgs['0'] || {}
  const purposeName = userQuery.purpose

  const personalDataFields = cache.get("personalDataFields")
  const purposeDataFieldCollection = cache.get("purposeDataFields")
  // Filter to circumvent possile mistakes in yaml file
  const purposeDataFields = purposeDataFieldCollection.filter(f => {
    return personalDataFields.some(pf => {
      return f.tableName === tableDAO.tableName && f.fieldName === pf.fieldName
    })
  })
  
  // Check purpose validity if given
  if (typeof purposeName === 'string') {
    const isLegitPurpose = purposeDataFields.some(f => f.purpose === purposeName)
    if (!isLegitPurpose) {
      return sequelize.Promise.reject(new Error('Unknown purpose: ' + purposeName))
    } 
  } else if (purposeName !== undefined) {
    // This only executes if purposeName is anything except string or undefined
    return sequelize.Promise.reject(new Error("Incorrect purpose format!"))
  }

  // Step 1: Get a list of all attributes which can be accessed for purpose itself
  const allPersonalDataFields = purposeDataFields.map( r => r.fieldName )

  const nonPersonalDataFields = Object.keys(tableDAO.tableAttributes).filter(f => !allPersonalDataFields.includes(f))

  let allowedPersonalDataFields = []
  if (typeof purposeName === 'string') {
    allowedPersonalDataFields = purposeDataFields.filter(f => f.purpose === purposeName).map(f => f.fieldName)
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
    const allPossiblePurposes = cache.getCompatiblePurposes(purposeName)

    userQuery.include = userQuery.include || []
    userQuery.include.push({
      model: metaDataPurposeTable,
      where: {
        purpose: {
          [Op.or]: allPossiblePurposes
        }
      },
      as: 'attachedPurposes',
      attributes: []
    })
  }

  const tableEntries = await originalFind.apply(tableDAO, originalArgs)

  if (typeof purposeName === "string") {
    const loggingTriggers = ['ACCESS', 'ALL']
    const { loggingLevel } = cache.get("purposes")[purposeName]
    if (
      typeof purposeName === 'string' &&
      tableEntries !== null &&
      loggingTriggers.includes(loggingLevel) &&
      options.logging
    ) {
      log(tableEntries, purposeName, 'findAll', options.logFunction)
    }
  }
  

  return tableEntries
}
