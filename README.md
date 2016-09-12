# YAJRPC

[![TRAVIS](https://secure.travis-ci.org/dcousens/yajrpc.png)](http://travis-ci.org/dcousens/YAJRPC)
[![NPM](http://img.shields.io/npm/v/yajrpc.svg)](https://www.npmjs.org/package/YAJRPC)

[![js-standard-style](https://cdn.rawgit.com/feross/standard/master/badge.svg)](https://github.com/feross/standard)

Yet another JSON RPC (Client)


## Example

``` javascript
let rpc = new YajRPC({
  url: 'http://localhost:8332',
  user: process.env.RPCUSER,
  pass: process.env.RPCPASSWORD
})

// 1 call
rpc.call('func1', [1, 2, 3], (err, result) => {
	// ...
})

// batched request
rpc.batch([{
	method: 'func1',
	params: [1, 2, 3],
	callback: (err, result) => {
		// ...
	}
}, ...], function (err) { ... })
```

The `batch` API can be a little strange at first, but, when used with tools like `qup`, it can be extremely powerful:

``` javascript
let qup = require('qup')
let Yajrpc = require('yajrpc')

let client = new Yajrpc({
  url: process.env.RPC,
  user: process.env.RPCUSER,
  pass: process.env.RPCPASSWORD
})

// group RPC calls into batches of RPCBATCHSIZE, with RPCCONCURRENT batches concurrently
let q = qup((batch, callback) => {
  client.batch(batch, callback)
}, process.env.RPCCONCURRENT, process.env.RPCBATCHSIZE)

module.exports = function rpc (method, params, callback) {
  q.push({ method, params, callback })
}
```

## LICENSE [MIT](LICENSE)
