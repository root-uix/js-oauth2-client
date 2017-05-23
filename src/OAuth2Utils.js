var Querystring = require('querystring')
/**
 * Format error response types to regular strings for displaying to clients.
 *
 * Reference: http://tools.ietf.org/html/rfc6749#section-4.1.2.1
 */
var ERROR_RESPONSES = {
  'invalid_request': 
    'The request is missing a required parameter, includes an' +
    'invalid parameter value, includes a parameter more than' +
    'once, or is otherwise malformed.',
  'invalid_client': 
    'Client authentication failed (e.g., unknown client, no' +
    'client authentication included, or unsupported' +
    'authentication method).',
  'invalid_grant': 
    'The provided authorization grant (e.g., authorization' +
    'code, resource owner credentials) or refresh token is' +
    'invalid, expired, revoked, does not match the redirection' +
    'URI used in the authorization request, or was issued to' +
    'another client.',
  'unauthorized_client': 
    'The client is not authorized to request an authorization' +
    'code using this method.',
  'unsupported_grant_type': 
    'The authorization grant type is not supported by the' +
    'authorization server.',
  'access_denied': 
    'The resource owner or authorization server denied the request.',
  'unsupported_response_type': 
    'The authorization server does not support obtaining' +
    'an authorization code using this method.',
  'invalid_scope': 
    'The requested scope is invalid, unknown, or malformed.',
  'server_error': 
    'The authorization server encountered an unexpected' +
    'condition that prevented it from fulfilling the request.' +
    '(This error code is needed because a 500 Internal Server' +
    'Error HTTP status code cannot be returned to the client' +
    'via an HTTP redirect.)',
  'temporarily_unavailable': 
    'The authorization server is currently unable to handle' +
    'the request due to a temporary overloading or maintenance' +
    'of the server.'
}

function OAuth2Utils(){}

/**
 * Standardize the btoa support to act like the browser
 * 
 * @param {string} string
 * @return {string} - a base64 encoded string.
 */
OAuth2Utils.prototype.btoa = (typeof Buffer === 'function') ?
    (function(str) {
      return new Buffer(str).toString('base64')
    }) : window.btoa

/**
 * Create the Basic Authentication Header needed for Basic Http Auth
 * 
 * @param {string} username - username of the user to authenticate
 * @param {string} password - password of the user to authenticate
 * @return {string}
 */
OAuth2Utils.prototype.createAuthHeader = function(username, password){
  return 'Basic ' + this.btoa(username + ':' + password)
}



/**
 * Create a request uri based on an options object and token type.
 *
 * @param  {Object} options
 * @param  {string} tokenType
 * @return {string}
 */
OAuth2Utils.prototype.createUri = function(options, tokenType) {
  // Check the required parameters are set.
  this.expects(options, 'clientId', 'authorizationUri')

  return options.authorizationUri + '?' + Querystring.stringify(Object.assign({
    client_id: options.clientId,
    redirect_uri: options.redirectUri,
    scope: this.sanitizeScope(options.scopes),
    response_type: tokenType,
    state: options.state
  }, options.query))
}

/**
 * Check if properties exist on an object and throw when they aren't.
 *
 * @throws {TypeError} If an expected property is missing.
 *
 * @param {Object}    obj
 * @param {...string} props
 */
OAuth2Utils.prototype.expects = function(obj){
  for (var i = 1; i < arguments.length; i++) {
    var prop = arguments[i]

    if (obj[prop] == null) {
      throw new TypeError('Expected "' + prop + '" to exist')
    }
  }
}

/**
 * Pull an authentication error from the response data.
 *
 * @param  {Object} data
 * @return {string}
 */
OAuth2Utils.prototype.getAuthError =function(body) {
  var message = ERROR_RESPONSES[body.error] ||
    body.error_description ||
    body.error

  if (message) {
    var err = new Error(message)
    err.body = body
    err.code = 'EAUTH'
    return err
  }
}

/**
 * Attempt to parse response body as JSON, fall back to parsing as a query string.
 *
 * @param {string} body
 * @return {Object}
 */
OAuth2Utils.prototype.parseResponseBody = function(body) {
  try {
    return JSON.parse(body)
  } catch (e) {
    return Querystring.parse(body)
  }
}

/**
 * Sanitize the scopes option to be a string.
 *
 * @param  {Array}  scopes
 * @return {string}
 */
OAuth2Utils.prototype.sanitizeScope = function(scopes) {
  return Array.isArray(scopes) ? scopes.join(' ') : this.toString(scopes)
}

/**
 * Convert a variable to a String
 * 
 * @param {string} str
 * @return {string}
 */
OAuth2Utils.prototype.toString = function(str){
  return (str === null) ? '' : String(str)
}

module.exports = Utils = OAuth2Utils
