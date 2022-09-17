export default function get(req, res) {

  res.status(404)
  res.render(`404/404`, {
    404:   true,
    title: `Not Found`,
  })

}
