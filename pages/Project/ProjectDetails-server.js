import db from '../../config/database.js'

const { data: [project] } = db.getProjects()

export default function get(req, res) {

  res.render(`Component/Component`, {
    component: `Project/ProjectDetails`,
    data:      project,
    layout:    false,
    scripts:   [],
    styles:    [`ProjectDetails`],
  })

}
