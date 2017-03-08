let Yajrpc = require('./')
let qup = require('qup')

// groups RPC calls into batches of `.batch` size, with a maximum of `.concurrent` batches simultaneously
module.exports = function rpcQup (options) {
  let client = new Yajrpc(options)
  let q = qup((batch, callback) => {
    client.batch(batch, callback)
  }, options.concurrent, options.batch)

  return function call (method, params, callback) {
    q.push({ method, params, callback })
  }
}
