import * as dotenv from 'dotenv'

dotenv.config()

import { CosmosClient } from '@azure/cosmos'

const endpoint = process.env.COSMOS_ENDPOINT
const key      = process.env.COSMOS_KEY

const client = new CosmosClient({ endpoint, key })
await client.database(`Test Database`).delete()
