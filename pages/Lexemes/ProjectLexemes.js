import compareLemmas from '../../utilities/compareLemmas.js'
import db            from '../../services/database.js'
import { hasAccess } from '../../utilities/permissions.js'

export default async function get(req, res) {

  const { projectID }     = req.params
  const { data: project } = await db.getProject(projectID)

  if (!project) {
    return res.error(`ItemNotFound`, {
      message: `No project exists with ID <code class=code>${ projectID }</code>.`,
    })
  }

  if (!project.permissions.public && !res.locals.user) {
    return res.error(`Unauthenticated`, {
      message: `You must be logged in to view this project.`,
    })
  }

  if (!hasAccess(res.locals.user, project)) {
    return res.error(`Unauthorized`, {
      message: `You do not have permission to view this project.`,
    })
  }

  const { q } = req.query

  if (q) {
    var { data: lexemes } = await db.searchLexemes(q, { project: projectID })
  } else {
    var { data: lexemes } = await db.getLexemes({ project: projectID })
  }

  lexemes.sort(compareLemmas)

  res.render(`Lexemes/Lexemes`, {
    lexemes,
    Lexemes: true,
    project,
    title:   `Lexemes`,
  })

}
