import db                    from '../../config/database.js'
import getDefaultOrthography from '../../utilities/getDefaultOrthography.js'

export default async function get(req, res) {

  const { languageID }     = req.params
  const { data: language } = await db.getLanguage(languageID, res.locals.user)

  if (!language) {

    res.status(404)

    return res.render(`ItemNotFound/ItemNotFound`, {
      ItemNotFound: true,
      title:        `Item Not Found`,
    })

  }

  res.render(`Language/Language`, {
    language,
    Language: true,
    title:    getDefaultOrthography(language.name) ?? `Language`,
  })

}
