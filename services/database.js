import Database from '../database/Database.js'

const dbName   = process.env.NODE_ENV === `production` ? `digitallinguistics` : `test`
const endpoint = process.env.COSMOS_ENDPOINT
const key      = process.env.COSMOS_KEY
const db       = new Database({ dbName, endpoint, key })

export default db
