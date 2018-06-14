const Sequelize = require("sequelize")
const yaml = require('js-yaml');
const fs = require('fs');
const util = require('util');

const purposizeTablePrefix = "purposize_"
const initStaticTables = require("./initStaticTables.js")
const extendSequelize = require("./extendSequelize.js")


const purposizeTables = {
  metaDataTables: {}
}

function init(sequelize) {
  console.log('Initializing purposize...')
  console.log('Adding static tables...')
  const tables = initStaticTables(sequelize)
  console.log('Done!')
  Object.assign(purposizeTables, tables)
  console.log(purposizeTables)
  console.log('Extenting sequelize methods...')
  extendSequelize(sequelize, purposizeTables)
  console.log('Done!')
  
  console.log('Initialization successful!')
}

async function loadPurposes(path) {
  console.log('Loading purposes...')
  const readFile = util.promisify(fs.readFile)
  const purposes = yaml.safeLoad(await readFile(path, 'utf8')).purposes

  for (purpose of purposes) {
    console.log(`Adding ${purpose.name} purpose to PurposeTable`)
    await purposizeTables.purpose.upsert({
      purpose: purpose.name
    })


    for (const tableName in purpose.relevantFields) {
      for (const attribute of purpose.relevantFields[tableName]) {
        console.log(`Adding ${purpose.name} purpose entry for ${tableName}(${attribute}) into PurposeDataFieldTable`)
        await purposizeTables.purposeDataFields.upsert({
          purpose: purpose.name,
          tableName: tableName,
          fieldName: attribute
        })
      }
    }
  }
  console.log('Done! Successfully loaded purposes!')
}

module.exports = {
  init,
  loadPurposes
}
