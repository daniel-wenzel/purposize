const sequelize = require('sequelize')
const Op = sequelize.Op

module.exports = async function(originalArgs, originalFindAll, tableDAO, metaDataPurposeTable, purposizeTables) {
  // 1. Get a list of all attributes which can be accessed for purpose itself
  // 2. Check if where & select contains attributes that dont match the purpose
  // 3. If no attributes in select are set, insert all allowed attributes (compatible attributes + non personal data)
  // 4. Add list of compatible purposes to where clause
  
  const userQuery = originalArgs['0']
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
  return originalFindAll.apply(tableDAO, originalArgs)
}