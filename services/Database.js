import compare              from '../utilities/compare.js'
import { createInterface }  from 'readline'
import { createReadStream } from 'fs'
import { fileURLToPath }    from 'url'
import getDefaultLanguage   from '../utilities/getDefaultLanguage.js'
import path                 from 'path'
import { readFile }         from 'fs/promises'
import yaml                 from 'js-yaml'

// NOTE
// Always return a duplicate of the data
// so that the original data aren't modified.
// Cannot use `structuredClone()` yet
// because it's only supported in Node v17.

/**
 * Check whether a user has access permissions for a database object.
 * @param   {String} user The email address of the user to check.
 * @param   {Object} item The item to check against. Must have a `permissions` object.
 * @returns {Boolean}
 */
function hasAccess(user, item) {

  const { permissions } = item

  return permissions.public
    || permissions.owners.includes(user)
    || permissions.editors.includes(user)
    || permissions.viewers.includes(user)

}

async function readNDJSON(filePath) {

  const fileStream = createReadStream(filePath)
  const lineStream = createInterface({ input: fileStream })
  const lexemes    = []

  for await (const line of lineStream) {
    const data = JSON.parse(line)
    lexemes.push(data)
  }

  return lexemes

}

/**
 * A class for managing the database connection.
 */
export default class Database {

  async initialize() {

    const __filename = fileURLToPath(import.meta.url)
    const __dirname  = path.dirname(__filename)

    const languagesPath = path.join(__dirname, `../data/languages.yml`)
    const languagesYAML = await readFile(languagesPath, `utf8`)

    const lexemesPath = path.join(__dirname, `../data/lexemes.yml`)
    const lexemesYAML = await readFile(lexemesPath, `utf8`)

    const projectsPath = path.join(__dirname, `../data/projects.yml`)
    const projectsYAML = await readFile(projectsPath, `utf8`)

    const usersPath = path.join(__dirname, `../data/users.yml`)
    const usersYAML = await readFile(usersPath, `utf8`)

    this.languages      = yaml.load(languagesYAML)
    this.lexemes        = yaml.load(lexemesYAML)
    this.projects       = yaml.load(projectsYAML)
    this.users          = yaml.load(usersYAML)

    const OjibwePath = path.join(__dirname, `../data/Ojibwe.ndjson`)
    const OjibweData = await readNDJSON(OjibwePath)

    const MenomineePath = path.join(__dirname, `../data/Menominee.ndjson`)
    const MenomineeData = await readNDJSON(MenomineePath)

    this.lexemes.push(...OjibweData, ...MenomineeData)

  }

  async getLanguage(id, user) {
    const language = this.languages.find(lang => lang.id === id && hasAccess(user, lang))
    return JSON.parse(JSON.stringify(language))
  }

  async getLexeme(id, user) {

    const lexeme = this.lexemes.find(lex => lex.id === id)

    if (!lexeme) return

    const projects      = this.projects.filter(proj => lexeme.projects.includes(proj.id))
    const userHasAccess = projects.some(proj => hasAccess(user, proj))

    if (userHasAccess) return lexeme

  }

  async getLanguages(user) {

    const results = this.languages
    .filter(lang => hasAccess(user, lang))
    .sort((a, b) => compare(
      getDefaultLanguage(a.name, a.defaultAnalysisLanguage),
      getDefaultLanguage(b.name, b.defaultAnalysisLanguage),
    ))

    return JSON.parse(JSON.stringify(results))

  }

}
