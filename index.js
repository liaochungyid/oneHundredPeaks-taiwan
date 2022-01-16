// Dependencies
const http = require('http')
const https = require('https')
const fs = require('fs')
const { URL, URLSearchParams } = require('url')
const { StringDecoder } = require('string_decoder')
const handlers = require('./lib/routeHandler')
const sanityCheck = require('./lib/sanityCheck')
const config = require('./config.js')
const helpers = require('./lib/helpers')

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
    let reqHandler = typeof(router[path]) !== 'undefined' ? router[path] : handlers.notFound

    // if the path contains public/ , use the public handler
    reqHandler = path.indexOf('public/') > -1 ? handlers.public : reqHandler 

    // construct the data object to send to handler
    const data = {
      path,
      headers,
      method,
      queryStringObject,
      'payload': helpers.parseJsonToObject(buffer)
    }

      // route the request to the specified handler
    reqHandler(data, function(statusCode, payload, contentType) {
      // determine the type of response (default: JSON)
      contentType = sanityCheck.string(contentType, 'json')

      // use status code called back by the handler, or default to 200
      statusCode = sanityCheck.number(statusCode, 200)

      // return the response-parts that are content-specific
      let payloadString = ''
      if (contentType === 'json') {
        res.setHeader('Content-Type','application/json')
        // use the payload called back by the handler, or default to empty object
        payload = sanityCheck.object(payload, {})
        // convert the payload to a string
        payloadString = JSON.stringify(payload)
      }

      if (contentType === 'html') {
        res.setHeader('Content-Type','text/html')
        payloadString = sanityCheck.string(payload, '')
      }

      if (contentType === 'favicon') {
        res.setHeader('Content-Type','image/x-icon')
        payloadString = sanityCheck.notFalsy(payload)
      }

      if (contentType === 'css') {
        res.setHeader('Content-Type','text/css')
        payloadString = sanityCheck.notFalsy(payload)
      }

      if (contentType === 'png') {
        res.setHeader('Content-Type','image/png')
        payloadString = sanityCheck.notFalsy(payload)
      }

      if (contentType === 'jpg') {
        res.setHeader('Content-Type','image/jpeg')
        payloadString = sanityCheck.notFalsy(payload)
      }

      if (contentType === 'plain') {
        res.setHeader('Content-Type','text/plain')
        payloadString = sanityCheck.notFalsy(payload)
      }

      if (contentType === 'js') {
        res.setHeader('Content-Type','application/javascript')
        payloadString = sanityCheck.notFalsy(payload)
      }

      // return the response-parts that are common to all content-types
      res.writeHead(statusCode)
      res.end(payloadString)

      // log the request
      // @TODO delete it after checking
      // console.log('request data: ',data)

      // log the response
      // @TODO delete it after checking
      // console.log('return statusCode: ', statusCode)
      // console.log('return payloadString: ', payloadString)
      // console.log('= = = = = = = = = = = = =')

    })

  })

}

// define request routers
const router = {
  '': handlers.home,
  'claim/create': handlers.postClaim,
  'claim/edit': handlers.putClaim,
  'claim/delete': handlers.deleteClaim,
  'session/create': handlers.createSession,
  'session/delete' : handlers.deleteSession,
  'arcade': handlers.arcade,
  'ping': handlers.ping,
  'api/claim': handlers.claims,
  'favicon.ico': handlers.favicon
}