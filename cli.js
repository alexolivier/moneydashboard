
const MoneyDashboard = require('./lib/MoneyDashboard')
const program = require('commander')
const Table = require('cli-table')
const moment = require('moment')
const accounting = require('accounting')
const colors = require('colors')
const cfg = require('home-config')

const mdb = new MoneyDashboard()

program
  .version('0.1.0')
  .option('-e, --email <email>', 'Money Dashboard Email')
  .option('-p, --password <password>', 'Money Dashboard Password')
  .option('-o, --output [type]', 'Output format [type]', 'table')

const accountConfig = cfg.load('.moneydashboard')

program
  .command('accounts')
  .action(async (cmd) => {
    try {
      await mdb.init(
        accountConfig.email ? accountConfig.email : program.email,
        accountConfig.password ? accountConfig.password : program.password
      )
      const accounts = await mdb.getAccounts()
      if (program.output === 'json') {
        console.log(accounts)
      } else {
        const table = new Table({
          head: [colors.cyan('Source'), colors.cyan('Name'), colors.cyan('Balance'), colors.cyan('Last Refreshed')]
        })
        let total = 0
        accounts.map(account => {
          if (account.IncludeInCalculations) {
            total += account.Balance
          } else {
            account.Name += ' (Excluded from total)'
          }
          const color = account.Balance >= 0 ? 'green' : 'red'
          table.push([
            account.Institution.Name,
            account.Name,
            colors[color](accounting.formatMoney(account.Balance, '£ ', 2)),
            moment(account.LastRefreshed).fromNow()
          ])
        })
        const color = total >= 0 ? 'green' : 'red'
        table.push(['', colors.cyan('TOTAL'), colors[color](accounting.formatMoney(total, '£ ', 0)), ''])
        console.log(table.toString())
      }
    } catch (e) {
      if (program.output === 'json') {
        console.error({error: 'Sorry an error occured. Are your account details correct?'})
      } else {
        console.error('Sorry an error occured. Are your account details correct?')
        console.error(e)
      }
    }
  })

program
  .command('transactions [count]')
  .action(async (count) => {
    try {
      await mdb.init(
        accountConfig.email ? accountConfig.email : program.email,
        accountConfig.password ? accountConfig.password : program.password
      )
      const transactions = await mdb.getTransactions(count)
      if (program.output === 'json') {
        console.log(transactions)
      } else {
        const table = new Table({
          head: [colors.cyan('Date'), colors.cyan('Name'), colors.cyan('Amount'), colors.cyan('Account')]
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
    } catch (e) {
      if (program.output === 'json') {
        console.error({error: 'Sorry an error occured. Are your account details correct?'})
      } else {
        console.error('Sorry an error occured. Are your account details correct?')
      }
    }
  })

program
  .command('tags')
  .action(async (cmd) => {
    await mdb.init(
      accountConfig.email ? accountConfig.email : program.email,
      accountConfig.password ? accountConfig.password : program.password
    )
    console.log(await mdb.getTags())
  })

program.parse(process.argv)
