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

### Node

```
const MoneyDashboard = require('moneydashboard')
await MoneyDashboard.login(program.email, program.password)
console.log(await MoneyDashboard.accounts())
console.log(await MoneyDashboard.transactions(10))
console.log(await MoneyDashboard.tags())
```