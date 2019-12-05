const sequelize = require('sequelize')
const log = require('../log')

module.exports = async function(originalArgs, originalAddPurpose, tableEntry, purposizeTables, options) {
  const purpose = originalArgs['0']

  if (typeof purpose !== 'string' || purpose === '') {
    return sequelize.Promise.reject(new Error(`Please specify a purpose string`))
  }

  const purposeDAO = typeof purpose === 'string' ?
    await purposizeTables.purposes.find({ where: { purpose: purpose }}) : purpose

  if (purposeDAO === null) {
    return sequelize.Promise.reject(new Error(`Unknown purpose: ${purpose}`))
  }

  const until = purposeDAO.retentionPeriod >= 0 ? Date.now() + purposeDAO.retentionPeriod*24*60*60*1000 : undefined

  const loggingTriggers = ['CHANGE', 'ALL']
  if (loggingTriggers.includes(purposeDAO.loggingLevel) && options.logging) {
    log(tableEntry, purposeDAO.purpose, 'addPurpose', options.logFunction)
  }

  const newArguments = [purposeDAO, { through: { until } } ]
  return originalAddPurpose.apply(tableEntry, newArguments)
}
