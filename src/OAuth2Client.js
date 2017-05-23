var Utils = require('./OAuth2Utils')
var Token = require('./OAuth2Token')
var DEFAULT_REQUEST = require('./request')

module.exports = OAuth2Client

/**
 * Base OAuth2Client class
 * @param {*} options 
 * @param {*} request 
 */
function OAuth2Client(options, request){
  this.options = options
  this.request = request || DEFAULT_REQUEST
}

OAuth2Client.prototype.Utils = Utils.prototype
OAuth2Client.Token = Token

/**
 * Create a new token from existing data.
 * @param  {Object} [data]
 * @param  {string} [access]
 * @param  {string} [refresh]
 * @param  {string} [type]
 * @return {Object}
 */
OAuth2Client.prototype.createToken = function ( access, refresh, type, data ) {
  var options = Object.assign(
    {},
    data,
    typeof access === 'string' ? { access_token: access } : access,
    typeof refresh === 'string' ? { refresh_token: refresh } : refresh,
    typeof type === 'string' ? { token_type: type } : type
  )
  return new OAuth2Client.Token(this, options)
}

/**
 * Using the built-in request method, we'll automatically attempt to parse
 * the response.
 *
 * @param  {Object}  options
 * @return {Promise}
 */
OAuth2Client.prototype._request = function(request){
  var self = this

  return self.request(request,self.options)
    .then(function(response){
      var body = self.Utils.parseResponseBody(response.body)
      var err = self.Utils.getAuthError(body)
      if(err){
        return Promise.reject(err)
      }
      if(response.status < 200 || response.status >= 399){
        var httpErr = new Error('HTTP(S) Status '+ response.staus)
        httpErr.status = response.status
        httpErr.body = response.body
        httpErr.code = 'ESTATUS'
        return Promise.reject(httpErr)
      }
      return body
  })
}