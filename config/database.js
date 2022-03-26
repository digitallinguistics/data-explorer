import Database from '../services/Database.js'

const db = new Database

await db.initialize()

export default db
