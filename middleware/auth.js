import { msAuthCookie, msAuthHeader } from '../constants/index.js'

export default function auth(req, res, next) {

  const authCookie = req.cookies[msAuthCookie]
  res.locals.loggedIn = Boolean(authCookie)

  if (res.locals.loggedIn) {
    res.locals.user = req.get(msAuthHeader)
  }

  next()

}
