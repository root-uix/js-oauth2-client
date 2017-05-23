var OAuth2Client = require('./OAuth2Client')
var FlowAuthorizationCode = require('./flows/AuthorizationCode')
var FlowCredentials = require('./flows/Credentials')
var FlowJwtBearer = require('./flows/JwtBearer')
var FlowOwner = require('./flows/Owner')
var FlowToken = require('./flows/Token')

OAuth2Client.AuthCode = FlowAuthorizationCode
OAuth2Client.Credentials = FlowCredentials
OAuth2Client.JwtBearer = FlowJwtBearer
OAuth2Client.Owner = FlowOwner
OAuth2Client.Implicit = FlowToken

module.exports = OAuth2Client