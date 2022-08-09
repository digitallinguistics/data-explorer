import data             from '../data/index.js'
import hasAccess        from '../utilities/hasAccess.js'
import { STATUS_CODES } from 'http'

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

  constructor() {
    Object.assign(this, data)
  }

  getLanguage(id, user) {

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
  getLanguages(user) {
    const results = this.languages.filter(lang => hasAccess(user, lang))
    return new DatabaseResponse(200, copy(results))
  }

  getLexeme(id, user) {

    const lexeme = this.lexemes.find(lex => lex.id === id)

    if (!lexeme) return new DatabaseResponse(404)

    const projects           = this.projects.filter(project => lexeme.projects.includes(project.id))
    const hasPrivateProjects = projects.some(project => !project.permissions.public)

    if (hasPrivateProjects && !user) return new DatabaseResponse(401)

    const userHasAccess = projects.some(project => hasAccess(user, project))

    if (!userHasAccess) return new DatabaseResponse(403)

    return new DatabaseResponse(200, copy(lexeme))

  }

  getLexemes(options = {}, user) {

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

  getProject(projectID, user) {

    const project = this.projects.find(proj => proj.id === projectID)

    if (!project) return new DatabaseResponse(404)

    if (!project.permissions.public) {
      if (!user) return new DatabaseResponse(401)
      if (!hasAccess(user, project)) return new DatabaseResponse(403)
    }

    return new DatabaseResponse(200, copy(project))

  }

  getProjects(user) {
    const projects = this.projects.filter(proj => hasAccess(user, proj))
    return new DatabaseResponse(200, copy(projects))
  }

}
