// dependencies
const fs = require('fs')
const path = require('path')
const fileCRUD = require('../lib/fileCRUD')
const helpers = require('../lib/helpers')

// console.log coloring
const reset = '\033[0m'
const red = '\033[031m'
const green = '\033[32m'
const yellow = '\033[33m'

// seed container
const seed = {}

// number of seeds
seed.seedAmount = 20

seed.baseDir = path.join(__dirname,'/../')

// goto data file, if not exist yet, make one
seed.gotoDataFile = function(){
  console.log(reset,'Direct to data dir ...')
  fs.readdir(seed.baseDir+'data',function(err, dir){
    if (!err && dir) {
      seed.gotoClaimsFile()
    } else {
      console.log(yellow,'Not found data dir, making data dir ...')
      fs.mkdir('data', function(err){
        if (!err) {
          console.log(green,'data dir has been establish')
          seed.gotoClaimsFile()
        } else {
          console.log(red, 'Could not establish the data dir')
        }
      })
    }
  })
}

// goto data/claims file, if not exist yet, make one
seed.gotoClaimsFile = function(){
  fs.readdir(seed.baseDir+'data/claims',function(err, dir){
    console.log(reset,'Direct to claims dir ...')
    if (!err && dir) {
      seed.addSeeds()
    } else {
      console.log(yellow,'Not found claims dir, making claims dir ...')
      fs.mkdir('data/claims', function(err){
        if (!err) {
          console.log(green,'claims dir has been establish')
          seed.addSeeds()
        } else {
          console.log(red, 'Could not establish the claims dir')
        }
      })
    }
  })
}

// data/claims dir settled, then read the seed json file and create seed from it
seed.addSeeds = function() {
  let error = false

  for (let i=1;i<=seed.seedAmount;i++) {
    if (error) { break }

    const email = 'example@example.com'
    const txn = i < 10 ? '0x00000' + i : '0x0000' + i
    const address = i < 10 ? '0x11111' + i : '0x1111' + i
    const antiPhishingPhrase = 'aaaaaa'
    const tosAgreement = true
    const createdAt = Date.now()
    const updatedAt = createdAt

    // hash the anti-phishing phrase
    const hashedPhrase = helpers.hash(antiPhishingPhrase)

    // check all fields, and start to create
    if (email && txn && address && hashedPhrase && tosAgreement && createdAt && updatedAt) {
      // data container
      const data = {email, txn, address, hashedPhrase, tosAgreement, createdAt, updatedAt}
      fileCRUD.create('claims', txn, data, function(err) {
        if (!err && i%10 === 0) {
          console.log(green, `Seed ${i} done (total: ${seed.seedAmount})`)
        } else {
          error = err
        }
      })
    } else {
      error = 'missing required fields to create seeds'
    }
  }

  if (error) { console.log(red, error) }
  
}

seed.init = function() {
  seed.gotoDataFile()
}

seed.init()