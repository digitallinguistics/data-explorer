import deleteDatabase from '../database/deleteDatabase.js'

const [, , dbName] = process.argv

if (!dbName) {
  throw new Error(`Provide a database name as the first argument.`)
}

await deleteDatabase(dbName)
