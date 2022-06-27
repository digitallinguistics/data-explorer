import { fileURLToPath }  from 'url'
import path               from 'path'
import { readFile }       from 'fs/promises'
import yaml               from 'js-yaml'

export default async function get(req, res) {

  const __filename    = fileURLToPath(import.meta.url)
  const __dirname     = path.dirname(__filename)

  const languagesPath = path.join(__dirname, `../../data/languages.yml`)
  const languagesYAML = await readFile(languagesPath, `utf8`)
  const languages     = yaml.load(languagesYAML)
  const language      = languages.find(lang => lang.abbreviation === `chiti`)

  const lexemesPath = path.join(__dirname, `../../data/lexemes.yml`)
  const lexemesYAML = await readFile(lexemesPath, `utf8`)
  const lexemes     = yaml.load(lexemesYAML)
  const [lexeme]    = lexemes

  const title         = `Design`
  const { component } = req.params

  res.render(`Design/Design`, {
    [component]: true,
    language,
    lexeme,
    [title]:     true,
    title,
  })

}
