import db        from '../../config/database.js'
import hasAccess from '../../utilities/hasAccess.js'

export default async function get(req, res) {

  const title               = `Languages`
  let   { data: languages } = await db.getLanguages()

  languages = languages.filter(lang => hasAccess(res.locals.user, lang))

  res.render(`Languages/Languages`, {
    caption: title,
    languages,
    [title]: true,
    title,
  })

}
