import db from '../../services/database.js'

import {
  hasAccess,
  isEditor,
  isOwner,
  isViewer,
} from '../../utilities/permissions.js'

export default async function get(req, res) {

  let languages

  if (res.locals.user) {
    ({ data: languages }  = await db.getLanguages({ user: res.locals.user }))
  } else {
    ({ data: languages } = await db.getLanguages({ publicOnly: true }))
  }

  res.render(`Languages/Languages`, {
    languages,
    Languages: true,
    title:     `Languages`,
  })

}
