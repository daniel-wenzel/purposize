const sequelize = require('sequelize')
const Op = sequelize.Op

module.exports = (tableDAO, metaDataPurposeTable, purposizeTables) => {

  const originalCreate = tableDAO.create
  tableDAO.create = async function() {
    const values = arguments['0']
    const options = arguments['1']

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
      return originalCreate.apply(this, arguments)
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
      const instance = await originalCreate.apply(this, arguments)
      // Store in metadata table for which purpose data is stored
      // TODO: Add 'until' field with date
      await metaDataPurposeTable.bulkCreate(purposes.map(purpose => {
        return {
          // until: new Date(),
          [tableDAO.tableName + 'Id']: instance.id,
          purpose
        }
      }))

      return instance
    } else {
      return sequelize.Promise.reject(new Error("Incorrect purpose format!"))
    }
  }


  const originalFindAll = tableDAO.findAll
  tableDAO.findAll = async function() {
    const userQuery = arguments['0']
    const purposeName = userQuery.for
    console.log(purposeName)
    // Step 1.
    const allPersonalDataFields = await purposizeTables.personalDataFields.findAll({
      where: {
        tableName: tableDAO.tableName
      }
    }).map( r => r.fieldName )

    nonPersonalDataFields = Object.keys(tableDAO.attributes).filter(f => !allPersonalDataFields.includes(f))
    
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

    // Step 2.
    // Check where clause
    const illegalWhereField = Object.keys(userQuery.where || {}).find( f => !allAllowedFields.includes(f) )
    if (illegalWhereField) {
      return sequelize.Promise.reject(new Error(`Field "${illegalWhereField}" is incompatible with purpose(s): ${purposeName}`))
    }

    // Check select clause
    const illegalSelectField = (userQuery.attributes || []).find( f => !allAllowedFields.includes(f) )
    if (illegalSelectField) {
      return sequelize.Promise.reject(new Error(`Field "${illegalSelectField}" is incompatible with purpose(s): ${purposeName}`))
    }
    
    // Step 3.
    if (userQuery.attributes === undefined) {
      userQuery.attributes = allAllowedFields
    }

    // Step 4.
    if (typeof purposeName === 'string') {
      const purpose = await purposizeTables.purpose.find({ where: { purpose: purposeName}})
      if (purpose === null) {
        return sequelize.Promise.reject(new Error('Unknown purpose: ' + purposeName))
      }
      const allPossiblePurposes = await purpose.transitiveCompatiblePurposes
      userQuery.include = userQuery.include || []
      userQuery.include.push({
        model: metaDataPurposeTable,
        where: {
          purpose: {
            [Op.or]: allPossiblePurposes.map( p => p.purpose )
          }
        },
        as: 'attachedPurposes'
      })
    }
    // 1. get a list of all attributes which can be accessed for purpose itself
    // 2. check if where & select contains attributes that dont match the purpose
    // 3. if no attributes in select are set, insert all allowed attributes (compatible attributes + non personal data)
    // 4. Add list of compatible purposes to where clause

    return originalFindAll.apply(this, arguments)
  }

}
