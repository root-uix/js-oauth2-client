var Utils = require('./OAuth2Utils')
/**
 * General purpose client token generator.
 *
 * @param {Object} client
 * @param {Object} data
 */
function OAuth2Token (client, data) {
  this.client = client
  this.data = data
  this.tokenType = data.token_type && data.token_type.toLowerCase()
  this.accessToken = data.access_token || ''
  this.refreshToken = data.refresh_token || ''

  this.expiresIn(Number(data.expires_in))
}

/**
 * Expire the token after some time.
 *
 * @param  {number|Date} duration Seconds from now to expire, or a date to expire on.
 * @return {Date}
 */
OAuth2Token.prototype.expiresIn = function (duration) {
  if (typeof duration === 'number') {
    this.expires = new Date()
    this.expires.setSeconds(this.expires.getSeconds() + duration)
  } else if (duration instanceof Date) {
    this.expires = new Date(duration.getTime())
  } else {
    throw new TypeError('Unknown duration: ' + duration)
  }

  return this.expires
}

/**
 * Sign a standardised request object with user authentication information.
 *
 * @param  {Object} requestObject
 * @return {Object}
 */
OAuth2Token.prototype.sign = function (requestObject) {
  if (!this.accessToken) {
    throw new Error('Unable to sign without access token')
  }

  requestObject.headers = requestObject.headers || {}
  if (this.tokenType === 'bearer') {
    requestObject.headers.Authorization = 'Bearer ' + this.accessToken
  } else {
    var parts = requestObject.url.split('#')
    var token = 'access_token=' + this.accessToken
    var url = parts[0].replace(/[?&]access_token=[^&#]/, '')
    var fragment = parts[1] ? '#' + parts[1] : ''

    // Prepend the correct query string parameter to the url.
    requestObject.url = url + (url.indexOf('?') > -1 ? '&' : '?') + token + fragment

    // Attempt to avoid storing the url in proxies, since the access token
    // is exposed in the query parameters.
    requestObject.headers.Pragma = 'no-store'
    requestObject.headers['Cache-Control'] = 'no-store'
  }
  return requestObject
}

/**
 * Refresh a user access token with the supplied token.
 *
 * @param  {Object}  opts
 * @return {Promise}
 */
OAuth2Token.prototype.refresh = function (opts) {
  var self = this
  var options = Object.assign({}, self.client.options, opts)

  if (!this.refreshToken) {
    return Promise.reject(new Error('No refresh token'))
  }
  return self.client._request({
    url: options.accessTokenUri,
    method: 'POST',
    headers: {
      Authorization: self.client.Utils.createAuthHeader(options.clientId, options.clientSecret)
    },
    body: {
      refresh_token: self.refreshToken,
      grant_type: 'refresh_token'
    }
  }, options)
    .then(function (data) {
      return self.client.createToken(Object.assign({}, self.data, data))
    })
}

/**
 * Check whether the token has expired.
 *
 * @return {boolean}
 */
OAuth2Token.prototype.expired = function () {
  return Date.now() > this.expires.getTime()
}

module.exports = Token = OAuth2Token