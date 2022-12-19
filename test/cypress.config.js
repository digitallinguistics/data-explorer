import * as dotenv from 'dotenv'

dotenv.config()

import { defineConfig } from 'cypress'

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
  env:             {
    msAuthCookie: process.env.MS_AUTH_COOKIE,
    msAuthHeader: process.env.MS_AUTH_HEADER,
    testUser:     process.env.MS_AUTH_USER,
  },
  fixturesFolder:         `test/fixtures`,
  screenshotOnRunFailure: false,
  screenshotsFolder:      `test/screenshots`,
  video:                  false,
  videosFolder:           `test/videos`,
})
