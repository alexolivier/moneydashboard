# MoneyDashboard

A simple library to pull data from moneydashboard.com

## Example
### CLI
```
node cli.js -e me@me.com -p myawesomepassword accounts
node cli.js -e me@me.com -p myawesomepassword transactions
node cli.js -e me@me.com -p myawesomepassword tags
```

### Node
```
const MoneyDashboard = require('@alexolivier/moneydashboard')
await MoneyDashboard.login(program.email, program.password)
console.log(await MoneyDashboard.accounts())
console.log(await MoneyDashboard.transactions())
console.log(await MoneyDashboard.tags())
```