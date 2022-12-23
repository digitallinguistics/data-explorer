import seedDatabase from '../database/seedDatabase.js'

const [,, dbName = `test`] = process.argv

await seedDatabase(dbName)
