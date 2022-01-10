// dependencies
const { createHmac } = require('crypto')
const sanityCheck = require("./sanityCheck")
const config = require('../config')

// init helper object
const helpers = {}

// create a SHA256 hash
helpers.hash = function(data) {
  const string = sanityCheck.string(data)

  if (string) {
    return createHmac('sha256', config.hashSecret).update(string).digest('hex')
  } else {
    return false
  }
}

helpers.parseJsonToObject = function(data){
  try {
    const obj = JSON.parse(data)
    return obj
  } catch {
    return {}
  }
}




module.exports = helpers