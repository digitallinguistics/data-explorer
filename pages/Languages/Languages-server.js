import db        from '../../config/database.js'
import hasAccess from '../../utilities/hasAccess.js'

export default async function get(req, res) {

  if (req.params.projectID) {
    var { data: project } = await db.getProject(req.params.projectID)
  }

  let { data: languages } = await db.getLanguages()

  languages = languages.filter(lang => hasAccess(res.locals.user, lang))

  if (project) languages = languages.filter(lang => lang.projects.includes(project.id))

  const title = project ? `${ project.name }: Languages` : `Languages`

  res.render(`Languages/Languages`, {
    caption: title,
    languages,
    [title]: true,
    title,
  })

}
