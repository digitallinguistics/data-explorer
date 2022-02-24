export default function render(req, res) {
  res.status(404)
  res.render(`error404/error404`)
}
