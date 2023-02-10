import db                    from '../../services/database.js'
import getDefaultOrthography from '../../utilities/getDefaultOrthography.js'
import { hasAccess }         from '../../utilities/permissions.js'

export default async function get(req, res) {

  const { languageID, lexemeID } = req.params

  const { data: language } = await db.getLanguage(languageID)

  if (!language) {
    return res.error(`ItemNotFound`, {
      message: `No language exists with ID <code class=code>${ languageID }</code>.`,
    })
  }

  const { data: lexeme } = await db.getLexeme(languageID, lexemeID)

  if (!lexeme) {
    return res.error(`ItemNotFound`, {
      message: `No lexeme exists with ID <code class=code>${ lexemeID }</code>.`,
    })
  }

  const projectIDs         = lexeme.projects.map(project => project.id)
  const   { data: projects } = await db.getMany(`metadata`, `Project`, projectIDs)
  const isPrivate          = !projects.some(project => project.permissions.public) && !language.permissions.public

  if (isPrivate && !res.locals.user) {
    return res.error(`Unauthenticated`, {
      message: `You must be logged in to view this lexeme.`,
    })
  }

  const userHasAccess = projects.some(project => hasAccess(res.locals.user, project))
    || hasAccess(res.locals.user, language)

  if (!userHasAccess) {
    return res.error(`Unauthorized`, {
      message: `You do not have permission to view this lexeme.`,
    })
  }

  const title = `Lexeme`

  res.render(`Lexeme/Lexeme`, {
    language,
    lexeme,
    projects,
    [title]: true,
    title:   lexeme ? getDefaultOrthography(lexeme.lemma.transcription) : title,
  })

}
