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

The `batch` API can be a little strange at first, but, when used with tools like `async`, it can be extremely powerful:

``` javascript
let rpc = new YajRPC({ ... })
// ...

let rpcCargo = async.cargo((payload, callback) => {
  jsonRpc.batch(payload, callback)
}, 32)

rpcCargo.push({ method: 'func1', params: [1, 2, 3], callback: function (err, result) { ... })

// or
let results = {}
async.map(array, (item, callback) => {
	rpcCargo.push({
		method: 'func1',
		params: items,
		callback
	})
}, function (err, results) {
	// ...
})
```

## LICENSE [MIT](LICENSE)
