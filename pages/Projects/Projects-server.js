import compare from '../../utilities/compare.js'
import db      from '../../config/database.js'

import {
  hasAccess,
  isEditor,
  isOwner,
} from '../../utilities/permissions.js'

export default async function get(req, res) {

  const title = `Projects`

  let { data: projects } = await db.getProjects()

  projects = projects.filter(project => hasAccess(res.locals.user, project))
  projects.sort((a, b) => compare(a.name, b.name))

  for (const project of projects) {
    project.permissions.isOwner  = isOwner(res.locals.user, project)
    project.permissions.isEditor = isEditor(res.locals.user, project)
  }

  res.render(`Projects/Projects`, {
    projects,
    [title]:  true,
    title,
  })

}
