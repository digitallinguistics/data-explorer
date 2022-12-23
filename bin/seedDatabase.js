import seedDatabase from '../database/seedDatabase.js'

const [,, dbName = `test`] = process.argv

process.env.NODE_TLS_REJECT_UNAUTHORIZED = `0`

await seedDatabase(dbName)
