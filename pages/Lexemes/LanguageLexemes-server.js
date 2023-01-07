import compareLemmas from '../../utilities/compareLemmas.js'
import db            from '../../services/database.js'

export default async function get(req, res) {

  const { languageID }     = req.params
  const { data: language } = await db.get(languageID)

  const lexemes  = []

  lexemes.sort(compareLemmas)

  res.render(`Lexemes/Lexemes`, {
    language,
    lexemes,
    Lexemes: true,
    title:   `Lexemes`,
  })

}
