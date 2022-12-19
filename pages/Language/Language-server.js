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

  const { data: projects } = await db.getProjects()
  const languageProjects   = projects.filter(project => language.projects.includes(project.id) && hasAccess(res.locals.user, project))

  const { data: { count: numEntries } } = await db.getLexemes({ language: languageID, summary: true })

  res.render(`Language/Language`, {
    language,
    Language:   true,
    numEntries,
    projects:   languageProjects,
    title:      getDefaultOrthography(language.name) ?? `Language`,
  })

}
