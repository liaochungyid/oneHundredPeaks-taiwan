// Dependencies

const fs = require('fs')
const path = require('path')
const helpers = require('./helpers')

// init the module
const lib = {}

// base directory of the data folder
lib.baseDir = path.join(__dirname,'/../data/')

// CREATE: write data to file
lib.create = function(dir, file, data, cb){
  // open the file for writing
  fs.open(
    lib.baseDir+dir+'/'+file+'.json',
    'wx',
    function(err, fileDescriptor){
      if(!err && fileDescriptor){
        // convert data to string
        const stringData = JSON.stringify(data)

        // write to file and close it
        fs.writeFile(fileDescriptor, stringData, function(err){
          if(!err) {
            fs.close(fileDescriptor, function(err){
              if (!err) {
                cb(false)
              } else {
                cb('Error closing new file')
              }
            })
          } else {
            cb('Error writing to new file')
          }
        })
      } else {
        cb('Could not create new file, it may already exist')
      }
  })
}

// READ: read data to file
lib.read = function(dir, file, cb){
  fs.readFile(
    lib.baseDir+dir+'/'+file+'.json',
    'utf-8',
    function(err, data){
      if (!err && data) {
        const parseData = helpers.parseJsonToObject(data)
        cb(false, parseData)
      } else {
        cb(err, data)
      }
    })
}

// UPDATE: update data inside a file
lib.update = function(dir, file, data, cb){
  fs.open(
    lib.baseDir+dir+'/'+file+'.json',
    'r+',
    function(err, fileDescriptor){
      if (!err && fileDescriptor) {
        // convert data to string
        const stringData = JSON.stringify(data)

        // truncate the file
        fs.ftruncate(fileDescriptor, function(err){
          if (!err) {
            // write to the file and close it
            fs.writeFile(fileDescriptor, stringData, function(err){
              if (!err) {
                fs.close(fileDescriptor, function(err){
                  if (!err) {
                    cb(false)
                  } else {
                    cb('Error closing the file')
                  }
                })
              } else {
                cb('Error updating the file')
              }
            })
          } else {
            cb('Error truncating the file')
          }
        })

      } else {
        cb('Could not open the file for updating, it may not exist')
      }
    }
  )
}

// DELETE: delete the file
lib.delete = function(dir, file, cb){
  // unlink the file
  fs.unlink(lib.baseDir+dir+'/'+file+'.json', function(err){
    if (!err) {
      cb(false)
    } else {
      cb('Error deleting the file')
    }
  })
}

module.exports = lib