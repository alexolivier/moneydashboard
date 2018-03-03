# MoneyDashboard

A simple library to pull data from moneydashboard.com

## Example
### CLI
```
npm install moneydashboard -g
```
```
moneydashboard -e me@me.com -p myawesomepassword accounts
moneydashboard -e me@me.com -p myawesomepassword transactions [count]
moneydashboard -e me@me.com -p myawesomepassword tags
```

You can also set up a config file in `$HOME/.moneydashboard` containing your credentials:
```
email = me@me.com
password = myawesomepassword
```
If this is set, then email and password don't need to be passed via the command line flags.

### Node

```
const MoneyDashboard = require('moneydashboard')
await MoneyDashboard.login('me@me.com', 'myawesomepassword')
console.log(await MoneyDashboard.accounts())
console.log(await MoneyDashboard.transactions(10))
console.log(await MoneyDashboard.tags())
```