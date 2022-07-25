export default function get(req, res) {
  res.render(`Component/Component`, {
    component: `MultiLangString/MultiLangString`,
    data:      { eng: `hello` },
    layout:    false,
    styles:    [`MultiLangString`],
  })
}
