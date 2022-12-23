import setupDatabase from '../database/setupDatabase.js'

const [,, dbName] = process.argv

if (!dbName) {
  throw new Error(`Provide a database name as the first argument.`)
}

process.env.NODE_TLS_REJECT_UNAUTHORIZED = `0`

await setupDatabase(dbName)
