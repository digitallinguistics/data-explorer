import chunk            from '../utilities/chunk.js'
import { CosmosClient } from '@azure/cosmos'

// NOTE: Cosmos DB Create methods modify the original object by setting an `id` property on it.

/**
 * A class for managing a Cosmos DB database connection.
 */
export default class Database {

  /**
   * Cosmos DB's limit on bulk operations.
   */
  bulkLimit = 100

  /**
   * The Cosmos DB client.
   */
  client

  /**
   * A hash that maps types to containers.
   */
  containers = {
    BibliographicReference: `metadata`,
    Language:               `metadata`,
    Lexeme:                 `data`,
    Person:                 `metadata`,
    Project:                `metadata`,
    User:                   `metadata`,
  }

  /**
   * Create a new Database client.
   * @param {String} dbName The name to use for the database. Should generally be `digitallinguistics` for production and `test` otherwise.
   */
  constructor({
    dbName,
    endpoint,
    key,
  }) {
    this.dbName   = dbName
    this.client   = new CosmosClient({ endpoint, key })
    this.database = this.client.database(this.dbName)
    this.data     = this.database.container(`data`)
    this.metadata = this.database.container(`metadata`)
  }


  // GENERIC METHODS

  /**
   * Upsert a single item to the database.
   * @param {Object} item The item to upsert.
   * @returns {Promise<Object>}
   */
  async addOne(item) {
    try {

      const containerName            = this.containers[item.type]
      const { resource, statusCode } = await this[containerName].items.create(item)

      return { data: resource, status: statusCode }

    } catch ({ code }) {

      const response = { status: code }

      if (code === 409) response.message = `An item with ID ${ item.id } already exists.`
      else response.message = `An unknown error occurred while adding item with ID ${ item.id }.`

      return response

    }
  }

  async addMany(items) {}

  /**
   * Count the number of items of the specified type. Use the `options` parameter to provide various filters.
   * @param {String} type               The type of item to count.
   * @param {Object} [options={}]       An options hash.
   * @param {String} [options.language] The ID of the language to filter for.
   * @param {String} [options.project]  The ID of the project to filter for.
   * @returns {Promise<Object>} Returns an object with `count` and `status` properties.
   */
  async count(type, options = {}) {

    const { language, project } = options

    let query = `SELECT * FROM data WHERE data.type = '${ type }'`

    if (language) query += ` AND data.language.id = '${ language }'`
    if (project) query += ` AND ARRAY_CONTAINS(data.projects, '${ project }')`

    let count = 0

    const getCount = async continuationToken => {

      const args = [query, continuationToken]
      const { resource } = await this.container.scripts.storedProcedure(`count`).execute(undefined, args) // The first argument to `.execute()` is the partition key.

      count += resource.count

      if (resource.continuationToken) await getCount(resource.continuationToken)

    }

    await getCount()

    return { count, status: 200 }

  }

  /**
   * Get a single item from the database.
   * @param {String} id The ID of the item to retrieve.
   * @returns {Promise<Object>}
   */
  async getOne(id) {

    const { resource, statusCode } = await this.container.item(id).read()

    return { data: resource, status: statusCode }

  }

  /**
   * Get multiple items from the database by ID. Max 100 items per request. Items not found are omitted without a warning.
   * @param {Array<String>} ids An array of IDs to retrieve from the database.
   * @returns {Promise<Array<Object>>} Resolves to an array of results.
   */
  async getMany(ids = []) {

    if (ids.length > this.bulkLimit) {
      return {
        message: `You can only retrieve ${ this.bulkLimit } items at a time.`,
        status:  400,
      }
    }

    const operations = ids.map(id => ({
      id,
      operationType: `Read`,
    }))

    const results = await this.container.items.bulk(operations, { continueOnError: true })

    return results.map(({ resourceBody }) => resourceBody).filter(Boolean)

  }

