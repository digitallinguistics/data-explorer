import db from '../../config/database.js'

export default async function get(req, res) {

  const title               = `Project`
  const { projectID }       = req.params
  const { data: project }   = await db.getProject(projectID, res.locals.user)

  const { owners, editors } = project.permissions
  const numCollaborators    = new Set([...owners, ...editors]).size

  let numLexemes = 0

  for (const language of project.languages) {
    const { data: lexemes } = await db.getLexemes({ language }, res.locals.user)
    numLexemes += lexemes.length
  }

  res.render(`Project/Project`, {
    numCollaborators,
    numLanguages:     project.languages.length,
    numLexemes,
    project,
    [title]:          true,
    title:            `{ Project Title }`,
  })

}
