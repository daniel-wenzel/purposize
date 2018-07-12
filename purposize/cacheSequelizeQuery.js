const util = require('util');
const NodeCache = require( "node-cache" );
let cache = new NodeCache({
  stdTTL: 60,
  checkperiod: 60,
  useClones: false
});

let enabled = true

cache.get = util.promisify(cache.get);
//cache.set = util.promisify(cache.set);
module.exports.findAll = async (table, args, opts) => {
  if (!opts) opts = {}
  const key = table.tableName+JSON.stringify(args)+JSON.stringify(opts)
  let ans = await cache.get(key)
  if (ans && enabled) {
    return ans
  }
  if (opts.single) {
    ans = await table.find(args)
  }
  else {
    ans = await table.findAll(args)
  }
  cache.set(key, ans)
  return ans
}
module.exports.flush = () => {
  cache.flushAll()
}
module.exports.getCompatiblePurposes= (purpose) => {
  if (!enabled) {
    return undefined
  }
  return cache.get(purpose+"-compatible")
}
module.exports.setCompatiblePurposes= (purpose, purposes) => {
  return cache.set(purpose+"-compatible", purposes)
}
module.exports.setEnabled = (e) => {
  enabled = e
}
