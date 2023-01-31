// For unknown reasons, importing `env.js` directly doesn't work here,
// so I had to load dotenv again here.
import * as dotenv       from 'dotenv'
import Database          from '@digitallinguistics/db'
import { defineConfig }  from 'cypress'
import { fileURLToPath } from 'url'

import {
  dirname as getDirname,
  join as joinPath,
} from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname  = getDirname(__filename)
const envPath    = joinPath(__dirname, `../.env`)

dotenv.config({ path: envPath })

const dbName   = `test`
const endpoint = process.env.COSMOS_ENDPOINT
const key      = process.env.COSMOS_KEY
const db       = new Database({ dbName, endpoint, key })

export default defineConfig({
  downloadsFolder: `test/downloads`,
  e2e:                    {
    baseUrl:     `http://localhost:${ process.env.PORT }`,
    setupNodeEvents(on) {
      on(`task`, {

        async clearDatabase() {
          await db.clear()
          return null
        },

        async deleteDatabase() {
          await db.delete()
          return null
        },

        seedOne(...args) {
          return db.seedOne(...args)
        },

        seedMany(...args) {
          return db.seedMany(...args)
        },

        async setupDatabase() {
          await db.setup()
          return null
        },

      })
    },
    specPattern: [
      `components/**/*.test.js`,
      `layouts/**/*.test.js`,
      `pages/**/*.test.js`,
    ],
    supportFile: false,
  },
  env: {
    msAuthCookie: process.env.MS_AUTH_COOKIE,
    msAuthUser:   process.env.MS_AUTH_USER,
  },
  fixturesFolder:         `test/fixtures`,
  screenshotOnRunFailure: false,
  screenshotsFolder:      `test/screenshots`,
  video:                  false,
  videosFolder:           `test/videos`,
})
