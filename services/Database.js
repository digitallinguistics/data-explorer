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

/**
 * Create an index using the `id` property from an array of object.
 * @param   {Array} arr An array of items to index by their `id` property
 * @returns {Map}
 */
function createIndex(arr) {
  return arr.reduce((map, item) => {
    map.set(item.id, item)
    return map
  }, new Map)
}

class DatabaseResponse {

  constructor(statusCode, data, errorMessage) {

    if (statusCode >= 400) {
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

    this.projects.index  = createIndex(this.projects)
    this.languages.index = createIndex(this.languages)
    this.lexemes.index   = createIndex(this.lexemes)

  }

  getLanguage(id) {
    const language = this.languages.index.get(id)
    if (!language) return new DatabaseResponse(404)
    return new DatabaseResponse(200, copy(language))
  }

  /**
   * Returns all the Languages that the user has access to.
   * @param {String} user The email address of the user
   */
  getLanguages() {
    return new DatabaseResponse(200, copy(this.languages))
  }

  getLexeme(id) {
    const lexeme = this.lexemes.index.get(id)
    if (!lexeme) return new DatabaseResponse(404)
    return new DatabaseResponse(200, copy(lexeme))
  }

  /**
   * Gets all the lexemes that match the provided query. Note that either the `language` or `project` option is required.
   * @param {Object}  options          An options hash
   * @param {String}  options.language The ID of the language to retrieve lexemes for.
   * @param {String}  options.project  The ID of the project to retrieve lexemes for.
   * @param {Boolean} options.summary  If truthy, returns a summary of the results rather than the actual results.
   * @param {String}  user             The email of the user requesting access.
   * @returns DatabaseResponse
   */
  getLexemes(options = {}) {

    const { language: languageID, project: projectID, summary } = options

    let results = copy(this.lexemes)

    if (languageID) results = results.filter(lexeme => lexeme.language === languageID)
    if (projectID) results = results.filter(lexeme => lexeme.projects.includes(projectID))

    if (summary) return new DatabaseResponse(200, { count: results.length })

    // add basic language info to lexeme
    for (const lexeme of results) {

      const language = this.languages.index.get(lexeme.language)

      lexeme.language = {
        id:   language.id,
        name: language.name,
      }

    }

    return new DatabaseResponse(200, results) // NB: The results have already been duplicated.

  }

  getProject(projectID) {
    const project = this.projects.index.get(projectID)
    if (!project) return new DatabaseResponse(404)
    return new DatabaseResponse(200, copy(project))
  }

  getProjects() {
    return new DatabaseResponse(200, copy(this.projects))
  }

}
