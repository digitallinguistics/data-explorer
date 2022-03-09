export default function get(req, res) {

  const title = `Dictionaries`

  res.render(`Dictionaries/Dictionaries`, {
    [title]:  true,
    title,
  })

}
