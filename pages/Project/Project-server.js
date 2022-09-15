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

    for (const languageID of project.languages) {


      const { data: languages } = await db.getLanguages(languageID, res.locals.user)
      context.languages = languages

      const lexemesRequestOptions             = { language: languageID, summary: true }
      const { data: { count } } = await db.getLexemes(lexemesRequestOptions, res.locals.user)
      context.numLexemes += count

    }

  }

  res.render(`Project/Project`, context)

}
