var OAuth2Client = require('../OAuth2Client')
/**
 * Support client credentials OAuth 2.0 grant.
 *
 * Reference: http://tools.ietf.org/html/rfc6749#section-4.4
 *
 * @param {ClientOAuth2} client
 */
function CredentialsFlow (options,request) {
    Object.getPrototypeOf(CredentialsFlow.prototype).constructor.call(this, options, request)
}
CredentialsFlow.prototype = Object.create(OAuth2Client.prototype)
CredentialsFlow.prototype.constructor = CredentialsFlow

/**
 * Request an access token using the client credentials.
 *
 * @param  {Object}  [opts]
 * @return {Promise}
 */
CredentialsFlow.prototype.getToken = function (opts) {
  var self = this
  var options = Object.assign({}, self.options, opts)

  self.Utils.expects(options, 'clientId', 'clientSecret', 'accessTokenUri')
  return self._request({
    url: options.accessTokenUri,
    method: 'POST',
    headers: {
      Authorization: self.Utils.createAuthHeader(options.clientId, options.clientSecret)
    },
    body: {
      scope: self.Utils.sanitizeScope(options.scopes),
      grant_type: 'client_credentials'
    }
  }, options)
    .then(function (data) {
      return self.createToken(data)
    })
}

module.exports = Credentials = CredentialsFlow
