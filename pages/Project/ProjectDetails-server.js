export default function get(req, res) {
  res.render(`Component/Component`, {
    component: `Project/ProjectDetails`,
    data:      {},
    layout:    false,
    scripts:   [],
    styles:    [`ProjectDetails`],
  })
}
