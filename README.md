# YAJRPC

[![TRAVIS](https://secure.travis-ci.org/dcousens/yajrpc.png)](http://travis-ci.org/dcousens/yajrpc)
[![NPM](http://img.shields.io/npm/v/yajrpc.svg)](https://www.npmjs.org/package/yajrpc)

[![js-standard-style](https://cdn.rawgit.com/feross/standard/master/badge.svg)](https://github.com/feross/standard)

Yet another JSON RPC (Client)


## Example

``` javascript
let Yajrpc = require('yajrpc')
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

The `batch` method is remarkably useful in high-performance applications when used with tools like [`qup`](https://github.com/dcousens/qup):

``` javascript
let qup = require('qup')
let Yajrpc = require('yajrpc')

let client = new Yajrpc({
  url: process.env.RPC,
  user: process.env.RPCUSER,
  pass: process.env.RPCPASSWORD
})

// group RPC calls into batches of RPCBATCHSIZE, with a maximum of RPCCONCURRENT batches simultaneously
let q = qup((batch, callback) => {
  client.batch(batch, callback)
}, process.env.RPCCONCURRENT, process.env.RPCBATCHSIZE)

function rpc (method, params, callback) {
  q.push({ method, params, callback })
}

rpc('func1', [1, 2, 3], ...)
```

See `yajrpc/qup` for a pre-made equivalent of the above.


## LICENSE [MIT](LICENSE)
