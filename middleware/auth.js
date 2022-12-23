export default function auth(req, res, next) {

  const authCookie = req.cookies[process.env.MS_AUTH_COOKIE]

  res.locals.loggedIn = Boolean(authCookie)

  if (process.env.NODE_ENV !== `production` && res.locals.loggedIn) {
    req.headers[process.env.MS_AUTH_HEADER] = authCookie ?? process.env.MS_AUTH_USER
  }

  if (res.locals.loggedIn) {
    res.locals.user = req.headers[process.env.MS_AUTH_HEADER]
  }

  next()

}
