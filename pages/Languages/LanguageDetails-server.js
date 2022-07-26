export default function get(req, res) {
  res.render(`Component/Component`, {
    component: `Languages/LanguageDetails`,
    data:      {
      abbreviation:            `chiti`,
      dateCreated:             `2020-07-11T00:00:00.000Z`,
      dateModified:            `2022-07-11T00:00:00.000Z`,
      defaultAnalysisLanguage: `eng`,
      defaultOrthography:      `mod`,
      glottocode:              `chit1248`,
      iso:                     `ctm`,
      autonym:                 {
        mod: `Sitimaxa`,
        swd: `sitimaša`,
        ipa: `sitimaʃa`,
      },
      description: {
        html:     `<p>Chitimacha is a language isolate spoken by the Chitimacha people of Louisiana, United States. Its last two fluent speakers died in 1934 and 1940, but today the Chitimacha Tribe of Louisiana is working to revitalize the language using documentary archival materials.</p><p>Documentation of the language exists from Martin Duralde (1802), Albert S. Gatschet (1881–1882), John R. Swanton (1907–1920), and Morris Swadesh (1930–1934), however little of this was ever published (see Swadesh [1946]).</p>`,
        markdown: `Chitimacha is a language isolate spoken by the Chitimacha people of Louisiana, United States. Its last two fluent speakers died in 1934 and 1940, but today the Chitimacha Tribe of Louisiana is working to revitalize the language using documentary archival materials.\n\nDocumentation of the language exists from Martin Duralde (1802), Albert S. Gatschet (1881–1882), John R. Swanton (1907–1920), and Morris Swadesh (1930–1934), however little of this was ever published (see Swadesh [1946]).`,
      },
      name:                    {
        eng: `Chitimacha`,
        ctm: `Sitimaxa`,
        fra: `Shetimasha`,
      },
      notes: [
        {
          dateCreated:  `2020-01-01T00:00:00.000Z`,
          dateModified: `2022-01-01T00:00:00.000Z`,
          source:       `DWH`,
          text:         `It's unclear whether the Washa and Chawasha people also spoke Chitimacha.`,
        },
        {
          dateCreated:  `2020-01-01T00:00:00.000Z`,
          dateModified: `2020-01-01T00:00:00.000Z`,
          source:       `KW`,
          text:         `The tribe prefers to use the term "sleeping" or "dormant" rather than "extinct".`,
        },
      ],
    },
    layout:    false,
    styles:    [
      `Label`,
      `LanguageDetails`,
      `Markdown`,
      `MultiLangString`,
      `Note`,
      `Notes`,
      `Transcription`,
    ],
  })
}
