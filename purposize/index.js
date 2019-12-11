const yaml = require('js-yaml');
const fs = require('fs');
const util = require('util');

const initStaticTables = require("./initStaticTables.js")
const extendSequelize = require("./extendSequelize.js")
const cache = require("./cache")

const purposizeTables = {
  metaDataTables: {}
}

const defaultOptions = {
  deletionCheckInterval: 6*60*60*1000,
  logging: true,
  logFunction: console.log,
  cache: true
}

// Validates given options
// Set invalid values back to default and log error
function validateOptions(options) {
  const logConfig = '\x1b[33m%s\x1b[0m'
  const d = options.deletionCheckInterval
  if (d && d < 60*60*1000) {
    console.error(logConfig, `Invalid option: deletionCheckInterval too small! It must be at least 1 hour (3600000 ms). Default value (6 hours, ${defaultOptions.deletionCheckInterval} ms) was used.`)
    options.deletionCheckInterval = defaultOptions.deletionCheckInterval
  }

  const l = options.logging
  if (l && typeof l !== 'boolean') {
    console.error(logConfig, `Invalid option: logging must be a boolean. Default value (${defaultOptions.logging}) was used.`)
    options.logging = defaultOptions.logging
  }

  const lf = options.logFunction
  if (lf && typeof lf !== 'function') {
    console.error(logConfig, `Invalid option: logFunction must be a function. Default function (console.log) was used.`)
    options.logFunction = defaultOptions.logFunction
  }

  const c = options.cache
  if (c && typeof c !== 'boolean') {
    console.error(logConfig, `Invalid option: cache must be a boolean. Default value (${defaultOptions.logging}) was used.`)
    options.logging = defaultOptions.logging
  }
  return options
}

let options = {}
function init(sequelize, userOptions = defaultOptions) {
  options = Object.assign({ ...defaultOptions }, validateOptions(userOptions))
  // console.log('Initializing purposize...')
  // console.log('Adding static tables...')
  const tables = initStaticTables(sequelize, options)
  // console.log('Done!')
  Object.assign(purposizeTables, tables)
  // console.log(purposizeTables)
  // console.log('Extending sequelize methods...')
  extendSequelize(sequelize, purposizeTables, options)
  // console.log('Done!')

  // console.log('Initialization successful!')
  // console.log('######################################################')
}

async function loadPurposes(path) {
  // console.log('Loading purposes...')
  const readFile = util.promisify(fs.readFile)
  const purposes = yaml.safeLoad(await readFile(path, 'utf8')).purposes

  const personalDataFields = await purposizeTables.personalDataFields.findAll()
  for (let purpose of purposes) {
    // console.log(`Storing ${purpose.name} purpose information to PurposeTable`)
    const purposeInstance = await purposizeTables.purposes.create({
      purpose: purpose.name,
      retentionPeriod: purpose.retentionPeriod,
      loggingLevel: purpose.loggingLevel
    })


    for (const tableName in purpose.relevantFields) {
      for (const attribute of purpose.relevantFields[tableName]) {
        // console.log(`Storing ${tableName}(${attribute}) for ${purpose.name} in PurposeDataFieldTable`)
        const personalDataField = personalDataFields.find(x => {
          return x.fieldName === attribute && x.tableName === tableName
        })
        await purposizeTables.purposeDataFields.create({
          purpose: purposeInstance.purpose,
          tableName: tableName,
          fieldName: attribute,
          personalDataFieldId: personalDataField ? personalDataField.id : null,
        })
      }
    }
  }

  const compatiblePurposes = {}
  // Set compatible relations. We do this in a second run to make sure all purposes exist in the db
  for (let purposeInfo of purposes) {
    // if we have no compatible purposes, we dont have to add any
    if (!purposeInfo.compatibleWith || purposeInfo.compatibleWith.length == 0) {
      continue
    }
    const purposeObj = await purposizeTables.purposes.findOne({
      where: {
        purpose: purposeInfo.name
      }
    })
    purposeObj.setCompatiblePurposes(purposeInfo.compatibleWith)
    await purposeObj.save()
    compatiblePurposes[purposeInfo.name] = purposeInfo.compatibleWith
  }

  if (options.cache) {
    cache.set("compatiblePurposes", compatiblePurposes)
  }
  
  // console.log('Successfully loaded purposes!')
}

module.exports = {
  init,
  loadPurposes,
}
