import compare from '../../utilities/compare.js'
import db      from '../../services/database.js'

import {
  hasAccess,
  isEditor,
  isOwner,
} from '../../utilities/permissions.js'

export default async function get(req, res) {

  const title = `Projects`

  let { data: projects } = await db.getProjects()

  projects = projects.filter(project => hasAccess(res.locals.user, project))

  const { languageID } = req.params

  if (languageID) {

    var { data: language } = await db.get(languageID)

    if (!language) {
      return res.error(`ItemNotFound`, {
        message: `No language exists with ID <code class=code>${ languageID }</code>.`,
      })
    }

    if (!language.permissions.public && !res.locals.user) {
      return res.error(`Unauthenticated`, {
        message: `You must be logged in to view this language.`,
      })
    }

    if (!hasAccess(res.locals.user, language)) {
      return res.error(`Unauthorized`, {
        message: `You do not have permission to view this language.`,
      })
    }

    projects = projects.filter(project => language.projects.includes(project.id))

  }

  projects.sort((a, b) => compare(a.name, b.name))

  for (const project of projects) {
    project.permissions.isOwner = isOwner(res.locals.user, project)
    project.permissions.isEditor = isEditor(res.locals.user, project)
  }

  res.render(`Projects/Projects`, {
    language,
    projects,
    [title]:  true,
    title,
  })

}
