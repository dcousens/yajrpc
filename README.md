# YAJRPC

[![TRAVIS](https://secure.travis-ci.org/dcousens/yajrpc.png)](http://travis-ci.org/dcousens/YAJRPC)
[![NPM](http://img.shields.io/npm/v/yajrpc.svg)](https://www.npmjs.org/package/YAJRPC)

[![js-standard-style](https://cdn.rawgit.com/feross/standard/master/badge.svg)](https://github.com/feross/standard)

Yet Another JSON RPC (Client)


## Example

``` javascript
let rpc = new YajRPC({
  url: 'http://localhost:8332',
  user: process.env.RPCUSER,
  pass: process.env.RPCPASSWORD
})

// 1 call
rpc.call('func1', [1, 2, 3], function (err, result) {
	// ...
})

// batched request
rpc.batch([{
	method: 'func1',
	params: [1, 2, 3],
	callback: function (err, result) {
		// ...
	}
}, ...])
```

## LICENSE [MIT](LICENSE)
