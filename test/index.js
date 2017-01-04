let Yajrpc = require('../')
let rpc = new Yajrpc({
  url: 'http://localhost:8332',
  user: 'bitcoinrpc',

  // 'typical' password
  pass: '5BHFp1QgcNsYtUNq7pu3zDbk5gFZFSwmy32ky7q3z9Fy'
})

rpc.call('getbestblockhash', [], (err, result) => {
  console.log(err, result)
})
