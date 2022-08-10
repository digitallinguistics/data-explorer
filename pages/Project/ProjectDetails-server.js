import db from '../../config/database.js'

const { data: [project] } = db.getProjects()

export default function get(req, res) {

  res.render(`Component/Component`, {
    component: `Project/ProjectDetails`,
    data:      {
      numCollaborators: 10,
      numLanguages:     100,
      numLexemes:       10_000,
      project,
    },
    layout:    false,
    scripts:   [],
    styles:    [`ProjectDetails`],
  })

}
