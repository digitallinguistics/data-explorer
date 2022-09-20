import db                    from '../../config/database.js'
import getDefaultOrthography from '../../utilities/getDefaultOrthography.js'
import hasAccess from '../../utilities/hasAccess.js'

export default async function get(req, res) {

  const title            = `Lexeme`
  const { lexemeID }     = req.params
  const { data: lexeme } = await db.getLexeme(lexemeID)

  if (!lexeme) return res.error(`ItemNotFound`)

  const { data: projects } = await db.getProjects()
  const lexemeProjects     = projects.filter(project => lexeme.projects.includes(project.id))

  const isPrivate = !lexemeProjects.some(project => project.permissions.public)

  if (isPrivate && !res.locals.user) return res.error(`Unauthenticated`)

  const userHasAccess = lexemeProjects.some(project => hasAccess(res.locals.user, project))

  if (!userHasAccess) return res.error(`Unauthorized`)

  res.render(`Lexeme/Lexeme`, {
    lexeme,
    [title]: true,
    title:   lexeme ? getDefaultOrthography(lexeme.lemma) : title,
  })

}
