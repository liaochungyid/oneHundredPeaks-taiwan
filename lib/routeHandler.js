// dependencies
const sanityCheck = require('./sanityCheck')
const fileCRUD = require('./fileCRUD')
const helpers = require('./helpers')

// init handler object
const handlers = {}

/*
 * HTML Handlers
 *
 */

// index (home) handler
handlers.home = function(data, cb) {
  // reject all methods except GET
  if (data.method === 'GET') {
    // data for interpolating
    const templateData = {
      'head.title': 'Home',
      'head.description': 'One Hundred Peaks in Taiwan',
    }

    // read view as a string
    helpers.getTemplate('home', templateData, function(err, str){
      if (!err && str) {
        cb(200, str, 'html')
      } else {
        cb(500, undefined, 'html')
      }
    })

  } else {
    cb(405)
  }
}

// claimList page handler
handlers.arcade = function(data, cb) {
  // reject all methods except GET
  if (data.method === 'GET') {
    // data for interpolating
    const templateData = {
      'head.title': 'Arcade',
      'head.description': 'Mint it yourself',
      'if.query.section.mint': !data.queryStringObject.get('section-mint') ? '' : data.queryStringObject.get('section-mint'),
      'if.query.section.description': !data.queryStringObject.get('section-description') ? '' : data.queryStringObject.get('section-description'),
      'if.query.section.pick': !data.queryStringObject.get('section-pick') ? '' : data.queryStringObject.get('section-pick')
    }

    // read view as a string
    helpers.getTemplate('arcade', templateData, function(err, str){
      if (!err && str) {
        cb(200, str, 'html')
      } else {
        cb(500, undefined, 'html')
      }
    })

  } else {
    cb(405)
  }
}

  // 'session/create': handlers.createSession,
  // 'session/delete' : handlers.deleteSession,

// favicon
handlers.favicon = function(data, cb) {
  // reject all methods except GET
  if (data.method === 'GET') {
    // read the favicon data
    helpers.getStaticAsset('favicon.ico', function(err, data) {
      if (!err && data) {
        cb(200, data, 'favicon')
      } else {
        cb(500)
      }
    })
  } else {
    cb(405)
  }
}

// public asset
handlers.public = function(data, cb) {
  // reject all methods except GET
  if (data.method === 'GET') {
    // get the filename
    const assetName = data.path.replace('public/', '').trim()
    if (assetName.length > 0) {
      // read the asset data
      helpers.getStaticAsset(assetName, function(err, assetData){
        if (!err && assetData) {
          // determine the content type (default: text)
          let contentType = 'plain'

          if (assetName.indexOf('.css') > -1) {
            contentType = 'css'
          }

          if (assetName.indexOf('.png') > -1) {
            contentType = 'png'
          }
          
          if (assetName.indexOf('.jpg') > -1) {
            contentType = 'jpg'
          }
          
          if (assetName.indexOf('.ico') > -1) {
            contentType = 'favicon'
          }

          if (assetName.indexOf('.js')  > -1) {
            contentType = 'js'
          }

          cb(200, assetData, contentType)
          
        } else {
          cb(404)
        }
      })
    } else {
      cb(404)
    }
  } else {
    cb(405)
  }
}

/*
 * JSON API Handlers
 *
 */

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
handlers._claims.GET = function(data, cb){
  // check the txn is valid
  const txn = sanityCheck.string(data.queryStringObject.get('txn'))

  // get antiPhishingPhrase from the headers
  const antiPhishingToken = sanityCheck.string(data.headers.antiphishingtoken)

  // verify the token
  handlers._verifyPhrase(antiPhishingToken, txn, function(isTokenValid){
    if (isTokenValid) {

      // lookup TXN detail
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

    } else {
      cb(403, {'Error': 'Invalid required token in header'})
    }
  })
}

// claims - PUT
// required: txn
// optional: email, address, antiPhishingPhrase
handlers._claims.PUT = function(data, cb){
  // check required field
  const txn = sanityCheck.string(data.payload.txn)

  // check optional fields
  const email = sanityCheck.email(data.payload.email)
  const address = sanityCheck.string(data.payload.address)
  const antiPhishingPhrase = sanityCheck.string(data.payload.antiPhishingPhrase)
  
  // get antiPhishingPhrase from the headers
  const antiPhishingToken = sanityCheck.string(data.headers.antiphishingtoken)

  // verify the token
  handlers._verifyPhrase(antiPhishingToken, txn, function(isTokenValid){
    if (isTokenValid) {

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

    } else {
      cb(403, {'Error': 'Invalid required token in header'})
    }
  })

}

// claims - DELETE
// required: txn
// optional: none
// @TODO cleanup (delete) any file relate to
handlers._claims.DELETE = function(data, cb){
  // check the txn is valid
  const txn = sanityCheck.string(data.queryStringObject.get('txn'))

  // get antiPhishingPhrase from the headers
  const antiPhishingToken = sanityCheck.string(data.headers.antiphishingtoken)

  // verify the token
  handlers._verifyPhrase(antiPhishingToken, txn, function(isTokenValid){
    if (isTokenValid) {

      // error if the txn is invalid
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

    } else {
      cb(403, {'Error': 'Invalid required token in header'})
    }
  })

}

// verified if a given antiPhishingPhrase is valid for given TXN
handlers._verifyPhrase = function(antiPhishingToken, txn, cb) {
  // lookup the TXN
  fileCRUD.read('claims', txn, function(err, data){
    if (!err && data) {
      // check the antiPhishingPhrase is for given TXN
      if (antiPhishingToken === data.hashedPhrase) {
        cb(true)
      } else {
        cb(false)
      }
    } else {
      cb(false)
    }
  })
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