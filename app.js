import express           from 'express'
import { fileURLToPath } from 'url'
import { getLocals }     from './middleware/index.js'
import hbs               from './config/handlebars.js'
import path              from 'path'

import { env, port } from './config/app.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname  = path.dirname(__filename)

function serverCallback() {
  console.info(`Server started on port ${ port } in ${ env } mode. Press Ctrl+C to terminate.`)
}

// Initialize app
const app = express()

// Settings
app.enable(`trust proxy`)
app.engine(`hbs`, hbs.engine)
app.set(`env`, env)
app.set(`view engine`, `hbs`)
app.set(`views`, path.resolve(__dirname, `./pages`))

// Locals
await getLocals(app.locals)

// Routing
app.get(`/`, (req, res) => {
  res.render(`Home`)
})

app.get(`/languages`, (req, res) => {
  res.render(`Languages`)
})

// Start server
app.listen(port, serverCallback)
