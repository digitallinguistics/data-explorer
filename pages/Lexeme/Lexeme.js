import db                    from '../../services/database.js'
import getDefaultOrthography from '../../utilities/getDefaultOrthography.js'
import { hasAccess }         from '../../utilities/permissions.js'

export default async function get(req, res) {

  const title            = `Lexeme`
  const { lexemeID }     = req.params
  const { data: lexeme } = await db.get(lexemeID)

  if (!lexeme) {
    return res.error(`ItemNotFound`, {
      message: `No lexeme exists with ID <code class=code>${ lexemeID }</code>.`,
    })
  }

  let projects    = await db.getMany(lexeme.projects)
  const isPrivate = !projects.some(project => project.permissions.public)

  if (isPrivate && !res.locals.user) {
    return res.error(`Unauthenticated`, {
      message: `You must be logged in to view this lexeme.`,
    })
  }

  projects = projects.filter(project => hasAccess(res.locals.user, project))

  const userHasAccess = Boolean(projects.length)

  if (!userHasAccess) {
    return res.error(`Unauthorized`, {
      message: `You do not have permission to view this lexeme.`,
    })
  }

  const { data: language } = await db.get(lexeme.language.id)

  res.render(`Lexeme/Lexeme`, {
    language,
    lexeme,
    projects,
    [title]: true,
    title:   lexeme ? getDefaultOrthography(lexeme.lemma.transcription) : title,
  })

}
