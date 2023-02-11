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

  const projectIDs        = language.projects.map(proj => proj.id)
  const { data: results } = await db.getMany(`metadata`, `Project`, projectIDs)

  const projects = results
  .filter(result => result.status === 200)
  .map(({ data }) => data)

  const needsLogin = !projects.some(project => project.permissions.public)

  if (needsLogin && !res.locals.user) {
    return res.error(`Unauthenticated`, {
      message: `You must be logged in to view this language.`,
    })
  }

  const userProjects  = projects.filter(project => hasAccess(res.locals.user, project))
  const userHasAccess = Boolean(userProjects.length)

  if (!userHasAccess) {
    return res.error(`Unauthorized`, {
      message: `You do not have permission to view this language.`,
    })
  }

  const { data: { count } } = await db.count(`Lexeme`, { language: languageID })

  res.render(`Language/Language`, {
    language,
    Language:   true,
    numEntries: count,
    projects:   userProjects, // Only display projects the user has access to.
    title:      getDefaultOrthography(language.name) ?? `Language`,
  })

}
