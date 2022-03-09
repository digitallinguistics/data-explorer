export default function get(req, res) {

  const title = `Projects`

  res.render(`Projects/Projects`, {
    [title]:  true,
    title,
  })

}
