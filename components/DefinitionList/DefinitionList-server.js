export default function get(req, res) {
  res.render(`Component/Component`, {
    component: `DefinitionList/DefinitionList`,
    layout:    false,
    styles:    [`DefinitionList`, `Label`],
  })
}
