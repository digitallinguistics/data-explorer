import { msAuthCookie } from '../constants/index.js'

export default function auth(req, res, next) {
  const authCookie = req.cookies[msAuthCookie]
  res.locals.loggedIn = Boolean(authCookie)
  next()
}
