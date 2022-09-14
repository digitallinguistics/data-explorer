import { env } from '../config/app.js'
import { msAuthCookie, msAuthHeader, msAuthUser } from '../constants/index.js'

export default function auth(req, res, next) {

  const authCookie = req.cookies[msAuthCookie]
  res.locals.loggedIn = Boolean(authCookie)

  if (env === `localhost` && res.locals.loggedIn) {
    req.headers[msAuthHeader] = authCookie ?? msAuthUser
  }

  if (res.locals.loggedIn) {
    res.locals.user = req.headers[msAuthHeader]
  }

  next()

}
