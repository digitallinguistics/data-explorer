import db                    from '../../config/database.js'
import getDefaultOrthography from '../../utilities/getDefaultOrthography.js'

export default async function get(req, res) {

  const { languageID }     = req.params
  const { data: language } = await db.getLanguage(languageID, res.locals.user)

  const context = {
    language,
    Language: true,
    title:    `Language`,
  }

  if (language) {
    context.title = getDefaultOrthography(language.name)
  }

  res.render(`Language/Language`, context)

}
