export default function get(req, res) {
  res.render(`Component/Component`, {
    component: `Lexeme/LexemeDetails`,
    data:      {
      language: {
        defaultOrthography: `mod`,
        iso:                `ctm`,
      },
      lexeme:   {
        dateCreated:  `2020-01-01T00:00:00.000Z`,
        dateModified: `2022-01-01T00:00:00.000Z`,
        lemma:        {
          mod: `cuw-`,
          swd: `čuw-`,
          ipa: `t͡ʃuw-`,
        },
        senses:   [
          {
            gloss: `go`,
          },
          {
            gloss: `walk`,
          },
        ],
      },
    },
    layout:    false,
    scripts: [`LexemeDetails`],
    styles:    [
      `Label`,
      `LexemeDetails`,
      `MultiLangString`,
      `Numbered`,
      `Translation`,
      `Transcription`,
    ],
  })
}
