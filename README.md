# Testnet charger

Prevent testnet faucet abuse by withdrawing once and then distributing the funds among addresses in wallet

## Usage

```js
var c = new Charger(wallet) // wallet is instance of github.com/tradle/cb-wallet
c.charge(wallet.getNextAddress(1), 1000)
c.charge(wallet.getNextAddress(2), 1042)
c.charge(wallet.getNextAddress(3), 2378)
c.execute(function(err) {
  if (!err) {
    console.log('Withdrew TBTC from faucet and distributed to specified addresses')
  }
})
````
