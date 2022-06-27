import db from '../../config/database.js'

export default async function get(req, res) {

  const languages = await db.getLanguages()
  const language  = languages.find(lang => lang.abbreviation === `chiti`)

  const sampleProjectID = `6a0fcc10-859c-4af1-8105-156ccfd95310`
  const lexemes         = await db.getLexemes(sampleProjectID)
  const [lexeme]        = lexemes

  const title         = `Design`
  const { component } = req.params

  res.render(`Design/Design`, {
    [component]: true,
    language,
    lexeme,
    lexemes,
    [title]:     true,
    title,
  })

}
