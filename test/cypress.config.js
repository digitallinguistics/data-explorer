import { defineConfig } from 'cypress'
// import handler          from 'serve-handler'
// import http             from 'http'

export default defineConfig({
  component: {
    devServer: {
      bundler:   `webpack`,
      framework: `react`,
    },
    // The following custom dev server works, but cannot find the HTML skeleton for component tests (`test/index.html`).
    // Using the bundled webpack dev server for now.
    // async devServer() {

    //   const port   = 3004
    //   const server = http.createServer(handler)

    //   const startServer = () => new Promise((resolve, reject) => {
    //     server.on(`error`, reject)
    //     server.listen(port, resolve)
    //   })

    //   const closeServer = () => new Promise((resolve, reject) => {
    //     server.on(`error`, reject)
    //     server.close(resolve)
    //   })

    //   await startServer()

    //   return {
    //     close() { return closeServer() },
    //     port,
    //   }

    // },
    indexHtmlFile:    `index.html`,
    specPattern:      `pages/**/*.component.js`,
    supportFile:      `test/component.js`,
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
