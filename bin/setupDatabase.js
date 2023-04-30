import '../env.js'
import Database from '@digitallinguistics/db'

const dbName   = process.env.COSMOS_DB_NAME
const endpoint = process.env.COSMOS_ENDPOINT
const key      = process.env.COSMOS_KEY
const db       = new Database({ dbName, endpoint, key })

await db.setup()
