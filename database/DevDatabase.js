import '../env.js'
import chunk             from '../utilities/chunk.js'
import { CosmosClient }  from '@azure/cosmos'
import { fileURLToPath } from 'url'
import path              from 'path'
import { readFile }      from 'fs/promises'

const __filename = fileURLToPath(import.meta.url)
const __dirname  = path.dirname(__filename)

const bulkLimit = 100
const endpoint  = process.env.COSMOS_ENDPOINT
const key       = process.env.COSMOS_KEY

/**
 * A class with some useful databse methods for testing and development.
 */
export default class DevDatabase {

  client = new CosmosClient({ endpoint, key })

  constructor(dbName) {
    this.dbName   = dbName
    this.database = this.client.database(this.dbName)
    this.data     = this.database.container(`data`)
    this.metadata = this.database.container(`metadata`)
  }

  /**
   * Add multiple copies of the same item to a container.
   * Different IDs will be given to each copy.
   * @param {String}  container The container to add the items to.
   * @param {String}  partition The partition to add the items to.
   * @param {Integer} count     How many copies of the item to add.
   * @param {Object}  [data={}] The data to add copies of.
   * @returns {Promise}
   */
  async addMany(container, partition, count, data = {}) {

    const copy = Object.assign({}, data)
    delete copy.id

    // NB: In order for `.batch()` to work,
    // add a partition key to each item (`language.id`),
    // and provide the *value* of the partition key
    // as the 2nd argument to `batch()`.

    const operationType = `Create`
    const operations    = []

    for (let i = 0; i < count; i++) {
      operations[i] = {
        operationType,
        resourceBody: Object.assign({}, copy),
      }
    }

    const batches = chunk(operations, bulkLimit)
    const results = []

    for (const batch of batches) {
      const response = await this[container].items.batch(batch, partition)
      results.push(...response.result)
    }

    return results

  }

  /**
   * Add a single item to a container.
   * @param {String} container The container to add the item to.
   * @param {Object} data      The data for the item to add.
   * @returns {Promise}
   */
  addOne(container, data = {}) {

    if (container === `data` && !data.language?.id) {
      data = Object.assign({ language: this.languageID }, data)
    }

    return this[container].items.create(data)

  }

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
   * Creates the database, container, and stored procedures in Cosmos DB if they don't yet exist.
   * @returns {Promise}
   */
  async setup() {

    console.info(`Setting up the "${ this.dbName }" database.`)

    const { database }            = await this.client.databases.createIfNotExists({ id: this.dbName })
    const { container: data }     = await database.containers.createIfNotExists({ id: `data`, partitionKey: `/language/id` })
    const { container: metadata } = await database.containers.createIfNotExists({ id: `metadata`, partitionKey: `/type` })

    const scriptPath = path.join(__dirname, `./sprocs/count.js`)
    const script     = await readFile(scriptPath, `utf8`)

    for (const container of [data, metadata]) {
      try {
        await container.scripts.storedProcedures.create({
          body: script,
          id:   `count`,
        })
      } catch (error) {
        // The sproc will already exist if the database hasn't been torn down.
        // Ignore the 409 error and continue if this is the case, and throw otherwise.
        if (error.code !== 409) throw error
      }
    }


    console.info(`"${ this.dbName }" database setup complete.`)

  }

}
