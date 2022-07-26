export default function get(req, res) {
  res.render(`Component/Component`, {
    component: `Lexemes/LexemesTable`,
    data:      {},
    layout:    false,
    scripts:   [],
    styles:    [
      `LexemesTable`,
      `Numbered`,
    ],
  })
}
