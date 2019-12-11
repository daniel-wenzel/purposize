const NodeCache = require("node-cache")

const cache = new NodeCache()

exports.get = (key) => {
  return cache.get(key)
}

exports.set = (key, value) => {
  return cache.set(key, value)
}