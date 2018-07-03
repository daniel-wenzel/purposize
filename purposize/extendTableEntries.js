const purposizeRemovePurpose = require('./methods/removePurpose')
const purposizeAddPurpose = require('./methods/addPurpose')
const purposizeSave = require('./methods/save')

module.exports = (tableEntries, purposizeTables) => {
  const modifyTableEntry = (tableEntry) => {
    if (Array.isArray(tableEntry)) {
      tableEntry.forEach(t => modifyTableEntry(t))
    }
    const originalRemovePurpose = tableEntry.removePurpose
    if (originalRemovePurpose !== undefined) {
      tableEntry.removePurpose = async function() {
        return await purposizeRemovePurpose(arguments, originalRemovePurpose, tableEntry, purposizeTables) 
      }
    }

    const originalAddPurpose = tableEntry.addPurpose
    if (originalAddPurpose !== undefined) {
      tableEntry.addPurpose = async function() {
        return await purposizeAddPurpose(arguments, originalAddPurpose, tableEntry, purposizeTables) 
      }
    }
   
    const originalSave = tableEntry.save
    tableEntry.save = async function() {
      return await purposizeSave(arguments, originalSave, tableEntry, purposizeTables)
    }
  }

  modifyTableEntry(tableEntries) // Kick off recursion
}
