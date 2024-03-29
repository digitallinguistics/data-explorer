import compareLemmas from '../../utilities/compareLemmas.js'
import db            from '../../services/database.js'
import { hasAccess } from '../../utilities/permissions.js'

export default async function get(req, res) {

  const { languageID }     = req.params
  const { data: language } = await db.getLanguage(languageID)

  if (!language) {
    return res.error(`ItemNotFound`, {
      message: `No language exists with ID <code class=code>${ languageID }</code>.`,
    })
  }

  if (!language.permissions.public && !res.locals.user) {
    return res.error(`Unauthenticated`, {
      message: `You must be logged in to view this language.`,
    })
  }

  const hasPermission = hasAccess(res.locals.user, language)

  if (!hasPermission) {
    return res.error(`Unauthorized`, {
      message: `You do not have permission to view this language.`,
    })
  }

  const { q } = req.query

  if (q) {
    var { data: lexemes } = await db.searchLexemes(q, { language: languageID })
  } else {
    var { data: lexemes } = await db.getLexemes({ language: languageID })
  }

  lexemes.sort(compareLemmas)

  res.render(`Lexemes/Lexemes`, {
    language,
    lexemes,
    Lexemes: true,
    q,
    title:   `Lexemes`,
  })

}
