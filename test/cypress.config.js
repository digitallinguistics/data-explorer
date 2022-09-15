import { defineConfig } from 'cypress'

export default defineConfig({
  downloadsFolder: `test/downloads`,
  e2e:                    {
    baseUrl:     `http://localhost:3001`,
    specPattern: [
      `components/**/*.test.js`,
      `pages/**/*.test.js`,
    ],
    supportFile: false,
  },
  env:             {
    msAuthCookie: `AppServiceAuthSession`,
    msAuthHeader: `X-MS-CLIENT-PRINCIPAL-NAME`,
    testUser:     `test@digitallinguistics.io`,
  },
  fixturesFolder:         `test/fixtures`,
  screenshotOnRunFailure: false,
  screenshotsFolder:      `test/screenshots`,
  video:                  false,
  videosFolder:           `test/videos`,
})
