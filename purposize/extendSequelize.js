const personalDataStorage = require("./personalDataStorage")

const purposizeDefine = require('./methods/define')

module.exports = (sequelize, purposizeTables, options) => {
  const originalDefine = sequelize.define
  const originalSync = sequelize.sync

  sequelize.define = function() {
    return purposizeDefine(arguments, originalDefine, sequelize, purposizeTables, options)
  };
  
  sequelize.sync = async function() {
    await originalSync.apply(this, arguments)
    await personalDataStorage.flushToDB(purposizeTables.personalDataFields, options)
  }
}
