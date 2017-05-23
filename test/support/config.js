exports.accessTokenUri = 'http://localhost:' + process.env.PORT + '/oauth/access_token'
exports.authorizationUri = 'http://localhost:' + process.env.PORT + '/oauth/authorize'
exports.redirectUri = 'http://example.com/oauth/callback'

exports.accessToken = '4430eb16f4f6577c0f3a15fb6127cbf828a8e403'
exports.refreshToken = exports.accessToken.split('').reverse().join('')
exports.refreshAccessToken = 'refresh18219'
exports.refreshRefreshToken = exports.refreshAccessToken.split('').reverse().join('')
exports.testRefreshAccessToken = 'refresh18219'

exports.clientId = 'ruix'
exports.clientSecret = '18219'

exports.code = 'rI82i9'
exports.state = 'rUix18219'

exports.jwt = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJPbmxpbmUgSldUIEJ1aWxkZXIiLCJpYXQiOjE0OTU1NjY2NDgsImV4cCI6MTUyNzEwMjY0OCwiYXVkIjoid3d3LmV4YW1wbGUuY29tIiwic3ViIjoianJvY2tldEBleGFtcGxlLmNvbSIsIkdpdmVuTmFtZSI6IkpvaG5ueSIsIlN1cm5hbWUiOiJSb2NrZXQiLCJFbWFpbCI6Impyb2NrZXRAZXhhbXBsZS5jb20iLCJSb2xlIjpbIk1hbmFnZXIiLCJQcm9qZWN0IEFkbWluaXN0cmF0b3IiXX0.kfUBjdiTyJRUJlOF7R9KXZm-870RAjxio6B5Ct_s32g'

exports.username = 'WeHaveBeenJammed'
exports.password = 'Luggage1234'
