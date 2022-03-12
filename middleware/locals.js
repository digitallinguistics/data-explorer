export default function locals(req, res, next) {
  res.locals.originalURL = req.originalUrl.includes(`.auth`) ? `/` : req.originalUrl
  next()
}
