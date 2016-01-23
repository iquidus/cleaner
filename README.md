###Cleaner

Cleans unspent inputs of a specified address by crafting a self send tx.

* Copy settings.json.template to settings.json  
* Configure settings.json  

    node cleaner.js <address> <maxAmount>
  
maxAmount is optional (default: 10000). If specified will restrict inputs to those
less than maxAmount.
