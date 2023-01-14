import db                    from '../../services/database.js'
import getDefaultOrthography from '../../utilities/getDefaultOrthography.js'
import { hasAccess }         from '../../utilities/permissions.js'

export default async function get(req, res) {

  const { languageID, lexemeID } = req.params

  const { data: lexeme } = await db.getLexeme(languageID, lexemeID)

  if (!lexeme) {
    return res.error(`ItemNotFound`, {
      message: `No lexeme exists with ID <code class=code>${ lexemeID }</code>.`,
    })
  }

  const { data: results } = await db.getMany(`metadata`, `Project`, lexeme.projects)

  let projects = results
  .filter(({ status }) => status === 200)
  .map(({ data }) => data)

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

  const { data: language } = await db.getLanguage(lexeme.language.id)
  const title              = `Lexeme`

  res.render(`Lexeme/Lexeme`, {
    language,
    lexeme,
    projects,
    [title]: true,
    title:   lexeme ? getDefaultOrthography(lexeme.lemma.transcription) : title,
  })

}
