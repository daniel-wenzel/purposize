const yaml = require('js-yaml');
const fs = require('fs');
const util = require('util');

const initStaticTables = require("./initStaticTables.js")
const extendSequelize = require("./extendSequelize.js")

const purposizeTables = {
  metaDataTables: {}
}

function init(sequelize) {
  // console.log('Initializing purposize...')
  // console.log('Adding static tables...')
  const tables = initStaticTables(sequelize)
  // console.log('Done!')
  Object.assign(purposizeTables, tables)
  // console.log(purposizeTables)
  // console.log('Extending sequelize methods...')
  extendSequelize(sequelize, purposizeTables)
  // console.log('Done!')

  // console.log('Initialization successful!')
  // console.log('######################################################')
}

async function loadPurposes(path) {
  // console.log('Loading purposes...')
  const readFile = util.promisify(fs.readFile)
  const purposes = yaml.safeLoad(await readFile(path, 'utf8')).purposes

  for (purpose of purposes) {
    // console.log(`Storing ${purpose.name} purpose information to PurposeTable`)
    await purposizeTables.purposes.upsert({
      purpose: purpose.name,
      retentionPeriod: purpose.retentionPeriod,
      loggingLevel: purpose.loggingLevel
    })


    for (const tableName in purpose.relevantFields) {
      for (const attribute of purpose.relevantFields[tableName]) {
        // console.log(`Storing ${tableName}(${attribute}) for ${purpose.name} in PurposeDataFieldTable`)
        await purposizeTables.purposeDataFields.upsert({
          purpose: purpose.name,
          tableName: tableName,
          fieldName: attribute
        })
      }
    }
  }
  // Set compatible relations. We do this in a second run to make sure all purposes exist in the db
  for (purposeInfo of purposes) {
    // if we have no compatible purposes, we dont have to add any
    if (!purposeInfo.compatibleWith || purposeInfo.compatibleWith.length == 0) {
      continue
    }
    const purposeObj = await purposizeTables.purposes.find({
      where: {
        purpose: purposeInfo.name
      }
    })
    purposeObj.setCompatiblePurposes(purposeInfo.compatibleWith)
    await purposeObj.save()
  }
  // console.log('Successfully loaded purposes!')
}

module.exports = {
  init,
  loadPurposes
}
