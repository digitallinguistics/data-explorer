export default function get(req, res) {

  const title = `404`

  res.status(404)
  res.render(`404/404`, {
    [title]: true,
    title,
  })

}
