let request = require('request')

// global used to prevent duplicates
let rpcCount = 0

function RPCClient (opts) {
  let { pass, user } = opts

  if (pass && user) {
    this.auth = { pass, user }
  }

  this.url = opts.url || 'http://localhost:8332'
}

RPCClient.prototype.batch = function (batch, done) {
  let startCount = rpcCount
  let rpcBody = batch.map(({ method, params, callback }, i) => {
    return {
      id: startCount + i,
      method, params,
      callback
    }
  })

  if (rpcBody.length === 0) return done()

  // overflows at UINT32
  rpcCount = (rpcCount + rpcBody.length) | 0

  request({
    url: this.url,
    method: 'POST',
    body: JSON.stringify(rpcBody),
    auth: this.auth
  }, (err, res) => {
    let responseMap = {}

    if (!err) {
      let rpcResponses = res.body

      if (!Array.isArray(rpcResponses)) {
        rpcResponses = [rpcResponses]
      }

      rpcResponses.forEach(({ error, id, result }) => {
        responseMap[id] = { error, result }
      })
    }

    batch.forEach(({ callback }, i) => {
      if (err) return callback(err)

      let rpcResult = responseMap[startCount + i]
      if (!rpcResult) return callback(new Error('Missing RPC response'))

      // unpack
      let { error, result } = rpcResult
      if (error) return callback(new Error(error.message || error.code))
      if (!result) return callback(new Error('Missing result'))

      callback(null, result)
    })

    done(err)
  })
}

RPCClient.prototype.call = function (method, params, callback) {
  let rpcBody = {
    id: rpcCount,
    method: method,
    params: params
  }

  // overflows at UINT32
  rpcCount = (rpcCount + 1) | 0

  request({
    url: this.url,
    method: 'POST',
    body: JSON.stringify(rpcBody),
    auth: this.auth
  }, (err, res) => {
    if (err) return callback(err)

    // unpack
    let { error, result } = res.body
    if (error) return callback(new Error(error.message || error.code))
    if (!result) return callback(new Error('Missing result'))

    callback(null, result)
  })
}

module.exports = RPCClient
