export default function get(req, res) {

  const title = `Design`

  res.render(`Design/Design`, {
    [title]: true,
    title,
  })

}
