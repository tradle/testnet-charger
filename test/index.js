
var test = require('tape')
var bitcoin = require('bitcoinjs-lib')
var Charger = require('../')
var BIP39 = require('bip39')
var CBWallet = require('cb-wallet')
var networkName = 'testnet'
var wallet

test('new wallet', function(t) {
  newWallet(function(err, w) {
    if (err) throw err

    t.end()
  })
})

test('charge, distribute', function(t) {
  var c = new Charger(wallet)
  var charges = {}
  for (var i = 1; i < 6; i++) {
    var address = wallet.getNextAddress(i)
    charges[address] = 1000 + Math.floor(Math.random() * 1000)
    c.charge(address, charges[address])
  }

  c.execute(function(err) {
    var unspents = wallet.getUnspents(0)
    for (var address in charges) {
      var found = unspents.some(function(u) {
        if (u.address === address && charges[address] === u.value) {
          t.pass()
          return true
        }
      })

      t.ok(found)
    }

    t.end()
  })
})

function newWallet(callback) {
  var mnemonic = BIP39.generateMnemonic()
  var seed = BIP39.mnemonicToSeedHex(mnemonic)
  var network = bitcoin.networks.testnet
  var accountZero = bitcoin.HDNode.fromSeedHex(seed, network).deriveHardened(0)

  var accounts = {
    external: accountZero.derive(0),
    internal: accountZero.derive(1)
  }

  wallet = new CBWallet({
    externalAccount: accounts.external,
    internalAccount: accounts.internal,
    networkName: networkName
  }, callback)
}

