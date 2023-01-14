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
  containerNames = {
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


  // DEV METHODS

  /**
   * Deletes all the items from all the containers in the database.
   * @returns {Promise}
   */
  clear() {
    return Promise.all([
      this.clearContainer(`data`),
      this.clearContainer(`metadata`),
    ])
  }

  /**
   * Deletes all the items from a single container.
   * @returns {Promise}
   */
  async clearContainer(containerName) {

    const { resources } = await this[containerName].items.readAll().fetchAll()

    const batches = chunk(resources, this.bulkLimit)

    for (const batch of batches) {

      const operations = batch.map(item => ({
        id:            item.id,
        operationType: `Delete`,
        partitionKey:  containerName === `data` ? item.language.id : item.type,
      }))

      await this[containerName].items.bulk(operations)

    }

  }

  /**
   * Delete the entire database.
   * @returns {Promise}
   */
  async delete() {

    if (this.dbName === `digitallinguistics`) {
      throw new Error(`This error is here to guard against accidental deletion. Comment it out or delete the database manually if you really truly actually srsly for realzies do want to delete the "digitallinguistics" database.`)
    }

    console.info(`Deleting the "${ this.dbName }" database.`)

    await this.database.delete()

    console.info(`Database "${ this.dbName }" successfully deleted.`)

  }

  /**
   * Add a single item to a container.
   * @param {String} containerName The name of the container to add the item to.
   * @param {Object} data          The data to add.
   */
  seedOne(containerName, data = {}) {
    return this[containerName].items.create(data)
  }

  /**
   *
   * @param {String}  containerName The name of the container to seed the data to.
   * @param {Integer} count         The number of copies to add.
   * @param {Object}  [data={}]     The data to add.
   * @returns {Promise}
   */
  async seedMany(containerName, count, data = {}) {

    const copy = Object.assign({}, data)

    delete copy.id

    const operations    = []
    const operationType = `Create`
    const partitionKey  = containerName === `data` ? copy.language?.id : copy.type

    for (let i = 0; i < count; i++) {
      operations[i] = {
        operationType,
        resourceBody: Object.assign({}, copy),
      }
    }

    const batches = chunk(operations, this.bulkLimit)
    const results = []

    for (const batch of batches) {
      // NB: In order for `.batch()` to work, add a partition key to each item (`language.id` or `type`),
      // and provide the *value* of the partition key as the 2nd argument to `batch()`.
      const response = await this[containerName].items.batch(batch, partitionKey)
      results.push(...response.result)
    }

    return results

  }

  /**
   * Creates the database, container, and stored procedures in Cosmos DB if they don't yet exist.
   * @returns {Promise}
   */
  async setup() {

    console.info(`Setting up the "${ this.dbName }" database.`)

    const { database } = await this.client.databases.createIfNotExists({ id: this.dbName })

    await database.containers.createIfNotExists({ id: `data`, partitionKey: `/language/id` })
    await database.containers.createIfNotExists({ id: `metadata`, partitionKey: `/type` })

    console.info(`"${ this.dbName }" database setup complete.`)

  }


  // GENERIC METHODS

  /**
   * Count the number of items of the specified type. Use the `options` parameter to provide various filters.
   * The `language` option is optimized for the `data` container. It won't ever be run on the `metadata` container.
   * The `project` option is optimized for the `metadata` container but not the `data` container.
   * The `language` + `project` option is optimized for both containers.
   * @param {String} type               The type of item to count.
   * @param {Object} [options={}]       An options hash.
   * @param {String} [options.language] The ID of the language to filter for.
   * @param {String} [options.project]  The ID of the project to filter for.
   * @returns {Promise<Object>} Returns an object with `count` and `status` properties.
   */
  async count(type, options = {}) {

    const containerName         = this.containerNames[type]
    const { language, project } = options

    let query = `SELECT COUNT(${ containerName }) FROM ${ containerName } WHERE ${ containerName }.type = '${ type }'`
    if (language) query += ` AND ${ containerName }.language.id = '${ language }'`
    if (project) query += ` AND ARRAY_CONTAINS(${ containerName }.projects, '${ project }')`

    const { resources }   = await this[containerName].items.query(query).fetchAll()
    const [{ $1: count }] = resources

    return { count, status: 200 }

  }

  /**
   * Get a single item from the database.
   * @param {(`data`|`metadata`)} containerName The name of the container to get the item from.
   * @param {String}              partition     The partition to read from.
   * @param {String}              id            The ID of the item to retrieve.
   * @returns {Promise<Object>}
   */
  async getOne(containerName, partition, id) {

    // NB: Best practice is that point reads always have a partition specified.
    // If you don't, your database model probably needs a redesign.
    const { resource, statusCode } = await this[containerName].item(id, partition).read()

    return { data: resource, status: statusCode }

  }

  async getMany(containerName, partitionKey, ids = []) {

    if (ids.length > this.bulkLimit) {
      return {
        message: `You can only retrieve ${ this.bulkLimit } items at a time.`,
        status:  400,
      }
    }

    const operationType = `Read`
    const operations    = ids.map(id => ({ id, operationType, partitionKey }))
    const results       = await this[containerName].items.bulk(operations, { continueOnError: true })

    const data = results.map(({ resourceBody, statusCode }) => ({
      data:   resourceBody,
      status: statusCode,
    }))

    return {
      data,
      status: 207,
    }

  }


  // TYPE-SPECIFIC METHODS

  /**
   * Retrieve a single Language from the database.
   * @param {String} id The ID of the language to retrieve.
   * @returns {Promise<Language>}
   */
  getLanguage(id) {
    return this.getOne(`metadata`, `Language`, id)
  }

  /**
   * Get multiple languages from the database.
   * @param {Object} [options={}]      An options hash.
   * @param {String} [options.project] The ID of a project to return languages for.
   * @returns {Promise<Array<Language>>}
   */
  async getLanguages(options = {}) {

    const { project } = options

    let query = `SELECT * FROM metadata WHERE metadata.type = 'Language'`

    if (project) query += ` AND ARRAY_CONTAINS(metadata.projects, '${ project }')`

    const queryIterator = this.metadata.items.query(query).getAsyncIterator()
    const data          = []

    for await (const result of queryIterator) {
      data.push(...result.resources)
    }

    return { data, status: 200 }

  }

  /**
   * Retrieve a single lexeme from the database.
   * @param {String} language The ID of the language the lexeme belongs to. Helps optimize the read operation if present.
   * @param {String} id       The ID of the lexeme to retrieve.
   * @returns {Promise<Lexeme>}
   */
  getLexeme(language, id) {
    return this.getOne(`data`, language, id)
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

    const queryIterator = this.data.items.query(query).getAsyncIterator()
    const data          = []

    for await (const result of queryIterator) {
      data.push(...result.resources)
    }

    return { data, status: 200 }

  }

  /**
   * Retrieve a single project from the database.
   * @param {String} id The ID of the project to retrieve.
   * @returns {Promise<Project>}
   */
  getProject(id) {
    return this.getOne(`metadata`, `Project`, id)
  }

  /**
   * Get multiple projects from the database.
   * @param {Object} [options={}]   An options hash.
   * @param {String} [options.user] The ID of a user to filter projects for.
   * @returns {Promise<Array<Project>>}
   */
  async getProjects(options = {}) {

    let query = `SELECT * FROM metadata WHERE metadata.type = 'Project'`

    if (`user` in options) {
      if (options.user) {

        query += ` AND (
          metadata.permissions.public = true
          OR
          ARRAY_CONTAINS(metadata.permissions.owners, '${ options.user }')
          OR
          ARRAY_CONTAINS(metadata.permissions.editors, '${ options.user }')
          OR
          ARRAY_CONTAINS(metadata.permissions.viewers, '${ options.user }')
        )`

      } else {

        query += ` AND metadata.permissions.public = true`

      }
    }

    const queryIterator = this.metadata.items.query(query).getAsyncIterator()
    const data          = []

    for await (const result of queryIterator) {
      data.push(...result.resources)
    }

    return { data, status: 200 }

  }

  /**
   * Retrieve a single bibliographic reference from the database.
   * @param {String} id The ID of the reference to retrieve.
   * @returns {Promise<BibliographicReference>}
   */
  getReference(id) {
    return this.getOne(`metadata`, `BibliographicReference`, id)
  }

  /**
   * Get all the bibliographic references from the database.
   * @returns {Promise<Array<BibliographicReference>>}
   */
  async getReferences() {

    const query = `SELECT * FROM metadata WHERE metadata.type = 'BibliographicReference'`

    const queryIterator = this.metadata.items.query(query).getAsyncIterator()
    const data          = []

    for await (const result of queryIterator) {
      data.push(...result.resources)
    }

    return { data, status: 200 }

  }

}
