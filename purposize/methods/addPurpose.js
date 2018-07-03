module.exports = async function(originalArgs, originalAddPurpose, tableEntry, purposizeTables) {
  const purpose = originalArgs['0']
  const purposeDAO = await purposizeTables.purposes.find({ where: { purpose: purpose }})
  const until = purposeDAO.retentionPeriod >= 0 ? Date.now() + purposeDAO.retentionPeriod*24*60*60*1000 : undefined
  const newArguments = [purposeDAO, { through: { until } } ]
  // await instance.addPurpose(purposeDAO, {
  //   through: { until }
  // })
  return originalAddPurpose.apply(tableEntry, newArguments)
}