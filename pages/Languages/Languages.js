export default function get(req, res) {

  const title = `Languages`

  res.render(`Languages/Languages`, {
    [title]: true,
    title,
  })

}
