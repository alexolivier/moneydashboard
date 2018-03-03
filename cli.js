
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

program
  .command('accounts')
  .action(async (cmd) => {
    await MoneyDashboard.login(program.email, program.password)
    const accounts = await MoneyDashboard.accounts()
    var table = new Table({
      head: ['Name', 'Balance', 'Source', 'Last Refreshed']
    })
    let total = 0
    accounts.map(account => {
      total += account.Balance
      const color = account.Balance >= 0 ? 'green' : 'red'
      table.push([
        account.Name,
        colors[color](accounting.formatMoney(account.Balance, '£ ', 0)),
        account.Institution.Name,
        moment(account.LastRefreshed).fromNow()
      ])
    })
    const color = total >= 0 ? 'green' : 'red'
    table.push([colors.red('TOTAL'), colors[color](accounting.formatMoney(total, '£ ', 0)), ''])
    console.log(table.toString())
    // console.log(accounts)
  })

program
  .command('transactions [count]')
  .action(async (count) => {
    await MoneyDashboard.login(program.email, program.password)
    console.log(await MoneyDashboard.transactions(count))
  })

program
  .command('tags')
  .action(async (cmd) => {
    await MoneyDashboard.login(program.email, program.password)
    console.log(await MoneyDashboard.tags())
  })

program.parse(process.argv)
