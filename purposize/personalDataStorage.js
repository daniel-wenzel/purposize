//This file stores which fields contain personal data before it can be stored in the database
const cache = require("./cache")

let personalDataFields = []

function addPersonalData(tableName, fieldName) {
  // console.log("New personal field: " + tableName, fieldName)
  // console.log(`New personal field detected: ${fieldName} in ${tableName} table`)
  personalDataFields.push({
    tableName: tableName,
    fieldName: fieldName
  })
}

async function writePersonalDataIntoDB(personalDataFieldsTable, options) {
  if (personalDataFields.length === 0) return
  
  for (let personalDataField of personalDataFields) {
    // console.log(`Storing personal data field: ${personalDataField.fieldName} in ${personalDataField.tableName} table`)
    await personalDataFieldsTable.upsert(personalDataField)
  }

  if (options.cache) {
    cache.set("personalDataFields", personalDataFields)
  }

  personalDataFields = []
}

module.exports = {
  add: addPersonalData,
  flushToDB: writePersonalDataIntoDB
}
