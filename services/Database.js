import { createInterface }  from 'readline'
import { createReadStream } from 'fs'
import { fileURLToPath }    from 'url'
import hasAccess            from '../utilities/hasAccess.js'
import path                 from 'path'
import { readFile }         from 'fs/promises'
import { STATUS_CODES }     from 'http'
import yaml                 from 'js-yaml'

// NOTES
// - Always return a duplicate of the data
//   so that the original data aren't modified.
// - Cannot use `structuredClone()` yet
//   because it's only supported in Node v17.
// - Do not sort results before returning.

/**
 * Creates a deep copy of an object.
 * @param {Object} obj The Object to copy.
 * @returns Object
 */
function copy(obj) {
  return JSON.parse(JSON.stringify(obj))
}

async function readNDJSON(filePath) {

  const fileStream = createReadStream(filePath)
  const lineStream = createInterface({ input: fileStream })
  const items      = []

  for await (const line of lineStream) {
    const item = JSON.parse(line)
    items.push(item)
  }

  return items

}

class DatabaseResponse {

  constructor(statusCode, data, errorMessage) {

    if (statusCode === 401) {
      errorMessage = `Unauthenticated`
    } else if (statusCode === 403) {
      errorMessage = `Unauthorized`
    } else if (statusCode >= 400) {
      errorMessage ??= STATUS_CODES[statusCode]
    }

    Object.defineProperties(this, {
      data: {
        enumerable: true,
        value:      data,
      },
      message: {
        enumerable: true,
        value:      errorMessage,
      },
      status: {
        enumerable: true,
        value:      statusCode,
      },
    })

  }

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

    this.languages = yaml.load(languagesYAML)
    this.lexemes   = yaml.load(lexemesYAML)
    this.projects  = yaml.load(projectsYAML)
    this.users     = yaml.load(usersYAML)

    const OjibwePath = path.join(__dirname, `../data/Ojibwe.ndjson`)
    const OjibweData = await readNDJSON(OjibwePath)
    const OjibweLang = this.languages.find(lang => lang.name.eng === `Ojibwe`)

    for (const lexeme of OjibweData) {
      lexeme.language = {
        defaultOrthography: OjibweLang.defaultOrthography,
        id:                 OjibweLang.id,
        name:               OjibweLang.name,
      }
    }

    const MenomineePath = path.join(__dirname, `../data/Menominee.ndjson`)
    const MenomineeData = await readNDJSON(MenomineePath)
    const MenomineeLang = this.languages.find(lang => lang.name.eng === `Menominee`)

    for (const lexeme of MenomineeData) {
      lexeme.language = {
        defaultOrthography: MenomineeLang.defaultOrthography,
        id:                 MenomineeLang.id,
        name:               MenomineeLang.name,
      }
    }

    this.lexemes.push(...OjibweData, ...MenomineeData)

    for (const lexeme of this.lexemes) {
      lexeme.projects ??= []
    }

  }

  async getLanguage(id, user) {

    const language = this.languages.find(lang => lang.id === id)

    if (!language) return new DatabaseResponse(404)

    if (!language.permissions.public) {
      if (!user) return new DatabaseResponse(401)
      if (!hasAccess(user, language)) return new DatabaseResponse(403)
    }

    return new DatabaseResponse(200, copy(language))

  }

  /**
   * Returns all the Languages that the user has access to.
   * @param {String} user The email address of the user
   * @returns Array
   */
  async getLanguages(user) {
    const results = this.languages.filter(lang => hasAccess(user, lang))
    return new DatabaseResponse(200, copy(results))
  }

  async getLexeme(id, user) {

    const lexeme = this.lexemes.find(lex => lex.id === id)

    if (!lexeme) return new DatabaseResponse(404)

    const projects           = this.projects.filter(project => lexeme.projects.includes(project.id))
    const hasPrivateProjects = projects.some(project => !project.permissions.public)

    if (hasPrivateProjects && !user) return new DatabaseResponse(401)

    const userHasAccess = projects.some(project => hasAccess(user, project))

    if (!userHasAccess) return new DatabaseResponse(403)

    return new DatabaseResponse(200, copy(lexeme))

  }

  async getLexemes(options = {}, user) {

    const { language: languageID, project: projectID } = options

    if (!(languageID || projectID)) return new DatabaseResponse(400, undefined, `No project/language specified.`)

    const itemType       = projectID ? `project` : `language`
    const collectionType = projectID ? `projects` : `languages`
    const id             = projectID ?? languageID
    const collection     = this[collectionType].find(item => item.id === id)

    if (!collection) return new DatabaseResponse(404, undefined, `A ${ itemType } with that ID does not exist.`)
    if (!collection.permissions.public && !user) return new DatabaseResponse(401)
    if (!hasAccess(user, collection)) return new DatabaseResponse(403)

    const projectFilter  = lexeme => lexeme.projects.includes(projectID)
    const languageFilter = lexeme => lexeme.language === languageID
    const filter         = itemType === `project` ? projectFilter : languageFilter
    const results        = this.lexemes.filter(filter)

    return new DatabaseResponse(200, copy(results))

  }

  async getProject(projectID, user) {

    const project = this.projects.find(proj => proj.id === projectID)

    if (!project) return new DatabaseResponse(404)

    if (!project.permissions.public) {
      if (!user) return new DatabaseResponse(401)
      if (!hasAccess(user, project)) return new DatabaseResponse(403)
    }

    return new DatabaseResponse(200, copy(project))

  }

  async getProjects(user) {
    const projects = await this.projects.filter(proj => hasAccess(user, proj))
    return new DatabaseResponse(200, copy(projects))
  }

}
