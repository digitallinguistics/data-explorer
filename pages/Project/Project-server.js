import db from '../../config/database.js'

export default async function get(req, res) {

  const title               = `Project`
  const { projectID }       = req.params
  const { data: project }   = await db.getProject(projectID, res.locals.user)

  const context = {
    project,
    [title]: true,
    title:   `{ Project Title }`,
  }

  if (project) {

    const { owners, editors } = project.permissions

    context.numCollaborators = new Set([...owners, ...editors]).size
    context.numLanguages     = project.languages.length
    context.numLexemes       = 0

    for (const language of project.languages) {
      const { data } = await db.getLexemes({ language, summary: true }, res.locals.user)
      context.numLexemes += data.count
    }

  }

  res.render(`Project/Project`, context)

}
