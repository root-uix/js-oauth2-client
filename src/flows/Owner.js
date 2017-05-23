var OAuth2Client = require('../OAuth2Client')
/**
 * Support resource owner password credentials OAuth 2.0 grant.
 *
 * Reference: http://tools.ietf.org/html/rfc6749#section-4.3
 *
 * @param {ClientOAuth2} client
 */
function OwnerFlow (options, request) {
  Object.getPrototypeOf(OwnerFlow.prototype).constructor.call(this, options, request)
}

OwnerFlow.prototype = Object.create(OAuth2Client.prototype)
OwnerFlow.prototype.constructor = OwnerFlow

/**
 * Make a request on behalf of the user credentials to get an acces token.
 *
 * @param  {string}  username
 * @param  {string}  password
 * @param  {Object}  [opts]
 * @return {Promise}
 */
OwnerFlow.prototype.getToken = function (username, password, opts) {
  var self = this
  var options = Object.assign({}, this.options, opts)

  return self._request({
    url: options.accessTokenUri,
    method: 'POST',
    headers: {
      Authorization: self.Utils.createAuthHeader(options.clientId, options.clientSecret)
    },
    body: {
      scope: self.Utils.sanitizeScope(options.scopes),
      username: username,
      password: password,
      grant_type: 'password'
    }
  }, options)
    .then(function (data) {
      return self.createToken(data)
    })
}

module.exports = Owner = OwnerFlow