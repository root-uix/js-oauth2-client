var Url = require('url')
var Querystring = require('querystring')
var OAuth2Client = require('../OAuth2Client')
/**
 * Support implicit OAuth 2.0 grant.
 *
 * Reference: http://tools.ietf.org/html/rfc6749#section-4.2
 *
 * @param {ClientOAuth2} client
 */
function TokenFlow (options, request) {
    Object.getPrototypeOf(TokenFlow.prototype).constructor.call(this, options, request)
}
TokenFlow.prototype = Object.create(OAuth2Client.prototype)
TokenFlow.prototype.constructor = TokenFlow

/**
 * Get the uri to redirect the user to for implicit authentication.
 *
 * @param  {Object} [opts]
 * @return {string}
 */
TokenFlow.prototype.getUri = function (opts) {
  var options = Object.assign({}, this.options, opts)

  return this.Utils.createUri(options, 'token')
}

/**
 * Get the user access token from the uri.
 *
 * @param  {string|Object} uri
 * @param  {Object}        [opts]
 * @return {Promise}
 */
TokenFlow.prototype.getToken = function (uri, opts) {
  var options = Object.assign({}, this.options, opts)
  var url = typeof uri === 'object' ? uri : Url.parse(uri, true)
  var expectedUrl = Url.parse(options.redirectUri)

  if (typeof url.pathname === 'string' && url.pathname !== expectedUrl.pathname) {
    return Promise.reject(
      new TypeError('Redirected path should match configured path, but got: ' + url.pathname)
    )
  }

  // If no query string or fragment exists, we won't be able to parse
  // any useful information from the uri.
  if (!url.hash && !url.query) {
    return Promise.reject(new TypeError('Unable to process uri: ' + uri))
  }

  // Extract data from both the fragment and query string. The fragment is most
  // important, but the query string is also used because some OAuth 2.0
  // implementations (Instagram) have a bug where state is passed via query.
  var data = Object.assign(
    {},
    typeof url.query === 'string' ? Querystring.parse(url.query) : (url.query || {}),
    typeof url.hash === 'string' ? Querystring.parse(url.hash.substr(1)) : (url.hash || {})
  )

  var err = this.Utils.getAuthError(data)

  // Check if the query string was populated with a known error.
  if (err) {
    return Promise.reject(err)
  }

  // Check whether the state matches.
  if (options.state != null && data.state !== options.state) {
    return Promise.reject(new TypeError('Invalid state: ' + data.state))
  }

  // Initalize a new token and return.
  return Promise.resolve(this.createToken(data))
}

module.exports = TokenFlow