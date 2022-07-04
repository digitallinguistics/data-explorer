import compareLemmas from '../../utilities/compareLemmas.js'
import db            from '../../config/database.js'

export default async function get(req, res) {

  const { projectID } = req.params
  const project       = await db.getProject(projectID, res.locals.user)
  const title         = `Lexemes: ${ project.name }`
  const lexemes       = await db.getProjectLexemes(projectID, res.locals.user)

  // TODO: Return 403 if the user does not have access.

  lexemes.sort(compareLemmas)

  res.render(`Lexemes/Lexemes`, {
    lexemes,
    summaryName: project.name,
    [title]:     true,
    title,
  })

}
