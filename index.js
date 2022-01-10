// Dependencies
const http = require('http')
const { URL, URLSearchParams } = require('url')
const { StringDecoder } = require('string_decoder')
const sanityCheck = require('./lib/sanityChack')
const config = require('./config.js')

// server responses to all request
const server = http.createServer(function(req,res) {

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

    })

  })

})

// start the server
server.listen(config.port, function() {
  console.log(`The server is listening on port ${config.port} in ${config.envName} mode`)
})

// define the handler
const handlers = {}

// sample handler
handlers.sample = function(data, cb) {
  // callback a http status code, and a payload object
  cb(200, {'foo': 'buzz - sample handler'})
}

// not found handler
handlers.notFound = function(data, cb) {
  cb(404)
}

// define request routers
const router = {
  'sample': handlers.sample
}