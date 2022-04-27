export default function get(req, res) {

  const title         = `Design`
  const { component } = req.params

  res.render(`Design/Design`, {
    [component]: true,
    [title]:     true,
    title,
  })

}
