import addLocals         from '../middleware/locals.js'
import addRoutes         from './routes.js'
import express           from 'express'
import { fileURLToPath } from 'url'
import hbs               from '../config/handlebars.js'
import helmet            from '../middleware/helmet.js'
import path              from 'path'
import staticOptions     from '../middleware/static.js'

import { env, port } from '../config/app.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname  = path.dirname(__filename)

function serverCallback() {
  console.info(`Server started on port ${ port } in ${ env } mode. Press Ctrl+C to terminate.`)
}

// Initialize
const app = express()

// Settings
app.enable(`trust proxy`)
app.engine(`hbs`, hbs.engine)
app.set(`env`, env)
app.set(`view engine`, `hbs`)
app.set(`views`, path.resolve(__dirname, `../pages`))
app.use(helmet)
app.use(express.static(path.join(__dirname, `../assets`), staticOptions))

await addLocals(app.locals)
addRoutes(app.router)

// Start server
app.listen(port, serverCallback)
