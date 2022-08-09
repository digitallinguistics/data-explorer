import { defineConfig } from 'cypress'

export default defineConfig({
  downloadsFolder: `test/downloads`,
  e2e:                    {
    baseUrl:     `http://localhost:3001`,
    specPattern: [
      `components/**/*.component.js`,
      `pages/**/*.e2e.js`,
      `pages/**/*.component.js`,
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
