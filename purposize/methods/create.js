const sequelize = require('sequelize')

module.exports = async function(originalArgs, originalCreate, tableDAO, metaDataPurposeTable, purposizeTables) {

  const values = originalArgs['0']
  const options = originalArgs['1']

  const givenFields = Object.keys(values)

  // Get all sensitive values for this table
  let personalDataFields = await purposizeTables.personalDataFields.findAll({
    where: {
      tableName: tableDAO.tableName
    }
  })
  personalDataFields = personalDataFields.map(r => r.dataValues.fieldName)

  // Check if the given data fields contain personal data
  const sensitiveDataFields = [] // Filtering the personal data fields and store them here
  for (let i = 0, len = givenFields.length; i < len; i++) {
    const givenField = givenFields[i]
    if (personalDataFields.some(f => f === givenField)) {
      sensitiveDataFields.push(givenField)
    }
  }

  // If the given data fields do not contain any personal data execute original define
  if (sensitiveDataFields.length === 0) {
    return originalCreate.apply(tableDAO, originalArgs)
  }

  // Personal data was given as data fields
  // Now check if purpose was given and if they are compatible
  if (typeof options === 'undefined' || typeof options.purpose === 'undefined') {
    return sequelize.Promise.reject(new Error('Please specify a purpose when creating a new instance that contains personal data!'))
  }
  if (typeof options.purpose === 'string' || Array.isArray(options.purpose)) {
    // TODO:
    // 1. Check if values are allowed to be stored for the specified purpose (DONE)
    // 2. Store which fields are being stored for which purpose in metadata tables
    // Maybe more?

    const purposes = [].concat(options.purpose)

    const allPurposes = await purposizeTables.purpose.findAll().map(p => p.purpose)
    const unknownPurpose = purposes.find( p => !allPurposes.includes(p) )
    if (unknownPurpose !== undefined) {
      return sequelize.Promise.reject(new Error('Unknown purpose: ' + unknownPurpose))
    }

    // Get all fields that are allow for the specified purpose(s)
    const purposeResult = await purposizeTables.purposeDataFields.findAll({
      where: {
        purpose: purposes,
        tableName: tableDAO.tableName
      }
    })
    const allowedFields = purposeResult.map(p => p.fieldName)
    // Check if the given fields are
    for (let i = 0, len = sensitiveDataFields.length; i < len; i++) {
      const givenField = sensitiveDataFields[i]
      if (!allowedFields.some(f => f === givenField)) {
        return sequelize.Promise.reject(new Error(`Field "${givenField}" is incompatible with purpose(s): ${purposes.join(', ')}`))
      }
    }

    // Everything is legitimate -> Execute original define
    const instance = await originalCreate.apply(tableDAO, originalArgs)
    for (purpose of purposes) {
      const purposeDAO = await purposizeTables.purpose.find({ where: { purpose: purpose}})
      await instance.addPurpose(purposeDAO)
    }

    await instance.save()
  /*  // Store in metadata table for which purpose data is stored
    // TODO: Add 'until' field with date
    await metaDataPurposeTable.bulkCreate(purposes.map(purpose => {
      return {
        // until: new Date(),
        [tableDAO.tableName + 'Id']: instance.id,
        purpose
      }
    }))*/

    return instance
  } else {
    return sequelize.Promise.reject(new Error("Incorrect purpose format!"))
  }
}
