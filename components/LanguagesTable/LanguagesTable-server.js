import db from '../../config/database.js'

const { data: languages } = db.getLanguages()

export default function get(req, res) {
  res.render(`Component/Component`, {
    component: `LanguagesTable/LanguagesTable`,
    data:      {
      languages,
      project:   {
        name: `Sample Languages Table`,
      },
    },
    layout:    false,
    styles:    [
      `LanguagesTable`,
      `Link`,
    ],
  })
}
