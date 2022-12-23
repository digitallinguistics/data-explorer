/**
 * These methods are only available in local development.
 */
function login(req, res) {
  res.cookie(process.env.MS_AUTH_COOKIE, process.env.MS_AUTH_USER)
  res.redirect(req.query.post_login_redirect_uri)
}

function logout(req, res) {
  res.clearCookie(process.env.MS_AUTH_COOKIE)
  res.redirect(req.query.post_logout_redirect_uri)
}

export default {
  login,
  logout,
}
