// For unknown reasons, importing `env.js` directly doesn't work here,
// so I had to load dotenv again here.
import * as dotenv       from 'dotenv'
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

export default defineConfig({
  downloadsFolder: `test/downloads`,
  e2e:                    {
    baseUrl:     `http://localhost:${ process.env.PORT }`,
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
