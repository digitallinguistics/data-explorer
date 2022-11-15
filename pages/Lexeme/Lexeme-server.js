import compare               from '../../utilities/compare.js'
import db                    from '../../config/database.js'
import getDefaultOrthography from '../../utilities/getDefaultOrthography.js'
import { hasAccess }         from '../../utilities/permissions.js'

export default async function get(req, res) {

  const title            = `Lexeme`
  const { lexemeID }     = req.params
  const { data: lexeme } = await db.getLexeme(lexemeID)

  if (!lexeme) {
    return res.error(`ItemNotFound`, {
      message: `No lexeme exists with ID <code class=code>${ lexemeID }</code>.`,
    })
  }

  const { data: projects } = await db.getProjects()
  const lexemeProjects     = projects.filter(project => lexeme.projects.includes(project.id))
  const isPrivate          = !lexemeProjects.some(project => project.permissions.public)

  if (isPrivate && !res.locals.user) {
    return res.error(`Unauthenticated`, {
      message: `You must be logged in to view this lexeme.`,
    })
  }

  const userHasAccess = lexemeProjects.some(project => hasAccess(res.locals.user, project))

  if (!userHasAccess) {
    return res.error(`Unauthorized`, {
      message: `You do not have permission to view this lexeme.`,
    })
  }

  const { data: language }   = await db.getLanguage(lexeme.language)
  let   { data: references } = await db.getReferences({ ids: Array.from(lexeme.references) })

  references = references.reduce((hash, ref) => {
    hash[ref.id] = ref
    return hash
  }, {})

  res.render(`Lexeme/Lexeme`, {
    language,
    lexeme,
    references,
    [title]: true,
    title:   lexeme ? getDefaultOrthography(lexeme.lemma) : title,
  })

}
