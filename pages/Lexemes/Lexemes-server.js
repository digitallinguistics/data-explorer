export default function get(req, res) {

  const title = `Lexemes`

  res.render(`Lexemes/Lexemes`, {
    [title]: true,
    title,
  })

}
