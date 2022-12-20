import Database from '../Database/Database.js'

const dbName = process.env.NODE_ENV === `production` ? `digitallinguistics` : `test`

const db = new Database(dbName)

export default db
