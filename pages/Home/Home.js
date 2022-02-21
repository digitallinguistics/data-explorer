export default function get(req, res) {

  const title = `Home`

  res.render(`Home/Home`, {
    [title]:  true,
    title,
  })

}
