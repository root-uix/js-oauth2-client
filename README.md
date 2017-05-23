# Client OAuth 2.0

[![NPM version][npm-image]][npm-url]
[![NPM downloads][downloads-image]][downloads-url]
[![Build status][travis-image]][travis-url]

> Extensible es5 first OAuth2 Implementation23 kB in browsers, after minification and gzipping, ~70% from `url` and `querystring` dependencies.

## OAuth Terminology

* **clientId** The client id string assigned to you by the provider
* **clientSecret** The client secret string assigned to you by the provider (not required for `Implicit`)
* **accessTokenUri** The url to request the access token (not required for `Implicit`)
* **authorizationUri** The url to redirect users to authenticate with the provider (only required for `Implicit` and `AuthCode`)
* **redirectUri** A custom url for the provider to redirect users back to your application (only required for `Implicit` and `AuthCode`)
* **scopes** An array of scopes to authenticate against
* **state** Nonce sent back with the redirect when authorization is complete to verify authenticity (should be random for every request)

## Installation

```sh
npm install @ruix/oauth2-client --save
```

## Usage

This module is for use in any browser (IE9+) and the Node V8 engine version >= 0.10.0. Of the ITEF OAuth 2 flows (Authorization Code, Implicit a.k.a "Token", Owner, JwtBearer, and Credentials) are covered.

```javascript
var OAuth2Client = require('@ruix/oauth2-client')

var githubAuth = new OAuth2Client({
  clientId: 'abc',
  clientSecret: '123',
  accessTokenUri: 'https://github.com/login/oauth/access_token',
  authorizationUri: 'https://github.com/login/oauth/authorize',
  redirectUri: 'http://example.com/auth/github/callback',
  scopes: ['notifications', 'gist']
})
```

**TIP** The second argument to the constructor can inject a custom request function.

### Options (global and method-based)

* **clientId** The client id string assigned to you by the provider
* **clientSecret** The client secret string assigned to you by the provider (not required for `Implicit`)
* **accessTokenUri** The url to request the access token (not required for `Implicit`)
* **authorizationUri** The url to redirect users to authenticate with the provider (only required for `Implicit` and `AuthCode`)
* **redirectUri** A custom url for the provider to redirect users back to your application (only required for `Implicit` and `AuthCode`)
* **scopes** An array of scopes to authenticate against
* **state** Nonce sent back with the redirect when authorization is complete to verify authenticity (should be random for every request)

### Request options

* **body** An object to merge with the body of every request
* **query** An object to merge with the query parameters of every request
* **headers** An object to merge with the headers of every request

**TIP** A `createToken` method has been made available on the `OAuth2Client` instance to enable the ability to re-create an access token instance and make requests on behalf the user.

```javascript
// `data` is for any additional raw data for the request.
var token = githubAuth.createToken('access token', 'optional refresh token', 'optional token type', { data: 'raw user data' })

// Set the token Time To Live (TTL).
// token.expiresIn(duration)
token.expiresIn(1234) // Seconds.
token.expiresIn(new Date('2016-11-08')) // Date.

// Refresh users credentials and process them via a Promise
token.refresh().then(newTokenToStore)

// Sign a standard HTTP request object, updating the URL with the access token
// or adding authorization headers, depending on token type ('bearer','authorization',etc)
token.sign({
  method: 'get',
  url: 'https://api.github.com/users'
}) //=> { method, url, headers, ... }
```

**TIP** All authorization methods have a secondary argument (`options`) which is useful for overriding the global configuration at runtime.

### [Authorization Code Grant](http://tools.ietf.org/html/rfc6749#section-4.1)

> The authorization code grant type is used to obtain both access tokens and refresh tokens and is optimized for confidential clients. Since this is a redirection-based flow, the client must be capable of interacting with the resource owner's user-agent (typically a web browser) and capable of receiving incoming requests (via redirection) from the authorization server.

1. Redirect user to `githubAuth.getUri([ options ])`.
2. Parse response uri and get token using `githubAuth.getToken(uri [, options ])`.

```javascript
//Node, Express Example
var express = require('express')
var app = express()

//githubAuth = new OAuth2Client.AuthCode({...})

app.get('/auth/github', function (req, res) {
  var uri = githubAuth.getUri()

  res.redirect(uri)
})

app.get('/auth/github/callback', function (req, res) {
  githubAuth.getToken(req.originalUrl)
    .then(function (user) {
      // user => { accessToken: '...', tokenType: 'bearer', ... }
      user.refresh().then(function (updatedUser) {
        console.log(updatedUser !== user) //=> true
        console.log(updatedUser.accessToken)
      })
      // Sign API requests on behalf of the current user.
      user.sign({
        method: 'get',
        url: 'http://example.com'
      })
      // We should store the token into a database.
      return res.send(user.accessToken)
    })
})
```

