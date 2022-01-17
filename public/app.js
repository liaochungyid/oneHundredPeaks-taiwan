// container for frontend application
const app = {}

// config
app.config = {
  'antiphishingtoken': false
}

// AJAX Client (for RESTfull api)
app.client = {}

// interface for calling API
app.client.request = function(headers, path, method, queryStringObject, payload, cb) {
  // set default
  headers = typeof(headers) === 'object' && headers !== null ? headers : {}
  path = typeof(path) === 'string' ? path : '/'
  method = typeof(method) === 'string' && ['POST','GET','PUT','DELETE'].indexOf(method) !== -1 ? method : 'GET'
  queryStringObject = typeof(queryStringObject) === 'object' && queryStringObject !== null ? queryStringObject : {}
  payload = typeof(payload) === 'object' && payload !== null ? payload : {}
  cb = typeof(cb) === 'function' ? cb : false

  // for each query string parameters sent, add it to path
  let requestUrl = path + '?'
  let counter = 0
  for (let queryKey in queryStringObject){
    if (queryStringObject.hasOwnProperty(queryKey)) {
      counter++
      // more than one query string, append ampersand
      if (counter > 1) {
        requestUrl += '&'
      }
      // add the key and value
      requestUrl+=queryKey+'='+queryStringObject[queryKey]
    }
  }

  // form the http request as a JSON type
  const xhr = new XMLHttpRequest()
  xhr.open(method, requestUrl, true)
  xhr.setRequestHeader("Content-Type", "application/json")
  
  // for each header sent, add one by one
  for (let headerKey in headers) {
    if (headers.hasOwnProperty(headerKey)) {
      xhr.setRequestHeader(headerKey, headers[headerKey])
    }
  }

  // add token if there is
  if (app.config.antiphishingtoken) {
    xhr.setRequestHeader("antiphishingtoken",app.config.antiphishingtoken)
  }
  
  // wait for response comeback
  xhr.onreadystatechange = function() {
    if (xhr.readyState === XMLHttpRequest.DONE) {
      const statusCode = xhr.status
      const resReturned = xhr.responseText

      // call back, if request
      if (cb) {
        try {
          const parseRes = JSON.parse(resReturned)
          cb(statusCode, parseRes)
        } catch (err) {
          cb(statusCode, false)

        }
      }
    }
  }

  // send the payload as JSON
  const payloadString = JSON.stringify(payload)
  xhr.send(payloadString)
}

// app.client.request(undefined,"\ping","GET",undefined,undefined,function(s,p){console.log(s,p)});
// console.log("Hello world!")