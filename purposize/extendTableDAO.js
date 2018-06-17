const sequelize = require('sequelize')

module.exports = (tableDAO, metaDataTable, purposizeTables) => {

  const originalCreate = tableDAO.create 
  tableDAO.create = async function() {
    const values = arguments['0']
    const options = arguments['1']
    if (typeof options === 'undefined' || typeof options.purpose === 'undefined') {
      return sequelize.Promise.reject(new Error('Please specify a purpose when creating a new instance!'))
    }
    if (typeof options.purpose === 'string' || Array.isArray(options.purpose)) {
      // TODO: 
      // 1. Check if values are allowed to be stored for the specified purpose (DONE)
      // 2. Store which fields are being stored for which purpose in metadata tables
      // Maybe more?

      const purposes = [].concat(options.purpose) 
      console.log(purposes) 

      // Get all fields that are allow for the specified purpose(s)
      const purposeResult = await purposizeTables.purposeDataFields.findAll({
        where: {
          purpose: options.purpose,
          tableName: tableDAO.tableName
        }
      })
      const allowedFields = purposeResult.map(p => p.dataValues.fieldName)
      const keyArray = Object.keys(values)
      for (let i = 0, len = keyArray.length; i < len; i++) {
        const userField = keyArray[i]
        if (!allowedFields.some( f => f === userField)) {
          return sequelize.Promise.reject(new Error(`Field "${userField}" is incompatible with purpose(s): ${options.purpose}`))
        }
      }

      // metaDataTable.create({
      //   until: new Date(),
      //   purposizePurposePurpose:
      // })
      return originalCreate.apply(this, arguments)
    } else {
      return sequelize.Promise.reject(new Error("Incorrect purpose format!"))
    }
  }

}