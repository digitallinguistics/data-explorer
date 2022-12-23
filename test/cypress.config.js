import { defineConfig }  from 'cypress'
import dotenv            from 'dotenv'
import { fileURLToPath } from 'url'
import path              from 'path'
import { readFile }      from 'fs/promises'

// dotenv doesn't work with Cypress for unknown reasons.
// Manually load environment variables instead.
const __filename = fileURLToPath(import.meta.url)
const __dirname  = path.dirname(__filename)
const envPath    = path.join(__dirname, `../.env`)
const envText    = await readFile(envPath, `utf8`)
const env        = dotenv.parse(envText)

console.log(env)

export default defineConfig({
  downloadsFolder: `test/downloads`,
  e2e:                    {
    baseUrl:     `http://localhost:3001`,
    specPattern: [
      `components/**/*.test.js`,
      `layouts/**/*.test.js`,
      `pages/**/*.test.js`,
    ],
    supportFile: false,
  },
  env,
  fixturesFolder:         `test/fixtures`,
  screenshotOnRunFailure: false,
  screenshotsFolder:      `test/screenshots`,
  video:                  false,
  videosFolder:           `test/videos`,
})
