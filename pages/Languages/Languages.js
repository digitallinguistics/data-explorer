import db from '../../services/database.js'

import {
  isAdmin,
  isEditor,
  isViewer,
} from '../../utilities/permissions.js'

export default async function get(req, res) {

  let languages

  if (res.locals.user) {
    ({ data: languages }  = await db.getLanguages({ user: res.locals.user }))
  } else {
    ({ data: languages } = await db.getLanguages({ public: true }))
  }

  for (const language of languages) {
    language.permissions.isAdmin  = isAdmin(res.locals.user, language)
    language.permissions.isEditor = isEditor(res.locals.user, language)
    language.permissions.isViewer = isViewer(res.locals.user, language)
  }

  res.render(`Languages/Languages`, {
    languages,
    Languages: true,
    title:     `Languages`,
  })

}
