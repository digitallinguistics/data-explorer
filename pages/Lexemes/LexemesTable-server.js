import db from '../../config/database.js'

export default function get(req, res) {

  const projectID         = `6a0fcc10-859c-4af1-8105-156ccfd95310`  // Public Test Project
  const { data: project } = db.getProject(projectID)
  const { data: lexemes } = db.getLexemes({ project: projectID })

  res.render(`Component/Component`, {
    component: `Lexemes/LexemesTable`,
    data:      {
      lexemes,
      project,
    },
    layout:    false,
    scripts:   [],
    styles:    [
      `LexemesTable`,
      `Link`,
      `Numbered`,
    ],
  })

}
