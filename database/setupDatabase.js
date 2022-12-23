/**
 * Run this script to set up the DLx Cosmos database, either locally or in production.
 */

import '../services/env.js'

import { CosmosClient }  from '@azure/cosmos'
import { fileURLToPath } from 'url'
import { readFile }      from 'fs/promises'

import {
  dirname as getDirname,
  join as joinPath,
} from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname  = getDirname(__filename)

const containerName = `data`
const endpoint      = process.env.COSMOS_ENDPOINT
const key           = process.env.COSMOS_KEY

export default async function setupDatabase(dbName = `digitallinguistics`) {

  const client = new CosmosClient({ endpoint, key })

  const { database } = await client.databases.createIfNotExists({ id: dbName })
  const { container } = await database.containers.createIfNotExists({ id: containerName })

  const scriptPath = joinPath(__dirname, `./sprocs/count.js`)
  const script = await readFile(scriptPath, `utf8`)

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

  return client

}