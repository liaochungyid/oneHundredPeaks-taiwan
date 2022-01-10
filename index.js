// Dependencies
const http = require('http')
const { URL, URLSearchParams } = require('url')
const { StringDecoder } = require('string_decoder')

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

    // send the response
    res.end('<h1>Hello world!</h1>')

    // log the request
    console.log('headers: ',headers)
    console.log('method: ', method)
    console.log('path: ', path)
    console.log('queryStringObject: ', queryStringObject)
    console.log('buffer: ', buffer)
  })

})

server.listen(3000, '127.0.0.1', function() {
  console.log('The server is listening on port 3000 now')
})