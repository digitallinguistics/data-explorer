import chunk             from '../utilities/chunk.js'
import { CosmosClient }  from '@azure/cosmos'
import { fileURLToPath } from 'url'
import path              from 'path'
import { readFile }      from 'fs/promises'

const __filename = fileURLToPath(import.meta.url)
const __dirname  = path.dirname(__filename)

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
  }


  // DEV METHODS

  /**
   * Deletes all the items from the database.
   * @returns Promise
   */
  async clear() {

    const { resources } = await this.container.items.readAll().fetchAll()

    const batches = chunk(resources, this.bulkLimit)

    for (const batch of batches) {

      const operations = batch.map(item => ({
        id:            item.id,
        operationType: `Delete`,
      }))

      await this.container.items.bulk(operations)

    }
  }

  /**
   * Delete the entire database.
   * @returns Promise
   */
  async delete() {

    if (this.dbName === `digitallinguistics`) {
      throw new Error(`This error is here to guard against accidental deletion. Comment it out or delete the database manually if you really truly actually srsly for realzies do want to delete the "digitallinguistics" database.`)
    }

    console.info(`Deleting the ${ this.dbName } database.`)

    await this.database(this.dbName).delete()

    console.info(`${ this.dbName } successfully deleted.`)

  }

  /**
   * Creates the database, container, and stored procedures in Cosmos DB if they don't yet exist.
   * @returns Promise
   */
  async setup() {

    console.info(`Setting up ${ this.dbName } database.`)

    const { database }        = await this.client.databases.createIfNotExists({ id: this.dbName })
    const { container: data } = await database.containers.createIfNotExists({ id: `data` })

    const scriptPath = path.join(__dirname, `./sprocs/count.js`)
    const script     = await readFile(scriptPath, `utf8`)

    try {
      await data.scripts.storedProcedures.create({
        body: script,
        id:   `count`,
      })
    } catch (error) {
      // The sproc will already exist if the database hasn't been torn down.
      // Ignore the 409 error and continue if this is the case, and throw otherwise.
      if (error.code !== 409) throw error
    }

    console.info(`${ this.dbName } database setup complete.`)

  }


  // GENERIC METHODS

  /**
   * Upsert a single item to the database.
   * @param {Object} item The item to upsert.
   * @returns Promise<Object>
   */
  async addOne(item) {
    try {

      const { resource, statusCode } = await this.container.items.create(item)
      return { data: resource, status: statusCode }

    } catch ({ code }) {

      const response = { status: code }

      if (code === 409) response.message = `An item with ID ${ item.id } already exists.`
      else response.message = `An unknown error occurred while adding item with ID ${ item.id }.`

      return response

    }
  }

  async addMany(items) {

    const item = {}

    const operations = [
      {
        operationType: `Create`,
        resourceBody:  item,
      },
    ]

    // const response = await this.container.items.create(item)
    const response = await this.container.items.batch(operations)
    console.log(response)

  }

  /**
   * Count the number of items of the specified type. Use the `options` parameter to provide various filters.
   * @param {String} type               The type of item to count.
   * @param {Object} [options={}]       An options hash.
   * @param {String} [options.language] The ID of the language to filter for.
   * @param {String} [options.project]  The ID of the project to filter for.
   * @returns Promise<Object> Returns an object with `count` and `status` properties.
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
   * @returns Promise<Object>
   */
  async getOne(id) {

    const { resource, statusCode } = await this.container.item(id).read()

    return { data: resource, status: statusCode }

  }

  /**
   * Get multiple items from the database by ID. Max 100 items per request. Items not found are omitted without a warning.
   * @param {Array<String>} ids An array of IDs to retrieve from the database.
   * @returns Promise<Array<Object>> Resolves to an array of results.
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
   * @returns Promise<Object>
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
   * @returns Promise<Array<Object>>
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
   * @returns Promise<Array<Language>>
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
 * @returns Promise<Array<Lexeme>>
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
   * @returns Promise<Array<Project>>
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
   * @returns Promise<Array<BibliographicReference>>
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
