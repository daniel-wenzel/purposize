const sequelize = require('sequelize')
const log = require('../log')
const cachedFindAll = require("../cacheSequelizeQuery").findAll

module.exports = async function(originalArgs, originalRemovePurpose, tableEntry, purposizeTables, options) {
  // console.log("hook works")
  // Execute original removePurpose function
  const toBeRemovedPurpose = originalArgs['0']
  if (typeof toBeRemovedPurpose !== 'string' || toBeRemovedPurpose === '') {
    return sequelize.Promise.reject(new Error(`Please specify a purpose string`))
  }

  const result = await originalRemovePurpose.apply(tableEntry, originalArgs)

  // Get all sensitive values for this table
  let personalDataFields = await cachedFindAll(purposizeTables.personalDataFields, {
    where: {
      tableName: tableEntry.constructor.tableName
    }
  })
  personalDataFields = personalDataFields.map(r => r.fieldName)
  // console.log(personalDataFields)

  // Remaining purposes that are stored for this instance after purpose removal in the beginning
  const remainingPurposes = (await tableEntry.getPurposes()).map(p => p.purpose)
  // console.log(remainingPurposes)

  // Get all fields that are allow for the remaining purposes
  // TODO: add cache
  const purposeResult = await cachedFindAll(purposizeTables.purposeDataFields, {
    where: {
      purpose: remainingPurposes,
      tableName: tableEntry.constructor.tableName
    }
  })
  const allowedFields = purposeResult.map(p => p.fieldName)
  // console.log(allowedFields)

  const illegalFields = personalDataFields.filter( f => !allowedFields.includes(f) )
  // console.log(illegalFields)

  const updateStatement = {}
  illegalFields.forEach(i => {
    updateStatement[i] = null
  })
  // console.log(updateStatement)
  await tableEntry.update(updateStatement)

  const purposeDAO = typeof purpose === 'string' ?
    await cachedFindAll(purposizeTables.purposes, { where: { purpose: toBeRemovedPurpose }}, {single: true}) : toBeRemovedPurpose
  if (purposeDAO === null) {
    return sequelize.Promise.reject(new Error(`Unknown purpose: ${toBeRemovedPurpose}`))
  }
  const loggingTriggers = ['CHANGE', 'ALL']
  if (loggingTriggers.includes(purposeDAO.loggingLevel) && options.logging) {
    log(tableEntry, purposeDAO.purpose, 'removePurpose', options.logFunction)
  }

  return result
}
