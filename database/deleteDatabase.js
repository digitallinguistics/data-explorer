import '../services/env.js'
import { CosmosClient } from '@azure/cosmos'

const endpoint = process.env.COSMOS_ENDPOINT
const key      = process.env.COSMOS_KEY
const client   = new CosmosClient({ endpoint, key })

export default async function deleteDatabase(dbName) {

  if (dbName === `digitallinguistics`) {
    throw new Error(`This error is here to guard against accidental deletion. Comment it out or delete the database manually if you really truly actually srsly for realzies do want to delete the "digitallinguistics" database.`)
  }

  console.info(`Deleting the ${ dbName } database.`)

  await client.database(dbName).delete()

  console.info(`${ dbName } successfully deleted.`)

}
