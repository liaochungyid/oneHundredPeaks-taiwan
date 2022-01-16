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
helpers.getTemplate = function(viewName, data, cb) {
  viewName = sanityCheck.string(viewName)
  data = sanityCheck.object(data)

  if (viewName) {
    const viewDir = path.join(__dirname, '/../views/')

    // get the main template and view
    fs.readFile(viewDir+'main.html', 'utf8', function(err, mainStr){
      if (!err && mainStr) {
        fs.readFile(viewDir+viewName+'.html', 'utf8', function(err, str){
          if (!err && str) {

            // replace {{{ body }}} in main to the specified view
            const fullString = mainStr.replace('{{{ body }}}', str)

            // do interpolate on the string
            const finalString = helpers.interpolate(fullString, data)

            cb(false, finalString)
            
          } else {
            cb('Could not find the specified view')
          }
        })

      } else {
        cb('Could not find the main template')
      }
    })

  } else {
    cb('Not a valid view name')
  }
}

// take specified data to replace the string
helpers.interpolate = function(str, data) {
  str = sanityCheck.string(str)
  data = sanityCheck.object(data)

  // add the template global, replace the key
  for(let keyName in config.templateGlobals) {
    if (config.templateGlobals.hasOwnProperty(keyName)) {
      data['global.'+keyName] = config.templateGlobals[keyName]
    }
  }

  // for each key in the data object, replace it into view
  for(let key in data) {
    if (data.hasOwnProperty(key)  && typeof(data[key]) === 'string') {
      const replace = data[key]
      const find = '{' + key + '}'
      str = str.replace(find, replace)
    }
  }

  return str
}

// get the contents of a static (public) asset
helpers.getStaticAsset = function(fileName, cb) {
  fileName = sanityCheck.string(fileName)

  if (fileName) {
    const publicDir = path.join(__dirname, '/../public/')
    fs.readFile(publicDir+fileName, function(err, data){
      if (!err && data) {
        cb(false, data)
      } else {
        cb('No file could be found')
      }
    })
  } else {
    cb('No valid file name was found')
  }
}

module.exports = helpers