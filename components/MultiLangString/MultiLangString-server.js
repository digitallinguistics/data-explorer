export default function get(req, res) {
  res.render(`Component/Component`, {
    component: `MultiLangString/MultiLangString`,
    data:      {
      eng: `Spanish`,
      fra: `espagnol`,
      spa: `español`,
    },
    layout:    false,
    styles:    [`MultiLangString`],
  })
}
