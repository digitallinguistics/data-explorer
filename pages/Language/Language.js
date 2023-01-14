import db                    from '../../services/database.js'
import getDefaultOrthography from '../../utilities/getDefaultOrthography.js'
import { hasAccess }         from '../../utilities/permissions.js'

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

  if (!hasAccess(res.locals.user, language)) {
    return res.error(`Unauthorized`, {
      message: `You do not have permission to view this language.`,
    })
  }

  const { count }         = await db.count(`Lexeme`, { language: languageID })
  const { data: results } = await db.getMany(`metadata`, `Project`, language.projects)

  const projects = results
  .filter(({ status }) => status === 200)
  .map(({ data }) => data)
  .filter(project => hasAccess(res.locals.user, project))

  res.render(`Language/Language`, {
    language,
    Language:   true,
    numEntries: count,
    projects,
    title:      getDefaultOrthography(language.name) ?? `Language`,
  })

}
