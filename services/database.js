import Database from '../database/Database.js'

const dbName = process.env.NODE_ENV === `production` ? `digitallinguistics` : `test`
const db     = new Database(dbName)

export default db
