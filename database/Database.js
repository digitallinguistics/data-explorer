import { CosmosClient } from '@azure/cosmos'

const bulkLimit = 100
const endpoint  = process.env.COSMOS_ENDPOINT
const key       = process.env.COSMOS_KEY

const client = new CosmosClient({ endpoint, key })

/**
 * A class for managing a Cosmos DB database connection.
 */
export default class Database {

  /**
   * The Cosmos DB client from the Node SDK.
   */
  client = client

  /**
   * The name of the Cosmos DB container.
   */
  containerName = `data`

  /**
   * Create a new Database client.
   * @param {String} dbName The name to use for the database. Should generally be `digitallinguistics` for production and `test` otherwise.
   */
  constructor(dbName = `test`) {
    this.database  = this.client.database(dbName)
    this.container = this.database.container(this.containerName)
  }


  // GENERIC METHODS

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

    let query = `SELECT * FROM ${ this.containerName } WHERE ${ this.containerName }.type = '${ type }'`

    if (language) query += ` AND ${ this.containerName }.language = '${ language }'`
    if (project) query += ` AND ARRAY_CONTAINS(${ this.containerName }.projects, '${ project }')`

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
  async get(id) {

    const { resource, statusCode } = await this.container.item(id).read()

    return { data: resource, status: statusCode }

  }

  /**
   * Get multiple items from the database by ID. Max 100 items per request.
   * @param {Array<String>} ids An array of IDs to retrieve from the database.
   * @returns Promise<Array<Object>> Resolves to an array of response objects, each containing `data` and `status` properties.
   */
  async getMany(ids = []) {

    if (ids.length > bulkLimit) {
      return {
        message: `You can only retrieve ${ bulkLimit } items at a time.`,
        status:  400,
      }
    }

    const operations = ids.map(id => ({
      id,
      operationType: `Read`,
    }))

    const results = await this.container.items.bulk(operations, { continueOnError: true })

    return results.map(({ resourceBody, statusCode }) => ({
      data:   resourceBody,
      status: statusCode,
    }))

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

    let query = `SELECT * FROM ${ this.containerName } WHERE ${ this.containerName }.type = 'Language'`

    if (project) query += ` AND ARRAY_CONTAINS(${ this.containerName }.projects, '${ project }')`

    const queryIterator = this.container.items.query(query).getAsyncIterator()
    const data          = []

    for await (const result of queryIterator) {
      data.push(...result.resources)
    }

    return { data, status: 200 }

  }

  /**
 * Get multiple lexemes from the database.
 * @param {Object} [options={}]      An options hash.
 * @param {String} [options.project] The ID of a project to return lexemes for.
 * @returns Promise<Array<Lexeme>>
 */
  async getLexemes(options = {}) {

    const { language, project } = options

    let query = `SELECT * FROM ${ this.containerName } WHERE ${ this.containerName }.type = 'Lexeme'`

    if (language) query += ` AND ${ this.containerName }.language = '${ language }'`
    if (project) query += ` AND ARRAY_CONTAINS(${ this.containerName }.projects, '${ project }')`

    const queryIterator = this.container.items.query(query).getAsyncIterator()
    const data          = []

    for await (const result of queryIterator) {
      data.push(...result.resources)
    }

    return { data, status: 200 }

  }

  /**
   * Get multiple projects from the database.
   * @returns Promise<Array<Project>>
   */
  async getProjects() {

    const query = `SELECT * FROM ${ this.containerName } WHERE ${ this.containerName }.type = 'Project'`

    const queryIterator = this.container.items.query(query).getAsyncIterator()
    const data          = []

    for await (const result of queryIterator) {
      data.push(...result.resources)
    }

    return { data, status: 200 }

  }

}
