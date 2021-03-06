let dhttp = require('dhttp')
let typeforce = require('typeforce')

// global used to prevent duplicates
let rpcCount = 0

function RPCClient (opts) {
  typeforce({ url: typeforce.String }, opts)
  
  let { auth, pass, user, url } = opts
  if (auth) {
    this.auth = {
      'Authorization': 'Basic ' + Buffer.from(`${auth}`, 'utf8').toString('base64')
    }
  } else if (pass !== undefined || user !== undefined) {
    this.auth = {
      'Authorization': 'Basic ' + Buffer.from(`${user}:${pass}`, 'utf8').toString('base64')
    }
  }

  this.url = url
}

let RPC_MESSAGE_TYPE = typeforce.compile({
  method: typeforce.String,
  params: typeforce.Array,
  callback: typeforce.maybe(typeforce.Function)
})

RPCClient.prototype.batch = function (batch, done) {
  typeforce(typeforce.arrayOf(RPC_MESSAGE_TYPE), batch)

  let startCount = rpcCount
  let body = batch.map((x, i) => {
    return Object.assign({ id: startCount + i }, x)
  })

  if (body.length === 0) return done()

  // overflows at UINT32
  rpcCount = (rpcCount + body.length) | 0

  dhttp({
    url: this.url,
    method: 'POST',
    body,
    headers: this.auth
  }, (err, res) => {
    let responseMap = {}

    if (!err && (res.statusCode === 401)) err = new Error('Unauthorized')
    if (!err && res.body) {
      if (!Array.isArray(res.body)) {
        err = new Error(res.body)
      } else {
        res.body.forEach(({ error, id, result }) => {
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

  let body = { id: rpcCount, method, params }

  // overflows at UINT32
  rpcCount = (rpcCount + 1) | 0

  dhttp({
    url: this.url,
    method: 'POST',
    body,
    headers: this.auth
  }, (err, res) => {
    if (err) return callback(err)
    if (res.statusCode === 401) return callback(new Error('Unauthorized'))

    // unpack
    let { error, result } = res.body
    if (error) return callback(new Error(error.message || error.code))
    if (result === undefined) return callback(new TypeError('Missing RPC result'))

    callback(null, result)
  })
}

module.exports = RPCClient
