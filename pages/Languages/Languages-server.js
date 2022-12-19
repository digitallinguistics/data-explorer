import db from '../../config/database.js'

import {
  hasAccess,
  isEditor,
  isOwner,
  isViewer,
} from '../../utilities/permissions.js'

export default async function get(req, res) {

  if (req.params.projectID) {

    var { data: project } = await db.getProject(req.params.projectID)

    if (!project) {
      return res.error(`ItemNotFound`, {
        message: `No project exists with ID <code class=code>${ req.params.projectID }</code>.`,
      })
    }

    if (!project.permissions.public && !res.locals.user) {
      return res.error(`Unauthenticated`, {
        message: `You must be logged in to view this project.`,
      })
    }

  }

  let { data: languages } = await db.getLanguages()

  languages = languages.filter(lang => hasAccess(res.locals.user, lang))

  if (project) languages = languages.filter(lang => lang.projects.includes(project.id))

  for (const language of languages) {
    language.permissions.isOwner  = isOwner(res.locals.user, language)
    language.permissions.isEditor = isEditor(res.locals.user, language)
    language.permissions.isViewer = isViewer(res.locals.user, language)
  }

  res.render(`Languages/Languages`, {
    languages,
    Languages: true,
    project,
    title:     `Languages`,
  })

}
