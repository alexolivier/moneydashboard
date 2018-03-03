const _ = require('lodash')
const axios = require('axios')
const axiosCookieJarSupport = require('@3846masa/axios-cookiejar-support').default
const cheerio = require('cheerio')
const tough = require('tough-cookie')
axiosCookieJarSupport(axios)

const Host = 'https://my.moneydashboard.com'
const UserAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/64.0.3282.186 Safari/537.36'

class MoneyDashboard {
  constructor () {
    this.cookieJar = new tough.CookieJar()
    this.token = false
  }
  async init (email, password) {
    const landing = await axios.get(`${Host}/landing`, {
      jar: this.cookieJar,
      withCredentials: true
    })
    const landingPageDOM = cheerio.load(landing.data)
    this.token = landingPageDOM('input[name="__RequestVerificationToken"]').val()
    await axios.post(`${Host}/landing/login`,
      {
        'OriginId': '1',
        'Password': password,
        'Email': email,
        'CampaignRef': '',
        'ApplicationRef': '',
        'UserRef': ''
      }, {
        jar: this.cookieJar,
        withCredentials: true,
        headers: {
          'User-Agent': UserAgent,
          origin: Host,
          referer: `${Host}/landing`,
          'x-requested-with': 'XMLHttpRequest',
          'authority': 'my.moneydashboard.com',
          '__requestverificationtoken': this.token
        }
      })
  }

  _get (path) {
    if (!this.token) throw Error('not logged in')
    return axios.get(path, {
      jar: this.cookieJar, // tough.CookieJar or boolean
      withCredentials: true, // If true, send cookie stored in jar
      headers: {
        'User-Agent': UserAgent,
        origin: Host,
        referer: `${Host}/landing`,
        'x-requested-with': 'XMLHttpRequest',
        'authority': 'my.moneydashboard.com',
        '__requestverificationtoken': this.token
      }
    })
  }

  _post (path, body) {
    if (!this.token) throw Error('not logged in')
    return axios.post(path, body, {
      jar: this.cookieJar, // tough.CookieJar or boolean
      withCredentials: true, // If true, send cookie stored in jar
      headers: {
        'User-Agent': UserAgent,
        origin: Host,
        referer: `${Host}/landing`,
        'x-requested-with': 'XMLHttpRequest',
        'authority': 'my.moneydashboard.com',
        '__requestverificationtoken': this.token
      }
    })
  }

  getAccounts () {
    return this._get(`${Host}/api/Account/`)
      .then(resp => resp.data)
      .then(accounts => {
        return accounts.map(account => {
          account.Added = new Date(account.Added)
          account.LastRefreshed = new Date(account.LastRefreshed)
          return account
        })
      })
  }

  async getTransactions (count = 10, startFrom = false) {
    const transactions = this._get(`${Host}/transaction/GetTransactions?limitTo=${count}`)
      .then(resp => resp.data)
      .then(transactions => {
        return transactions.map((t) => {
          const d = t.Date.match(/[0-9]+/)
          t.Date = new Date(parseInt(d[0]))
          return t
        })
      })
    const [transactionList, accountList, tagList] = await Promise.all([transactions, this.getAccounts(), this.getTags()])
    return transactionList.map(transaction => {
      transaction.Account = _.find(accountList, {Id: transaction.AccountId})
      transaction.Tag = _.find(tagList, {TagId: transaction.TagId}) // todo flatten
      return transaction
    })
  }

  getTags () {
    return this._get(`${Host}/TaggingRules/getTags`).then(resp => resp.data)
  }
}

module.exports = MoneyDashboard
