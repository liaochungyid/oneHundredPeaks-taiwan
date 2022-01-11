// dependencies
const { createHmac } = require('crypto')
const sanityCheck = require("./sanityCheck")
const config = require('../config')
const path = require('path')
const fs = require('fs')

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

// parse JSON to Object
helpers.parseJsonToObject = function(data){
  try {
    const obj = JSON.parse(data)
    return obj
  } catch {
    return {}
  }
}

// get the string content of the template
helpers.getTemplate = function(viewName, cb) {
  viewName = sanityCheck.string(viewName)

  if (viewName) {
    const viewDir = path.join(__dirname, '/../views/')

    fs.readFile(viewDir+viewName+'.html', 'utf8', function(err, str){
      if (!err && str) {
        cb(false, str)
      } else {
        cb('No template could be found')
      }
    })
  } else {
    cb('Not a valid view name')
  }
}


module.exports = helpers