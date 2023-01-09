import seedDatabase from '../database/seedDatabase.js'

const [,, dbName] = process.argv

await seedDatabase(dbName)
