//This file stores which fields contain personal data before it can be stored in the database

let personalDataFields = []

function addPersonalData(tableName, fieldName) {
  console.log("new personal field: " + tableName, fieldName)
  personalDataFields.push({
    tableName: tableName,
    fieldName: fieldName
  })
}

async function writePersonalDataIntoDB(personalDataFieldsTable) {
  for (personalDataField of personalDataFields) {
    console.log("create personal data", personalDataField)
    await personalDataFieldsTable.upsert(personalDataField)
  }
  personalDataFields = []
}

module.exports = {
  add: addPersonalData,
  flushToDB: writePersonalDataIntoDB
}
