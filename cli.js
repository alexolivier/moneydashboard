
const MoneyDashboard = require('./lib/MoneyDashboard')
const program = require('commander')

program
  .version('0.1.0')
  .option('-e, --email <email>', 'Money Dashboard Email', { required: true })
  .option('-p, --password <password>', 'Money Dashboard Password', { required: true })

program
  .command('accounts')
  .action(async (cmd) => {
    await MoneyDashboard.login(program.email, program.password)
    console.log(await MoneyDashboard.accounts())
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
