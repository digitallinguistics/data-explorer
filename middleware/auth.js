const msAuthCookie = process.env.MS_AUTH_COOKIE
const msAuthHeader = process.env.MS_AUTH_HEADER
const msAuthUser   = process.env.MS_AUTH_USER

export default function auth(req, res, next) {

  const authCookie = req.cookies[msAuthCookie]
  res.locals.loggedIn = Boolean(authCookie)

  if (process.env.NODE_ENV !== `production` && res.locals.loggedIn) {
    req.headers[msAuthHeader] = authCookie ?? msAuthUser
  }

  if (res.locals.loggedIn) {
    res.locals.user = req.headers[msAuthHeader]
  }

  next()

}
