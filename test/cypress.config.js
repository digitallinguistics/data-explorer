import { defineConfig } from 'cypress'

export default defineConfig({
  component: {
    devServer: {
      bundler:   `webpack`,
      framework: `react`,
    },
    indexHtmlFile: `index.html`,
    specPattern:   `pages/**/*.component.js`,
    supportFile:   `test/component.js`,
  },
  downloadsFolder: `test/downloads`,
  e2e:                    {
    baseUrl:     `http://localhost:3001`,
    specPattern: `pages/**/*.e2e.js`,
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
