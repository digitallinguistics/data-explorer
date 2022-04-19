import db from '../../config/database.js'

export default async function get(req, res) {

  const title     = `Languages`
  const languages = await db.getLanguages(res.locals.user)

  res.render(`Languages/Languages`, {
    languages,
    [title]: true,
    title,
  })

}