  /**
   * Upsert a single item to the database.
   * @param {Object} item The item to upsert.
   * @returns {Promise<Object>}
   */
  async upsertOne(item) {
    const { resource, statusCode } = await this.container.items.upsert(item)
    return { data: resource, status: statusCode }
  }

  /**
   * Upserts multiple copies of the same object to the database.
   * WARNING: This method is only used during testing. Do not use in production.
   * @param {Integer} count The number of copies of the item to upsert.
   * @param {Object} data The item to upsert multiple times.
   * @returns {Promise<Array<Object>>}
   */
  async upsertMany(count, data = {}) {

    const operations = []

    for (let i = 0; i < count; i++) {

      const resourceBody = Object.assign({}, data)
      delete resourceBody.id

      operations[i] = {
        operationType: `Upsert`,
        resourceBody,
      }

    }

    const batches = chunk(operations, this.bulkLimit)
    const results = []

    for (const batch of batches) {
      const response = await this.container.items.bulk(batch)
      results.push(...response)
    }

    return results

  }


  // TYPE-SPECIFIC METHODS

  /**
   * Get multiple languages from the database.
   * @param {Object} [options={}]      An options hash.
   * @param {String} [options.project] The ID of a project to return languages for.
   * @returns {Promise<Array<Language>>}
   */
  async getLanguages(options = {}) {

    const { project } = options

    let query = `SELECT * FROM data WHERE data.type = 'Language'`

    if (project) query += ` AND ARRAY_CONTAINS(data.projects, '${ project }')`

    const queryIterator = this.container.items.query(query).getAsyncIterator()
    const data          = []

    for await (const result of queryIterator) {
      data.push(...result.resources)
    }

    return { data, status: 200 }

  }

  /**
 * Get multiple lexemes from the database.
 * @param {Object} [options={}]       An options hash.
 * @param {String} [options.language] The ID of a language to return lexemes for.
 * @param {String} [options.project]  The ID of a project to return lexemes for.
 * @returns {Promise<Array<Lexeme>>}
 */
  async getLexemes(options = {}) {

    const { language, project } = options

    let query = `SELECT * FROM data WHERE data.type = 'Lexeme'`

    if (language) query += ` AND data.language.id = '${ language }'`
    if (project) query += ` AND ARRAY_CONTAINS(data.projects, '${ project }')`

    const queryIterator = this.container.items.query(query).getAsyncIterator()
    const data          = []

    for await (const result of queryIterator) {
      data.push(...result.resources)
    }

    return { data, status: 200 }

  }

  /**
   * Get multiple projects from the database.
   * @param {Object} [options={}]   An options hash.
   * @param {String} [options.user] The ID of a user to filter projects for.
   * @returns {Promise<Array<Project>>}
   */
  async getProjects(options = {}) {

    let query = `SELECT * FROM data WHERE data.type = 'Project'`

    if (`user` in options) {
      if (options.user) {

        query += ` AND (
          data.permissions.public = true
          OR
          ARRAY_CONTAINS(data.permissions.owners, '${ options.user }')
          OR
          ARRAY_CONTAINS(data.permissions.editors, '${ options.user }')
          OR
          ARRAY_CONTAINS(data.permissions.viewers, '${ options.user }')
        )`

      } else {

        query += ` AND data.permissions.public = true`

      }
    }

    const queryIterator = this.container.items.query(query).getAsyncIterator()
    const data          = []

    for await (const result of queryIterator) {
      data.push(...result.resources)
    }

    return { data, status: 200 }

  }

  /**
   * Get all the bibliographic references from the database.
   * @returns {Promise<Array<BibliographicReference>>}
   */
  async getReferences() {

    const query = `SELECT * FROM data WHERE data.type = 'BibliographicReference'`

    const queryIterator = this.container.items.query(query).getAsyncIterator()
    const data          = []

    for await (const result of queryIterator) {
      data.push(...result.resources)
    }

    return { data, status: 200 }

  }

}
