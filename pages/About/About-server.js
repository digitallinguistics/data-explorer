export default function get(req, res) {

  const title = `About`

  res.render(`About/About`, {
    [title]:  true,
    title,
  })

}
