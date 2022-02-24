export default function render(req, res) {
  res.status(500)
  res.send('500 - Server Error')
  res.render(`ServerError/ServerError`)
}
