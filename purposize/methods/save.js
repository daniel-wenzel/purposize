const sequelize = require('sequelize')

// Save handles creation of new instances and updating existing instances
module.exports = async function(originalArgs, originalSave, tableEntry, purposizeTables) {
  const values = tableEntry.dataValues
  const options = originalArgs['0'] || {}

  const givenFields = Object.keys(values)
  // Get all sensitive values for this table
  let personalDataFields = await purposizeTables.personalDataFields.findAll({
    where: {
      tableName: tableEntry.constructor.tableName
    }
  }).map(r => r.fieldName)

  // Check if the given data fields contain personal data
  const sensitiveDataFields = [] // Filtering the personal data fields and store them here
  for (let i = 0, len = givenFields.length; i < len; i++) {
    const givenField = givenFields[i]
    if (personalDataFields.some(f => f === givenField)) {
      sensitiveDataFields.push(givenField)
    }
  }

  // If the given data fields do not contain any personal data execute original save
  if (sensitiveDataFields.length === 0) {
    return originalSave.apply(tableEntry, originalArgs)
  }

  // If this instance already exists in our db, it has pre-existing purposes
  let oldPurposes = await tableEntry.getPurposes().map(p => p.purpose)
  let newPurposes = []

  if (typeof options.purpose === 'string' || Array.isArray(options.purpose)) {
    // This is only executed when a new instance is created or 
    // an existing instance is updated but is given new additional purposes
    newPurposes = newPurposes.concat(options.purpose)
  } else if (options.purpose !== undefined) {
    return sequelize.Promise.reject(new Error("Incorrect purpose format!"))
  }
  
  const purposes = oldPurposes.concat(newPurposes) // all purposes for this given instance
  if (purposes.length == 0) {
    return sequelize.Promise.reject(new Error('Please specify a purpose when creating a new instance that contains personal data!'))
  }
  const allPurposes = await purposizeTables.purposes.findAll().map(p => p.purpose)
  const unknownPurpose = purposes.find( p => !allPurposes.includes(p) )
  if (unknownPurpose !== undefined) {
    return sequelize.Promise.reject(new Error('Unknown purpose: ' + unknownPurpose))
  }

  // Get all fields that are allow for the specified purpose(s)
  const allowedFields = await purposizeTables.purposeDataFields.findAll({
    where: {
      purpose: purposes,
      tableName: tableEntry.constructor.tableName
    }
  }).map(p => p.fieldName)

  // Check if the given fields are allowed
  for (let i = 0, len = sensitiveDataFields.length; i < len; i++) {
    const givenField = sensitiveDataFields[i]
    if (!allowedFields.some(f => f === givenField)) {
      return sequelize.Promise.reject(new Error(`Field "${givenField}" is incompatible with purpose(s): ${purposes.join(', ')}`))
    }
  }

  // Everything is legitimate -> Execute original save
  const instance = await originalSave.apply(tableEntry, originalArgs)

  // Store instance in metadatatable for every given purpose
  for (purpose of newPurposes) {
    await instance.addPurpose(purpose)
  }

  // TODO: Somehow filter only the values for the new allowed purpose
  // return instance

  // Implemented a workaround that you find the instance again but with no purpose to hide personal data
  const whereClause = {}
  Object.keys(instance.constructor.primaryKeys).forEach( k => whereClause[k] = instance[k] )
  // Get clean instance by finding the instance again but with no purpose => returns only non-personal data
  const cleanInstance = await instance.constructor.find({
    where: whereClause
  })

  return cleanInstance
}