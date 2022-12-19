import { CosmosClient } from '@azure/cosmos'
import { expect }       from 'chai'

const endpoint = `http://localhost:8081`
const key      = `C2y6yDjf5/R+ob0N8A7Cgv30VRDJIWEHLM+4QDU5DE2nQ9nDuVTqobD4b8mGGyPMbIZnqyMsEcaGQy67XIw/Jw==`
const client   = new CosmosClient({ endpoint, key })

const result = await client.databases.createIfNotExists({ id: `Test Database` })

describe(`Database`, function() {
  it(`works`, function() {
    expect(true).to.be.true
  })
})
