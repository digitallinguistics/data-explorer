import copy             from '../utilities/copy.js'
import data             from '../data/index.js'
import { STATUS_CODES } from 'http'

// NOTES
// - Always return a duplicate of the data
//   so that the original data aren't modified.
// - Cannot use `structuredClone()` yet
//   because it's only supported in Node v17.
// - Do not sort results before returning.

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

/**
 * Class representing a Database Response.
 */
class DatabaseResponse {

  /**
   * Create a Database Reponse.
   * @param {Number} statusCode   The status code of the response.
   * @param {Any}    data         The data returned from the database.
   * @param {String} errorMessage An error message returned from the database.
   */
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
 * A class for managing a database connection.
 */
export default class Database {

  /**
   * Create a new database connection.
   */
  constructor() {

    Object.assign(this, data)

    this.projects.index   = createIndex(this.projects)
    this.languages.index  = createIndex(this.languages)
    this.lexemes.index    = createIndex(this.lexemes)
    this.references.index = createIndex(this.references)

  }

  /**
   * Get a language from the database.
   * @param {String} id The ID of the language to retrieve.
   * @returns DatabaseResponse
   */
  getLanguage(id) {
    const language = this.languages.index.get(id)
    if (!language) return new DatabaseResponse(404)
    return new DatabaseResponse(200, copy(language))
  }

  /**
   * Retrieve all languages from the database.
   * @param {Object} [options={}]      An optional options object.
   * @param {String} [options.project] Filter the results by project.
   * @returns DatabaseResponse
   */
  getLanguages(options = {}) {

    const { project: projectID } = options
    let   results                = this.languages

    if (projectID) results = results.filter(language => language.projects.includes(projectID))

    return new DatabaseResponse(200, copy(results))

  }

  /**
   * Get a lexeme from the database.
   * @param {String} id The ID of the lexeme to retrieve.
   * @returns DatabaseResponse
   */
  getLexeme(id) {
    const data = this.lexemes.index.get(id)
    if (!data) return new DatabaseResponse(404)
    return new DatabaseResponse(200, copy(data))
  }

  /**
   * Gets all the lexemes that match the provided query options.
   * @param {Object}  [options={}]       An options hash
   * @param {String}  [options.language] The ID of the language to retrieve lexemes for.
   * @param {String}  [options.project]  The ID of the project to retrieve lexemes for.
   * @param {Boolean} [options.summary]  If truthy, returns a summary of the results rather than the actual results.
   * @returns DatabaseResponse
   */
  getLexemes(options = {}) {

    const {
      language: languageID,
      project: projectID,
      summary,
    } = options

    let results = this.lexemes.map(data => copy(data))

    if (languageID) results = results.filter(lexeme => lexeme.language.id === languageID)
    if (projectID) results = results.filter(lexeme => lexeme.projects.includes(projectID))

    if (summary) return new DatabaseResponse(200, { count: results.length })

    return new DatabaseResponse(200, results) // NB: The results have already been duplicated.

  }

  /**
   * Get a project from the database.
   * @param {String} projectID The ID of the project to retrieve.
   * @returns DatabaseResponse
   */
  getProject(projectID) {
    const project = this.projects.index.get(projectID)
    if (!project) return new DatabaseResponse(404)
    return new DatabaseResponse(200, copy(project))
  }

  /**
   * Get all the projects from the database.
   * @returns DatabaseResponse
   */
  getProjects() {
    return new DatabaseResponse(200, copy(this.projects))
  }

  /**
   * Get a reference from the database.
   * @param {String} referenceID The ID of the reference to retrieve.
   * @returns DatabaseResponse
   */
  getReference(referenceID) {
    const reference = this.references.index.get(referenceID)
    if (!reference) return new DatabaseResponse(404)
    return new DatabaseResponse(200, copy(reference))
  }

  /**
   * Get all the references that match the provided query options.
   * @param {Object}  [options={}]           An options hash
   * @param {Array}   [options.bibliography] An array of IDs of references to retrieve.
   * @param {Boolean} [options.summary]      If truthy, returns a summary of the results rather than the actual results.
   * @returns DatabaseResponse
   */
  getReferences(options = {}) {

    const { ids, summary } = options

    let results = copy(this.references)

    if (ids) {
      results = results.filter(ref => ids.includes(ref.id))
    }

    if (summary) return new DatabaseResponse(200, { count: results.length })

    return new DatabaseResponse(200, results)

  }

}