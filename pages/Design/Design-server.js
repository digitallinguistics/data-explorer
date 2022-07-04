import db                    from '../../config/database.js'
import getDefaultOrthography from '../../utilities/getDefaultOrthography.js'
import localeSort            from '../../utilities/localeSort.js'

export default async function get(req, res) {

  const languages = await db.getLanguages()
  const language  = languages.find(lang => lang.abbreviation === `chiti`)

  const sampleProjectID = `6a0fcc10-859c-4af1-8105-156ccfd95310`
  const project         = await db.getProject(sampleProjectID)
  const lexemes         = await db.getLexemes(sampleProjectID)
  const [lexeme]        = lexemes

  const tokensRegExp = /(?:^[-=*(]+)|(?:[-=*)]+&)/gu

  // Sorts lemmas by base character, ignoring any leading/trailing tokens, asterisks, and parentheses
  lexemes.sort((a, b) => localeSort(
    getDefaultOrthography(a.lemma, a.language.defaultOrthography).replaceAll(tokensRegExp, ``),
    getDefaultOrthography(b.lemma, a.language.defaultOrthography).replaceAll(tokensRegExp, ``),
  ))

  const title         = `Design`
  const { component } = req.params

  res.render(`Design/Design`, {
    [component]: true,
    language,
    lexeme,
    lexemes,
    project,
    [title]:     true,
    title,
  })

}
