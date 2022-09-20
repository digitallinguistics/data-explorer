import db        from '../../config/database.js'
import hasAccess from '../../utilities/hasAccess.js'

export default async function get(req, res) {

  const { projectID }     = req.params
  const { data: project } = await db.getProject(projectID)

  if (!project) return res.error(`ItemNotFound`)
  if (!project.permissions.public && !res.locals.user) return res.error(`Unauthenticated`)
  if (!hasAccess(res.locals.user, project)) return res.error(`Unauthorized`)

  const { data: languages } = await db.getLanguages({ project: projectID })
  const { owners, editors } = project.permissions

  const numCollaborators = new Set([...owners, ...editors]).size
  let   numLexemes       = 0

  for (const language of languages) {

    const lexemesRequestOptions = { language: language.id, summary: true }
    const { data: { count } }   = await db.getLexemes(lexemesRequestOptions)

    numLexemes += count

  }

  res.render(`Project/Project`, {
    languages,
    numCollaborators,
    numLanguages: languages.length,
    numLexemes,
    project,
    Project:      true,
    title:        project.name,
  })

}
