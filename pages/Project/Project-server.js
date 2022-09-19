import db from '../../config/database.js'

export default async function get(req, res) {

  const { projectID }     = req.params
  const { data: project } = await db.getProject(projectID, res.locals.user)

  if (!project) {

    res.status(404)

    return res.render(`ItemNotFound/ItemNotFound`, {
      ItemNotFound: true,
      title:        `Item Not Found`,
    })

  }

  const { owners, editors } = project.permissions
  const numCollaborators    = new Set([...owners, ...editors]).size
  const numLanguages        = project.languages.length
  let   numLexemes          = 0

  const { data: languages } = await db.getLanguages({ project: projectID }, res.locals.user)

  for (const languageID of project.languages) {

    const lexemesRequestOptions = { language: languageID, summary: true }
    const { data: { count } }   = await db.getLexemes(lexemesRequestOptions, res.locals.user)

    numLexemes += count

  }

  res.render(`Project/Project`, {
    languages,
    numCollaborators,
    numLanguages,
    numLexemes,
    project,
    Project: true,
    title:   project.name,
  })

}
