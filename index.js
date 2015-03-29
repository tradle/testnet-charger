
var faucets = require('tbtc-faucets')
var bitcoin = require('bitcoinjs-lib')
var WAIT = 5000
var noop = function() {}

function Charger(wallet) {
  this._wallet = wallet
  this._faucet = faucets.RoyalForkBlog
  this._to = []
  this._total = bitcoin.networks[this._wallet.networkName].feePerKb
  this._from = this._wallet.getNextAddress()
  this._builder = this._wallet.buildTx()
    .from(this._from)
    .minConf(0)
}

Charger.prototype.setFaucet = function(faucet) {
  this._faucet = faucet
}

Charger.prototype.charge = function(address, amount) {
  this._to.push(arguments)
  // validate
  // var tx = this._wallet.createTx(address, amount)
  this._total += amount
  this._builder.to(address, amount)
}

Charger.prototype.execute = function(callback) {
  var self = this
  var single = this._to.length === 1
  if (single) this._from = this._to[0][0]

  this._faucet.withdraw(this._from, this._total, function(err, data) {
    if (err) return callback(err)

    self._txId = data.id
    var done = single ? callback : self._distribute.bind(self, callback)
    self._waitFor(self._txId, done)
  })
}

Charger.prototype._distribute = function(callback) {
  var distTx = this._builder.build()
  this._wallet.sendTx(distTx, callback)
}

Charger.prototype._waitFor = function(txId, callback) {
  var self = this
  var intervalId = setInterval(tryAgain, WAIT)
  this._wallet.on('tx', function(tx) {
    if (tx.getId() === txId) {
      clearInterval(intervalId)
      callback()
    }
  })

  function tryAgain() {
    var addrIdx = self._wallet.getAddressIndex('external', self._from)
    var method = addrIdx === -1 ? 'bootstrap' : 'fetchTransactions'
    self._wallet[method]()
  }

  tryAgain()
}

Charger.faucets = faucets
module.exports = Charger
