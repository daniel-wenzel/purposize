const NodeCache = require("node-cache")

const cache = new NodeCache()

exports.get = (key) => {
  return cache.get(key)
}

exports.set = (key, value) => {
  return cache.set(key, value)
}

exports.getCompatiblePurposes = (purpose) => {
  const allCompatiblePurposes = []
  const compatiblePurposes = cache.get("compatiblePurposes")
  let uncheckedPurposes = [purpose]
  while (uncheckedPurposes.length > 0) {
    const nextPurpose = uncheckedPurposes.pop()
    // continue if the purpose is already in our list
    if (allCompatiblePurposes.includes(p => p == nextPurpose)) continue
    allCompatiblePurposes.push(nextPurpose)

    if (compatiblePurposes[nextPurpose]) {
      uncheckedPurposes = uncheckedPurposes.concat(compatiblePurposes[nextPurpose])
    }
  }
  return allCompatiblePurposes
}