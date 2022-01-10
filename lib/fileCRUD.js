// Dependencies

const fs = require('fs')
const path = require('path')

// init the module
const lib = {}

// base directory of the data folder
lib.baseDir = path.join(__dirname,'/../data/')

// CREATE: write data to file
lib.create = function(dir, file, data, cb){
  // open the file for writing
  fs.open(
    lib.baseDir+dir+'/'+file+'.json','wx',
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

module.exports = lib