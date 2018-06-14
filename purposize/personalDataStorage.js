//This file stores which fields contain personal data before it can be stored in the database

let personalDataFields = []

function addPersonalData(tableName, fieldName) {
  // console.log("New personal field: " + tableName, fieldName)
  console.log(`New personal field detected: ${fieldName} in ${tableName} table`)
  personalDataFields.push({
    tableName: tableName,
    fieldName: fieldName
  })
}

async function writePersonalDataIntoDB(personalDataFieldsTable) {
  for (personalDataField of personalDataFields) {
    console.log(`Storing personal data field: ${personalDataField.fieldName} in ${personalDataField.tableName} table`)
    await personalDataFieldsTable.upsert(personalDataField)
  }
  personalDataFields = []
}

module.exports = {
  add: addPersonalData,
  flushToDB: writePersonalDataIntoDB
}
