import Database from '../database/Database.js'

const dbName   = Cypress.env(`dbName`)
const endpoint = Cypress.env(`cosmosEndpoint`)
const key      = Cypress.env(`cosmosKey`)

const db = new Database({ dbName, endpoint, key })

Cypress.Commands.add(`addMany`, db.addMany.bind(db))
Cypress.Commands.add(`clearDatabase`, db.clear.bind(db))
Cypress.Commands.add(`upsertOne`, db.upsertOne.bind(db))
