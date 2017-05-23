var Querystring = require('querystring')

var DEFAULT_HEADERS = {
  'Accept': 'application/json, application/x-www-form-urlencoded',
  'Content-Type': 'application/x-www-form-urlencoded'
}
/**
 * This is to make a generic NodeJS Request
 * @param {object} request - Object that contains key parameters (method, url, body, headers, ...)
 * @return {Promise}
 */
function _httpRequest (request) {
  var popsicle = require('popsicle')
  return popsicle
    .get({
      url: request.url,
      body: request.body,
      method: request.method,
      headers: Object.assign({}, DEFAULT_HEADERS, request.headers)
    })
    .then(function (res) {
      return {
        status: res.status,
        body: res.body
      }
    })
}
/**
 * This is to make a XHR Browser Request
 * @param {object} request - Object that contains key parameters (method, url, body, headers, ...)
 * @return {Promise}
 */
function _xhrRequest (request, resolve, reject) {
  var xhr = new window.XMLHttpRequest()
  xhr.open(request.method, request.url)
  xhr.onload = function () {
    return resolve({
      status: xhr.status,
      body: xhr.responseText
    })
  }
  xhr.onerror = xhr.onabort = function () {
    return reject(new Error(xhr.statusText || 'XHR aborted: ' + request.url))
  }
  var headers = Object.assign({}, DEFAULT_HEADERS, request.headers)
  Object.keys(headers).forEach(function (header) {
    xhr.setRequestHeader(header, headers[header])
  })
  xhr.send(request.body)
}

module.exports = function request (request, options) {
  var opts = {
    url: request.url,
    method: request.method,
    body: Querystring.stringify(Object.assign({}, request.body, options.body)),
    query: Object.assign({}, request.query, options.query),
    headers: Object.assign({}, request.headers, options.headers)
  }
  if(opts.query){
    opts.url += (opts.url.indexOf('?') === -1 ? '?':'&')+ Querystring.stringify(opts.query)
  }
  if (
    typeof process !== 'undefined' &&
    typeof process.versions.node !== 'undefined'
  ) {
    return _httpRequest(opts)
  }
  return new Promise(function (resolve, reject) {
    _xhrRequest(opts, resolve, reject)
  })
}
