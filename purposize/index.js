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

  const tables = initStaticTables(sequelize)
  Object.assign(purposizeTables, tables)
  extendSequelize(sequelize, purposizeTables)

}

async function loadPurposes(path) {
  const readFile = util.promisify(fs.readFile)
  const purposes = yaml.safeLoad(await readFile(path, 'utf8')).purposes

  for (purpose of purposes) {

    await purposizeTables.purpose.upsert({
      purpose: purpose.name
    })

    for (customerDataTable in purpose.relevantFields) {
      for (customerDataCell of purpose.relevantFields[customerDataTable]) {

        /*    await purposizeTables.purposeFieldTable.upsert({

        })*/
      }
    }


  }
  console.log(purposes)
}

module.exports.init = init
module.exports.loadPurposes = loadPurposes
