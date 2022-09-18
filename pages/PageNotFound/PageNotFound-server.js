export default function get(req, res) {

  if (req.method !== `GET`) {
    res.set(`Allow`, `GET`)
    return res.sendStatus(405)
  }

  res.status(404)

  res.render(`PageNotFound/PageNotFound`, {
    PageNotFound:   true,
    title:        `Page Not Found`,
  })

}
