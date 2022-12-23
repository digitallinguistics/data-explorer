import setupDatabase from '../database/setupDatabase.js'

const [,, dbName] = process.argv

if (!dbName) {
  throw new Error(`Provide a database name as the first argument.`)
}

await setupDatabase(dbName)
