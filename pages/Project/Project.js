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

  const { data: languages } = await db.getLanguages({ project: projectID })
  const { count }           = await db.count(`Lexeme`, { project: projectID })
  const { owners, editors } = project.permissions

  const numCollaborators = new Set([...owners, ...editors]).size

  res.render(`Project/Project`, {
    languages,
    numCollaborators,
    numLanguages: languages.length,
    numLexemes:   count,
    project,
    Project:      true,
    title:        project.name,
  })

}
