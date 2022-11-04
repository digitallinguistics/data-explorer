/**
 * These methods are only available in local development.
 */

import { msAuthCookie } from '../constants/index.js'

function login(req, res) {
  res.cookie(msAuthCookie, `owner@digitallinguistics.io`)
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
