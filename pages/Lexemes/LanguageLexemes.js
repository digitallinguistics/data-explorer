import compareLemmas from '../../utilities/compareLemmas.js'
import db            from '../../services/database.js'

export default async function get(req, res) {

  const { languageID }     = req.params
  const { data: language } = await db.getOne(languageID)

  if (!language) {
    return res.error(`ItemNotFound`, {
      message: `No language exists with ID <code class=code>${ languageID }</code>.`,
    })
  }

  const { data: projects } = await db.getProjects({ user: res.locals.user })
  const projectIDs         = projects.map(project => project.id)

  let { data: lexemes } = await db.getLexemes({ language: languageID })

  lexemes = lexemes.filter(lexeme => lexeme.projects.some(projectID => projectIDs.includes(projectID)))

  lexemes.sort(compareLemmas)

  res.render(`Lexemes/Lexemes`, {
    language,
    lexemes,
    Lexemes: true,
    title:   `Lexemes`,
  })

}
