import compareLemmas from '../../utilities/compareLemmas.js'
import db            from '../../config/database.js'

export default async function get(req, res) {

  const { projectID }     = req.params
  const { data: project } = await db.getProject(projectID, res.locals.user)
  const { data: lexemes } = await db.getLexemes({ project: projectID }, res.locals.user)

  // TODO: Return 403 if the user does not have access.
  // TODO: Handle case where no project is found.

  if (lexemes) lexemes.sort(compareLemmas)

  res.render(`Lexemes/Lexemes`, {
    lexemes,
    Lexemes:     true,
    summaryName: project.name,
    title:       `Lexemes | ${ project.name }`,
  })

}
