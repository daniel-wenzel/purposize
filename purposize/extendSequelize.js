const personalDataStorage = require("./personalDataStorage")
const extendTableDAO = require("./extendTableDAO")
const purposizeTablePrefix = "purposize_"
const Sequelize = require("sequelize")

const purposizeDefine = require('./methods/define')

module.exports = (sequelize, purposizeTables) => {
  const originalDefine = sequelize.define
  const originalSync = sequelize.sync

  sequelize.define = function() {
    return purposizeDefine(arguments, originalDefine, sequelize, purposizeTables)
  };
  
  sequelize.sync = async function() {
    await originalSync.apply(this, arguments)
    await personalDataStorage.flushToDB(purposizeTables.personalDataFields)
  }
}
