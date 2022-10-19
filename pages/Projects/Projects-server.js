import db        from '../../config/database.js'
import hasAccess from '../../utilities/hasAccess.js'

export default async function get(req, res) {

  const title = `Projects`

  let { data: projects } = await db.getProjects()

  projects = projects.filter(project => hasAccess(res.locals.user, project))

  res.render(`Projects/Projects`, {
    projects,
    [title]:  true,
    title,
  })

}
