import { CosmosClient } from '@azure/cosmos'

const endpoint = process.env.COSMOS_ENDPOINT
const key      = process.env.COSMOS_KEY

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

  /**
   * Get a language from the database.
   * @param {String} id The ID of the language to retrieve.
   * @returns Promise<Language>
   */
  async getLanguage(id) {

    const { resource, statusCode } = await this.container.item(id).read()

    return { data: resource, status: statusCode }

  }

  /**
   * Get all the languages from the database.
   * @param {Object} [options={}]      An options hash.
   * @param {String} [options.project] The ID of a project to return languages for.
   * @returns Promise<Array<Language>>
   */
  async getLanguages(options = {}) {

    const { project }   = options
    const query         = `SELECT * FROM ${ this.containerName } t WHERE t.type = 'Language'`
    let   { resources } = await this.container.items.query(query).fetchAll()

    if (project) resources = resources.filter(language => language.projects.includes(project))

    return { data: resources, status: 200 }

  }

  /**
   * Get a lexeme from the database.
   * @param {String} id The ID of the Lexeme to retrieve.
   * @returns Promise<Lexeme>
   */
  async getLexeme(id) {

    const { resource, statusCode } = await this.container.item(id).read()

    return { data: resource, status: statusCode }

  }

}