import db from '../../config/database.js'

export default async function get(req, res) {

  const title          = `Languages`
  const languages      = await db.getLanguages(res.locals.user)
  const { languageID } = req.params
  const language       = languages.find(lang => lang.id === languageID)

  if (language) language.current = true

  res.render(`Languages/Languages`, {
    language,
    languages,
    [title]: true,
    title,
  })

}
