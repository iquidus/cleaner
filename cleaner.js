var settings = require('./lib/settings');
var lib = require('./lib/wallet.js');

// displays usage and exits
function usage() {
  console.log('Usage: node cleanup.js [address] [minAmount]');
  console.log('');
  process.exit(0);
}

// check options
// 0 = node
// 1 = cleanup.js
// 2 = address
// 3 = minAmount (default 750)
var address = '';
var minAmount = 750;


var COIN = 100000000;
var FEE = settings.fee;

if (process.argv.length < 3) {
  usage();
} else {
  address = process.argv[2];
}

if (process.argv.length > 3) {
  minAmount = process.argv[3];
}

// wallet daemon
var rpc = lib.connect(settings.wallet);

// validate address
lib.verify_address(rpc, address, function(isValid) {
  if (isValid === true) {
    // list unspent for specified address
    var txCount = 0;
    var txs = [];
    var total = 0;
    rpc.listUnspent(10, function(err, res){
      for (var i = 0; i < res.length; i++) {
        if (res[i].address === address && res[i].amount < minAmount && txCount < settings.maxInputs) {
          txCount += 1;
          txs.push({txid: res[i].txid, vout: res[i].vout});
          total = total + (res[i].amount * COIN);
        }
        if (i === res.length - 1) {
          var obj = {};
          obj[address] = ((total - FEE) / COIN);
          rpc.createRawTransaction(txs, obj, function(err, hex){
            if (err) {
              console.log(err);
              process.exit(0);
            } else {
              rpc.signRawTransaction(hex, function(err, signedtx){
                if (err) {
                  console.log(err);
                } else {
                  rpc.sendRawTransaction(signedtx.hex, function(err, txid) {
                    if (err) {
                      console.log(err);
                    } else {
                      console.log(txid);
                    }
                  });
                }
              });
            }
          });
        }
      }
    });
  } else {
    console.log('Invalid Address');
    process.exit(0);
  }
});
