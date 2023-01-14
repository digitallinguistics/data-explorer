import Database from '../database/Database.js'

const dbName   = Cypress.env(`dbName`)
const endpoint = Cypress.env(`cosmosEndpoint`)
const key      = Cypress.env(`cosmosKey`)

const db = new Database({ dbName, endpoint, key })

Cypress.Commands.add(`seedOne`, db.seedOne.bind(db))
Cypress.Commands.add(`seedMany`, db.seedMany.bind(db))
Cypress.Commands.add(`clearDatabase`, db.clear.bind(db))
Cypress.Commands.add(`deleteDatabase`, db.delete.bind(db))
Cypress.Commands.add(`setupDatabase`, db.setup.bind(db))
