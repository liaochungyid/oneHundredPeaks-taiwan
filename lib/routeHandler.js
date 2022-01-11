// dependencies
const sanityCheck = require('./sanityCheck')
const fileCRUD = require('./fileCRUD')
const helpers = require('./helpers')

// init handler object
const handlers = {}

// index (home) handler
handlers.index = function(data, cb) {

}

// claims handler
handlers.claims = function (data, cb) {
  const acceptMethods = ['POST','GET','PUT','DELETE']
  if (acceptMethods.indexOf(data.method) > -1) {
    handlers._claims[data.method](data,cb)
  } else {
    cb(405)
  }
}

// container for the claims 
handlers._claims = {}

// claims - POST
// require: email, txn, address, antiPhishingPhrase, tosAgreement
// optional: none
handlers._claims.POST = function(data, cb){

  // check all required fields
  const email = sanityCheck.email(data.payload.email)
  const txn = sanityCheck.string(data.payload.txn)
  const address = sanityCheck.string(data.payload.address)
  const antiPhishingPhrase = sanityCheck.string(data.payload.antiPhishingPhrase)
  const tosAgreement = sanityCheck.boolean(data.payload.tosAgreement)

  if (email &&
    txn &&
    address &&
    antiPhishingPhrase &&
    tosAgreement) {
      // make sure txn does not exist already
      fileCRUD.read('claims', txn, function(err, data){
        if (err) {
          // hash the secret anti-phishing phrase
          const hashedPhrase = helpers.hash(antiPhishingPhrase)

          if (hashedPhrase) {
            // settle the data object
            const dataObject = {
              email,
              txn,
              address,
              hashedPhrase,
              tosAgreement
            }

            // store the data object
            fileCRUD.create('claims', txn, dataObject, function(err){
              if (!err) {
                cb(200)
              } else {
                cb(500, {'Error': 'Could not create the new TXN claim'})
              }
            })

          } else {
            cb(500, {'Error': 'Could not hash the anti-phishing phrase'})
          }

        } else {
          // txn already claimed
          cb(400, {'Error': 'The TXN already claimed'})
        }
      })
    } else {
      cb(400,{'Error': 'Missing required fields'})
    }
}

// claims - GET
// require: txn
// optional: none
// @TODO only authenticated can be access 
handlers._claims.GET = function(data, cb){
  // check the txn is valid
  const txn = sanityCheck.string(data.queryStringObject.get('txn'))

  if (txn) {
    fileCRUD.read('claims', txn, function(err, fileData){
      if (!err && data) {
        // remove the hashed anti-phishing phrase
        delete fileData.hashedPhrase
        cb(200,fileData)
      } else {
        cb(404)
      }
    })
  } else {
    cb(400, {'Error': 'Missing required fields'})
  }
}

// claims - PUT
// required: txn
// optional: email, address, antiPhishingPhrase
// @TODO only authenticated can modify
handlers._claims.PUT = function(data, cb){
  // check required field
  const txn = sanityCheck.string(data.payload.txn)

  // check optional fields
  const email = sanityCheck.email(data.payload.email)
  const address = sanityCheck.string(data.payload.address)
  const antiPhishingPhrase = sanityCheck.string(data.payload.antiPhishingPhrase)
  
  // error if the txn is invalid
  if (txn) {
    // error if nothing is sent to update
    if (email || address || antiPhishingPhrase) {
      // look up the txn file
      fileCRUD.read('claims', txn, function(err, txnData){
        if (!err && txnData) {
          // update the fields if there is
          if (email) { txnData.email = email }
          if (address) { txnData.address = address }
          if (antiPhishingPhrase) {
            txnData.hashedPhrase = helpers.hashedPhrase(antiPhishingPhrase)
          }

          // store the updates
          fileCRUD.update('claims', txn, txnData,function(err){
            if (!err) {
              cb(200)
            } else {
              cb(500, {'Error': 'Could not update the TXN details'})
            }
          })

        } else {
          cb(400, {'Error': 'The TXN does not exist'})
        }
      })
    } else {
      cb(400, {'Error': 'Missing fields to update'})
    }
  } else {
    cb(400, {'Error': 'Missing required field (TXN)'})
  }
}

// claims - DELETE
// required: txn
// optional: none
// @TODO only authenticated can modify
// @TODO cleanup (delete) any file relate to
handlers._claims.DELETE = function(data, cb){
  // check the txn is valid
  const txn = sanityCheck.string(data.queryStringObject.get('txn'))

  if (txn) {
    fileCRUD.read('claims', txn, function(err, fileData){
      if (!err && data) {
        fileCRUD.delete('claims', txn, function(err){
          if (!err) {
            cb(200)
          } else {
            cb(500, {'Error': 'Could not delete the TXN file'})
          }
        })
      } else {
        cb(400, {'Error': 'Could not file the TXN details'})
      }
    })
  } else {
    cb(400, {'Error': 'Missing required fields'})
  }
}

// ping handler
handlers.ping = function(data, cb) {
  cb(200)
}

// not found handler
handlers.notFound = function(data, cb) {
  cb(404)
}

module.exports = handlers