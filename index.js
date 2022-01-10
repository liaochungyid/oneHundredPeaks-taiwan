const http = require('http')

const server = http.createServer(function(req,res) {
  res.end('<h1>Hello world!</h1>')
})

server.listen(3000, '127.0.0.1', function() {
  console.log('The server is listening on port 3000 now')
})