**TIP** The URI paremeter on `getToken` can be string matching the URI schema or an object representing a URI with `pathname` and `query` as properties.

### [Implicit Grant](http://tools.ietf.org/html/rfc6749#section-4.2) - a.k.a Token

>  The implicit grant type is used to obtain access tokens (it does not support the issuance of refresh tokens) and is optimized for public clients known to operate a particular redirection URI. These clients are typically implemented in a browser using a scripting language such as JavaScript.

1. Redirect user to `githubAuth.getUri([ options ])`.
2. Parse response uri for the access token using `githubAuth.getToken(uri [, options ])`.

```javascript
// githubAuth = new OAuth2Client.Implicit({...})
window.oauth2Callback = function (uri) {
  githubAuth.getToken(uri)
    .then(function (user) {
      console.log(user) //=> { accessToken: '...', tokenType: 'bearer', ... }

      // Make a request to the github API for the current user.
      return githubAuth.request(user.sign({
        method: 'get',
        url: 'https://api.github.com/user'
      })).then(function (res) {
        console.log(res) //=> { body: { ... }, status: 200, headers: { ... } }
      })
    })
}

// Open the page in a new window, then redirect back to a page that calls our global `oauth2Callback` function.
window.open(githubAuth.getUri())
```
**TIP** The URI paremeter on `getToken` can be string matching the URI schema or an object representing a URI with `pathname`, `query`, `hash` as properties.

### [Resource Owner Password Credentials Grant](http://tools.ietf.org/html/rfc6749#section-4.3)

> The resource owner password credentials grant type is suitable in cases where the resource owner has a trust relationship with the client, such as the device operating system or a highly privileged application.  The authorization server should take special care when enabling this grant type and only allow it when other flows are not viable.

1. Make a direct request for the access token on behalf of the user using `githubAuth.getToken(username, password [, options ])`.

```javascript
// githubAuth = new OAuth2Client.Owner({...})
githubAuth.getToken('WeHaveBeenJammed', 'Luggage1234')
  .then(function (user) {
    console.log(user) //=> { accessToken: '...', tokenType: 'bearer', ... }
  })
```

### [Client Credentials Grant](http://tools.ietf.org/html/rfc6749#section-4.4)

> The client can request an access token using only its client credentials (or other supported means of authentication) when the client is requesting access to the protected resources under its control, or those of another resource owner that have been previously arranged with the authorization server (the method of which is beyond the scope of this specification).

1. Get the access token for the application by using `githubAuth.getToken([ options ])`.

```javascript
// githubAuth = new OAuth2Client.Credentials({...})
githubAuth.getToken()
  .then(function (user) {
    console.log(user) //=> { accessToken: '...', tokenType: 'bearer', ... }
  })
```

### [JWT as Authorization Grant](https://tools.ietf.org/html/draft-ietf-oauth-jwt-bearer-12#section-2.1)

> A JSON Web Token (JWT) Bearer Token can be used to request an access token when a client wishes to utilize an existing trust relationship, expressed through the semantics of (and digital signature or Message Authentication Code calculated over) the JWT, without a direct user approval step at the authorization server.

1. Get the access token for the application by using `githubAuth.getToken(jwt [, options ])`.

```javascript
// githubAuth = new OAuth2Client.JwtBearer({...})
githubAuth.getToken('eyJ0e[..truncated for brevity..]NiJ9.eyJpc3MiOiJP[..truncated for brevity..]3IiXX0.kfUBjdiTyJR[..truncated for brevity..]t_s32g')
  .then(function (user) {
    console.log(user) 
    /* user => {
      "iss": "Online JWT Builder",
      "iat": 1495566648,
      "exp": 1527102648,
      "aud": "www.example.com",
      "sub": "jrocket@example.com",
      "GivenName": "Johnny",
      "Surname": "Rocket",
      "Email": "jrocket@example.com",
      "Role": [
          "Manager",
          "Project Administrator"
      ]
    }*/
  })
```
## Dependencies

Requires an ES5 environment with global `Promise` and `Object.assign` or the use of the Pollyfilled version `var OAuth2Client = require('@ruix/oauth2-client/auto)

## License

ISC
