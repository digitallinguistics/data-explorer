import { CosmosClient } from '@azure/cosmos'

const endpoint = process.env.COSMOS_ENDPOINT
const key      = process.env.COSMOS_KEY

const client = new CosmosClient({ endpoint, key })

export default class Database {}
