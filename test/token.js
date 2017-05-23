/* global describe, it */
var expect = require('chai').expect
var config = require('./support/config')
var ClientOAuth2 = require('../src')

describe('token', function () {
  var uri = config.redirectUri + '#access_token=' + config.accessToken + '&token_type=bearer'

  var githubAuth = new ClientOAuth2.Implicit({
    clientId: config.clientId,
    authorizationUri: config.authorizationUri,
    authorizationGrants: ['token'],
    redirectUri: config.redirectUri,
    scopes: ['notifications']
  })

  describe('#getUri', function () {
    it('should return a valid uri', function () {
      expect(githubAuth.getUri()).to.equal(
        config.authorizationUri + '?client_id=ruix&' +
        'redirect_uri=http%3A%2F%2Fexample.com%2Foauth%2Fcallback&' +
        'scope=notifications&response_type=token&state='
      )
    })
  })

  describe('#getToken', function () {
    it('should parse the token from the response', function () {
      return githubAuth.getToken(uri)
        .then(function (user) {
          expect(user).to.an.instanceOf(ClientOAuth2.Token)
          expect(user.accessToken).to.equal(config.accessToken)
          expect(user.tokenType).to.equal('bearer')
        })
    })

    describe('#sign', function () {
      it('should be able to sign a standard request object', function () {
        return githubAuth.getToken(uri)
          .then(function (token) {
            var obj = token.sign({
              method: 'GET',
              url: 'http://api.github.com/user'
            })

            expect(obj.headers.Authorization).to.equal('Bearer ' + config.accessToken)
          })
      })
    })
  })
})
