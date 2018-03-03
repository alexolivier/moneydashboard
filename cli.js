
const MoneyDashboard = require('./lib/MoneyDashboard')
const program = require('commander')
const Table = require('cli-table')
const moment = require('moment')
const accounting = require('accounting')
const colors = require('colors')

program
  .version('0.1.0')
  .option('-e, --email <email>', 'Money Dashboard Email', { required: true })
  .option('-p, --password <password>', 'Money Dashboard Password', { required: true })
  .option('-o, --output [type]', 'Output format [type]', 'table')

program
  .command('accounts')
  .action(async (cmd) => {
    await MoneyDashboard.login(program.email, program.password)
    const accounts = await MoneyDashboard.accounts()
    if (program.output === 'json') {
      console.log(accounts)
    } else {
      const table = new Table({
        head: ['Source', 'Name', 'Balance', 'Last Refreshed']
      })
      let total = 0
      accounts.map(account => {
        total += account.Balance
        const color = account.Balance >= 0 ? 'green' : 'red'
        table.push([
          account.Institution.Name,
          account.Name,
          colors[color](accounting.formatMoney(account.Balance, '£ ', 2)),
          moment(account.LastRefreshed).fromNow()
        ])
      })
      const color = total >= 0 ? 'green' : 'red'
      table.push([colors.red('TOTAL'), colors[color](accounting.formatMoney(total, '£ ', 0)), ''])
      console.log(table.toString())
    }
  })

program
  .command('transactions [count]')
  .action(async (count) => {
    await MoneyDashboard.login(program.email, program.password)
    const transactions = await MoneyDashboard.transactions(count)
    if (program.output === 'json') {
      console.log(transactions)
    } else {
      const table = new Table({
        head: ['Date', 'Name', 'Amount', 'Account']
      })
      transactions.map(transaction => {
        const color = transaction.Amount >= 0 ? 'green' : 'red'
        table.push([
          moment(transaction.Date).format('L'),
          transaction.Description,
          colors[color](accounting.formatMoney(transaction.Amount, '£ ', 2)),
          transaction.Account.Name
        ])
      })
      console.log(table.toString())
    }
  })

program
  .command('tags')
  .action(async (cmd) => {
    await MoneyDashboard.login(program.email, program.password)
    console.log(await MoneyDashboard.tags())
  })

program.parse(process.argv)
