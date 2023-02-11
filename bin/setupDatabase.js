import '../env.js'
import Database from '@digitallinguistics/db'

const [, , dbName] = process.argv

if (!dbName) {
  throw new Error(`Provide a database name as the first argument.`)
}

const endpoint = process.env.COSMOS_ENDPOINT
const key      = process.env.COSMOS_KEY
const db       = new Database({ dbName, endpoint, key })

await db.setup()
