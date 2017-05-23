var Url = require('url')
var OAuth2Client = require('../OAuth2Client')
/**
 * Support authorization code OAuth 2.0 grant.
 *
 * Reference: http://tools.ietf.org/html/rfc6749#section-4.1
 *
 *
 */
function AuthorizationCodeFlow (options, request) {
  Object.getPrototypeOf(AuthorizationCodeFlow.prototype).constructor.call(this, options, request)
}
AuthorizationCodeFlow.prototype = Object.create(OAuth2Client.prototype)
AuthorizationCodeFlow.prototype.constructor = AuthorizationCodeFlow

/**
 * Generate the uri for doing the first redirect.
 *
 * @param  {Object} [opts]
 * @return {string}
 */
AuthorizationCodeFlow.prototype.getUri = function (opts) {
  var options = Object.assign({}, this.options, opts)

  return this.Utils.createUri(options, 'code')
}

/**
 * Get the code token from the redirected uri and make another request for
 * the user access token.
 *
 * @param  {string|Object} uri
 * @param  {Object}        [opts]
 * @return {Promise}
 */
AuthorizationCodeFlow.prototype.getToken = function (uri, opts) {
  var self = this
  var options = Object.assign({}, self.options, opts)

  self.Utils.expects(options, 'clientId', 'accessTokenUri')

  var url = typeof uri === 'object' ? uri : Url.parse(uri, true)

  if (
    typeof options.redirectUri === 'string' &&
    typeof url.pathname === 'string' &&
    url.pathname !== Url.parse(options.redirectUri).pathname
  ) {
    return Promise.reject(
      new TypeError('Redirected path should match configured path, but got: ' + url.pathname)
    )
  }

  if (!url.query) {
    return Promise.reject(new TypeError('Unable to process uri: ' + uri))
  }

  var data = typeof url.query === 'string' ? Querystring.parse(url.query) : (url.query || {})
  var err = self.Utils.getAuthError(data)

  if (err) {
    return Promise.reject(err)
  }

  if (options.state != null && data.state !== options.state) {
    return Promise.reject(new TypeError('Invalid state: ' + data.state))
  }

  // Check whether the response code is set.
  if (!data.code) {
    return Promise.reject(new TypeError('Missing code, unable to request token'))
  }

  var headers = Object.create(Object.prototype)
  var body = { code: data.code, grant_type: 'authorization_code', redirect_uri: options.redirectUri }

  // `client_id`: REQUIRED, if the client is not authenticating with the
  // authorization server as described in Section 3.2.1.
  // Reference: https://tools.ietf.org/html/rfc6749#section-3.2.1
  if (options.clientSecret) {
    headers.Authorization = self.Utils.createAuthHeader(options.clientId, options.clientSecret)
  } else {
    body.client_id = options.clientId
  }
  return self._request({
    url: options.accessTokenUri,
    method: 'POST',
    headers: headers,
    body: body
  }, options)
    .then(function (data) {
      return self.createToken(data)
    })
}

module.exports = AuthorizationCodeFlow