const sequelize = require('sequelize')

// Save handles creation of new instances and updating existing instances
module.exports = async function(originalArgs, originalSave, tableEntry, purposizeTables) {
  const values = tableEntry.dataValues
  const options = originalArgs['0'] || {}

  const tableName = tableEntry.constructor.tableName
  const modifiedFields = Object.keys(tableEntry._changed)

  // Get all sensitive values for this table
  let personalDataFields = await purposizeTables.personalDataFields.findAll({
    where: {
      tableName
    }
  })

  // Check if the modified data fields contain personal data
  const sensitiveDataFields = [] // Filtering the personal data fields and store them here
  for (let i = 0, len = modifiedFields.length; i < len; i++) {
    const mf = modifiedFields[i]
    const isSensitive = personalDataFields.map(r => r.fieldName).indexOf(mf) !== -1
    if (isSensitive && values[mf] !== null) {
      sensitiveDataFields.push(mf)
    }
  }

  // If the given data fields do not contain any personal data execute original save
  if (sensitiveDataFields.length === 0) {
    return originalSave.apply(tableEntry, originalArgs)
  }

  // If this instance already exists in our db, it has pre-existing purposes
  let givenPurposes = []

  if (typeof options.purpose === 'string' || Array.isArray(options.purpose)) {
    // This is only executed when a new instance is created or
    // an existing instance is updated but is given new additional purposes
    givenPurposes = givenPurposes.concat(options.purpose)
  } else if (options.purpose !== undefined) {
    return sequelize.Promise.reject(new Error("Incorrect purpose format!"))
  }

  // const purposes = oldPurposes.concat(givenPurposes) // all purposes for this given instance
  if (givenPurposes.length == 0) {
    return sequelize.Promise.reject(new Error('Please specify a purpose when creating or modifying an instance that contains personal data!'))
  }

  const purposeDataFields = await purposizeTables.purposeDataFields.findAll({
    where: {
      tableName,
      purpose: givenPurposes,
    }
  })

  const allPurposes = new Set(purposeDataFields.map(x => x.purpose))
  const unknownPurpose = givenPurposes.find( p => !allPurposes.has(p) )
  if (unknownPurpose !== undefined) {
    return sequelize.Promise.reject(new Error('Unknown purpose: ' + unknownPurpose))
  }

  // Get all fields that are allow for the specified purpose(s)
  const allowedFields = new Set(purposeDataFields.map(p => p.fieldName))

  // Check if the given fields are allowed
  for (let i = 0, len = sensitiveDataFields.length; i < len; i++) {
    const givenField = sensitiveDataFields[i]
    if (!allowedFields.has(givenField)) {
      return sequelize.Promise.reject(new Error(`Field "${givenField}" in table "${tableName}" is incompatible with purpose(s): ${givenPurposes.join(', ')}`))
    }
  }

  // Everything is legitimate -> Execute original save
  const instance = await originalSave.apply(tableEntry, originalArgs)

  // Store instance in metadatatable for every new purpose
  for (let purpose of givenPurposes) {
    await instance.addPurpose(purpose)
  }

  // Filter all personal data values that are not allowed for the given purposes to prevent any data leakage
  const illegalFields = personalDataFields.reduce((illegalFields, f) => {
    if (!allowedFields.has(f.fieldName)) {
      illegalFields.push(f.fieldName)
    }
    return illegalFields
  }, [])

  illegalFields.forEach( f => { 
    if (instance[f]) delete instance.dataValues[f] 
  })

  return instance
}
