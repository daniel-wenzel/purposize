module.exports = (instances, purpose, source, logFunction) => {
  instances = [].concat(instances)
  instances.forEach( i => {
    const primaryKeys = Object.keys(i.constructor.primaryKeys).map( k => `${k}=${i[k]}` )
    let logEntry = `Instance[${primaryKeys.join(', ')}] from ${i.constructor.tableName}: `
    switch (source) {
      case 'findAll':
        logEntry += `Access for purpose "${purpose}" on ${new Date()}`
        break;
      case 'addPurpose':
        logEntry += `Purpose "${purpose}" was added on ${new Date()}`
        break;
      case 'removePurpose':
        logEntry += `Purpose "${purpose}" was removed on ${new Date()}`
        break;
      default:
        break;
    }
    logFunction(logEntry)
  })
}