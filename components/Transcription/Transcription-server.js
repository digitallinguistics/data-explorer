export default function get(req, res) {
  res.render(`Component/Component`, {
    component: `Transcription/Transcription`,
    data:      {
      lang: `ctm`,
      txn:  {
        ipa: `t͡ʃuw-`,
        mod: `cuw-`,
        swd: `čuw-`,
      },
    },
    layout:    false,
    styles:    [
      `Label`,
      `Transcription`,
    ],
  })
}
