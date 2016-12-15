let request = require('request')
let typeforce = require('typeforce')

// global used to prevent duplicates
let rpcCount = 0

function RPCClient (opts) {
  let { pass, user } = opts

  if (pass && user) {
    this.auth = { pass, user }
  }

  this.url = opts.url || 'http://localhost:8332'
}

let RPC_MESSAGE_TYPE = typeforce.compile({
  method: typeforce.String,
  params: typeforce.Array,
  callback: typeforce.maybe(typeforce.Function)
})

RPCClient.prototype.batch = function (batch, done) {
  typeforce(typeforce.arrayOf(RPC_MESSAGE_TYPE), batch)

  let startCount = rpcCount
  let rpcBody = batch.map((x, i) => {
    return Object.assign({ id: startCount + i }, x)
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
      let rpcResponses

      try {
        rpcResponses = JSON.parse(res.body)
      } catch (e) {
        err = e
      }

      if (rpcResponses) {
        if (!Array.isArray(rpcResponses)) {
          rpcResponses = [rpcResponses]
        }

        rpcResponses.forEach(({ error, id, result }) => {
          responseMap[id] = { error, result }
        })
      }
    }

    batch.forEach(({ callback }, i) => {
      if (err) return callback(err)

      let rpcResult = responseMap[startCount + i]
      if (!rpcResult) return callback(new Error('Missing RPC response'))

      // unpack
      let { error, result } = rpcResult
      if (error) return callback(new Error(error.message || error.code))
      if (result === undefined) return callback(new TypeError('Missing RPC result'))

      callback(null, result)
    })

    done(err)
  })
}

RPCClient.prototype.call = function (method, params, callback) {
  typeforce(RPC_MESSAGE_TYPE, { method, params, callback })

  let rpcBody = { id: rpcCount, method, params }

  // overflows at UINT32
  rpcCount = (rpcCount + 1) | 0

  request({
    url: this.url,
    method: 'POST',
    body: JSON.stringify(rpcBody),
    auth: this.auth
  }, (err, res) => {
    if (err) return callback(err)

    let rpcResponse
    try {
      rpcResponse = JSON.parse(res.body)
    } catch (e) {
      return callback(e)
    }

    // unpack
    let { error, result } = rpcResponse
    if (error) return callback(new Error(error.message || error.code))
    if (result === undefined) return callback(new TypeError('Missing RPC result'))

    callback(null, result)
  })
}

module.exports = RPCClient
