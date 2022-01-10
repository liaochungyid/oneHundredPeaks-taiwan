// Dependencies
const http = require('http')
const https = require('https')
const fs = require('fs')
const { URL, URLSearchParams } = require('url')
const { StringDecoder } = require('string_decoder')
const sanityCheck = require('./lib/sanityCheck')
const config = require('./config.js')
const fileCRUD = require('./lib/fileCRUD')

// http server responses to all request
const httpServer = http.createServer(function(req,res) {
  unifiedServer(req,res)
})

// https server responses to all request
const httpsServerOption = {
  'key': fs.readFileSync('./https/key.pem'),
  'cert': fs.readFileSync('./https/cert.pem')
}
const httpsServer = https.createServer(httpsServerOption, function(req,res) {
  unifiedServer(req,res)
})

// start http server
httpServer.listen(config.httpPort, function() {
  console.log(`The http server is listening on port ${config.httpPort} in ${config.envName} mode`)
})

// start https server
httpsServer.listen(config.httpsPort, function() {
  console.log(`The https server is listening on port ${config.httpsPort} in ${config.envName} mode`)
})


// all server logic for both http and https server
const unifiedServer = function(req, res){

  // get the headers as an object
  const headers = req.headers

  // get the HTTP Method
  const method = req.method.toUpperCase()

  // get the url and parse
  const constructUrl = new URL(req.url,'http://'+headers.host)

  // get the path
  const path = constructUrl.pathname.replace(/^\/+|\/+$/g,'')

  // get the query string as an object
  const queryStringObject = new URLSearchParams(constructUrl.search)

  // get the payload, if any
  const decoder = new StringDecoder('utf8')
  let buffer = ''
  req.on('data', function(data) {
    buffer += decoder.write(data)
  })
  req.on('end', function(){
    buffer += decoder.end()

    // choose the handle request should go to, if not found, use notFound handler
    const reqHandler = typeof(router[path]) !== 'undefined' ? router[path] : handlers.notFound

    // construct the data object to send to handler
    const data = {
      headers,
      method,
      queryStringObject,
      'payload': buffer
    }

    // route the request to the specified handler
    reqHandler(data, function(statusCode, payload) {
      // use status code called back by the handler, or default to 200
      statusCode = sanityCheck.number(statusCode, 200)

      // use the payload called back by the handler, or default to empty object
      payload = sanityCheck.object(payload, {})

      // convert the payload to a string
      const payloadString = JSON.stringify(payload)

      // return the response
      res.setHeader('Content-Type','application/json')
      res.writeHead(statusCode)
      res.end(payloadString)

      // log the request
      // @TODO delete it after checking
      console.log('request data: ',data)

      // log the response
      // @TODO delete it after checking
      console.log('return statusCode: ', statusCode)
      console.log('return payloadString: ', payloadString)
      console.log('= = = = = = = = = = = = =')

    })

  })

}

// define the handler
const handlers = {}

// ping handler
handlers.ping = function(data, cb) {
  cb(200)
}

// not found handler
handlers.notFound = function(data, cb) {
  cb(404)
}

// define request routers
const router = {
  'ping': handlers.ping
}