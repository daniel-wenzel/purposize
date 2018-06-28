const sequelize = require('sequelize')
const Op = sequelize.Op

const extendTableEntries = require('../extendTableEntries')

module.exports = async function(originalArgs, originalFind, tableDAO, metaDataPurposeTable, purposizeTables) {
  // 1. Get a list of all attributes which can be accessed for purpose itself
  // 2. Check if where & select contains attributes that dont match the purpose
  // 3. If no attributes in select are set, insert all allowed attributes (compatible attributes + non personal data)
  // 4. Add list of compatible purposes to where clause
  
  const userQuery = originalArgs['0']
  const purposeName = userQuery.for

  // Check purpose validity if given
  let purposeInstance
  if (typeof purposeName === 'string') {
    purposeInstance = await purposizeTables.purposes.find({ where: { purpose: purposeName }})
    if (purposeInstance === null) {
      return sequelize.Promise.reject(new Error('Unknown purpose: ' + purposeName))
    }
  } else if (purposeName !== undefined) {
    // This only executes if purposeName is anything except string or undefined
    return sequelize.Promise.reject(new Error("Incorrect purpose format!"))
  }

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
    if (purposeName === undefined) {
      return sequelize.Promise.reject(new Error(`Please specify a purpose when querying for personal data fields such as "${illegalWhereField}"`))
    } else {
      return sequelize.Promise.reject(new Error(`Field "${illegalWhereField}" is incompatible with purpose(s): ${purposeName}`))
    }
  }

  // Check select clause
  const illegalSelectField = (userQuery.attributes || []).find( f => !allAllowedFields.includes(f) )
  if (illegalSelectField) {
    if (purposeName === undefined) {
      return sequelize.Promise.reject(new Error(`Please specify a purpose when querying for personal data fields such as "${illegalSelectField}"`))
    } else {
      return sequelize.Promise.reject(new Error(`Field "${illegalSelectField}" is incompatible with purpose(s): ${purposeName}`))
    }
  }
  
  // Step 3.
  if (userQuery.attributes === undefined) {
    userQuery.attributes = allAllowedFields
  }

  // Step 4.
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
      as: 'attachedPurposes'
    })
  }

  const tableEntries = await originalFind.apply(tableDAO, originalArgs)
  return tableEntries
}