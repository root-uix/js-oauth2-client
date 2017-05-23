var OAuth2Client = require('../OAuth2Client')
/**
 * Support JSON Web Token (JWT) Bearer Token OAuth 2.0 grant.
 *
 * Reference: https://tools.ietf.org/html/draft-ietf-oauth-jwt-bearer-12#section-2.1
 *
 * @param {ClientOAuth2} client
 */
function JwtBearerFlow (options, request) {
      Object.getPrototypeOf(JwtBearerFlow.prototype).constructor.call(this, options, request)
}

JwtBearerFlow.prototype = Object.create(OAuth2Client.prototype)
JwtBearerFlow.prototype.constructor = JwtBearerFlow
/**
 * Request an access token using a JWT token.
 *
 * @param  {string} token     A JWT token.
 * @param  {Object} [opts]
 * @return {Promise}
 */
JwtBearerFlow.prototype.getToken = function (token, opts) {
  var self = this
  var options = Object.assign({}, this.options, opts)
  var headers = Object.create({})

  self.Utils.expects(options, 'accessTokenUri')

  // Authentication of the client is optional, as described in
  // Section 3.2.1 of OAuth 2.0 [RFC6749]
  if (options.clientId) {
    headers['Authorization'] = self.Utils.createAuthHeader(options.clientId, options.clientSecret)
  }

  return self._request({
    url: options.accessTokenUri,
    method: 'POST',
    headers: headers,
    body: {
      scope: self.Utils.sanitizeScope(options.scopes),
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: token
    }
  }, options)
    .then(function (data) {
      return self.createToken(data)
    })
}

module.exports = JwtBearerFlow
