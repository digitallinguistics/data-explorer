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
   * @returns Promise<Object>
   */
  async getLanguage(id) {

    const { resource, statusCode } = await this.container.item(id).read()

    return { data: resource, status: statusCode }

  }

  /**
   * Get all the languages from the database.
   * @returns Promise<Array>
   */
  async getLanguages() {

    const query         = `SELECT * FROM ${ this.containerName } t WHERE t.type = 'Language'`
    const { resources } = await this.container.items.query(query).fetchAll()

    return { data: resources, status: 200 }

  }

}
