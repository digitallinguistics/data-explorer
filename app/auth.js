/**
 * These methods are only available in local development.
 */

const msAuthCookie = process.env.MS_AUTH_COOKIE
const msAuthUser   = process.env.MS_AUTH_USER

function login(req, res) {
  res.cookie(msAuthCookie, msAuthUser)
  res.redirect(req.query.post_login_redirect_uri)
}

function logout(req, res) {
  res.clearCookie(msAuthCookie)
  res.redirect(req.query.post_logout_redirect_uri)
}

export default {
  login,
  logout,
}
