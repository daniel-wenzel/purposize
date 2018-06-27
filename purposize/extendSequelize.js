const personalDataStorage = require("./personalDataStorage")

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
