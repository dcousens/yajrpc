let httpify = require('httpify')

// global used to prevent duplicates
let rpcCount = 0

function RPCClient (opts) {
  if (opts.user && opts.pass) {
    this.auth = opts.user + ':' + opts.pass
  }

  this.url = opts.url || 'http://localhost:8332'
}

RPCClient.prototype.batch = function (batch) {
  let startCount = rpcCount
  let rpcBody = batch.map(({ method, params, callback }, i) => {
    return {
      id: startCount + i,
      method, params,
      callback
    }
  })

  // overflows at UINT32
  rpcCount = (rpcCount + rpcBody.length) | 0

  httpify({
    url: this.url,
    method: 'POST',
    body: JSON.stringify(rpcBody),
    auth: this.auth
  }, (err, res) => {
    let rpcResponses = res.body

    if (!Array.isArray(rpcResponses)) {
      rpcResponses = [rpcResponses]
    }

    let responseMap = {}
    res.body.forEach(({ error, id, result }) => {
      responseMap[id] = { error, result }
    })

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

  httpify({
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
