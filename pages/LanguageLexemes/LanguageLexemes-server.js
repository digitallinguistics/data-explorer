import compareLemmas      from '../../utilities/compareLemmas.js'
import db                 from '../../config/database.js'
import getDefaultLanguage from '../../utilities/getDefaultLanguage.js'

export default async function get(req, res) {

  const { languageID } = req.params
  const language       = await db.getLanguage(languageID, res.locals.user)
  const languageName   = getDefaultLanguage(language.name, language.defaultAnalysisLanguage)
  const title          = `Lexemes: ${ languageName }`
  const lexemes        = await db.getLanguageLexemes(languageID, res.locals.user)

  // TODO: Return 403 if the user does not have access.

  lexemes.sort(compareLemmas)

  res.render(`Lexemes/Lexemes`, {
    lexemes,
    summaryName: languageName,
    [title]:     true,
    title,
  })

}
