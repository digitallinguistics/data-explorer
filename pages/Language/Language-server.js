import db                    from '../../config/database.js'
import getDefaultOrthography from '../../utilities/getDefaultOrthography.js'
import hasAccess from '../../utilities/hasAccess.js'

export default async function get(req, res) {

  const { languageID }     = req.params
  const { data: language } = await db.getLanguage(languageID)

  if (!language) return res.error(`ItemNotFound`)
  if (!language.permissions.public && !res.locals.user) return res.error(`Unauthenticated`)
  if (!hasAccess(res.locals.user, language)) return res.error(`Unauthorized`)

  res.render(`Language/Language`, {
    language,
    Language: true,
    title:    getDefaultOrthography(language.name) ?? `Language`,
  })

}
