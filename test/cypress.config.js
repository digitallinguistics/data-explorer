// For unknown reasons, importing `env.js` directly doesn't work here,
// so I had to load dotenv again here.
import * as dotenv       from 'dotenv'
import Database          from '../database/Database.js'
import { fileURLToPath } from 'url'

import {
  dirname as getDirname,
  join as joinPath,
} from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname  = getDirname(__filename)
const envPath    = joinPath(__dirname, `../.env`)

dotenv.config({ path: envPath })

import { defineConfig } from 'cypress'
import deleteDatabase   from '../database/deleteDatabase.js'
import seedDatabase     from '../database/seedDatabase.js'

const dbName   = `test`
const endpoint = process.env.COSMOS_ENDPOINT
const key      = process.env.COSMOS_KEY

export default defineConfig({
  downloadsFolder: `test/downloads`,
  e2e:                    {
    baseUrl:     `http://localhost:${ process.env.PORT }`,
    setupNodeEvents(on) {
      on(`task`, {
        async deleteDatabase() {
          await deleteDatabase(dbName)
          return null // required by Cypress to verify that the task completed

        },
        async seedDatabase() {
          await seedDatabase(dbName)
          return null // required by Cypress to verify that the task completed
        },
        async setupDatabase() {
          const db = new Database({ dbName, endpoint, key })
          await db.setup()
          // Do not return the result of `setup()` directly.
          // Cypress tries to serialize it and it throws an error.
          // Cypress does however require some return value here to verify that the task completed.
          return null
        },
      })
    },
    specPattern: [
      `components/**/*.test.js`,
      `layouts/**/*.test.js`,
      `pages/**/*.test.js`,
    ],
    supportFile: `test/support.js`,
  },
  env: {
    containerName:  `data`,
    cosmosEndpoint: process.env.COSMOS_ENDPOINT,
    cosmosKey:      process.env.COSMOS_KEY,
    dbName:         `test`,
    msAuthCookie:   process.env.MS_AUTH_COOKIE,
    msAuthUser:     process.env.MS_AUTH_USER,
  },
  fixturesFolder:         `test/fixtures`,
  screenshotOnRunFailure: false,
  screenshotsFolder:      `test/screenshots`,
  video:                  false,
  videosFolder:           `test/videos`,
})
