import addLocals         from '../middleware/locals.js'
import addRoutes         from './routes.js'
import express           from 'express'
import { fileURLToPath } from 'url'
import hbs               from '../config/handlebars.js'
import path              from 'path'

import { env, port } from '../config/app.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname  = path.dirname(__filename)

function serverCallback() {
  console.info(`Server started on port ${ port } in ${ env } mode. Press Ctrl+C to terminate.`)
}

// Initialize
const app = express()

await addLocals(app.locals)
addRoutes(app.router)

// Settings
app.enable(`trust proxy`)
app.engine(`hbs`, hbs.engine)
app.set(`env`, env)
app.set(`view engine`, `hbs`)
app.set(`views`, path.resolve(__dirname, `../pages`))

// Start server
app.listen(port, serverCallback)
