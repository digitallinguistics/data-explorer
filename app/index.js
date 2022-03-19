import addLocals               from './locals.js'
import addRoutes               from './routes.js'
import auth                    from '../middleware/auth.js'
import cookieParser            from 'cookie-parser'
import express                 from 'express'
import { fileURLToPath }       from 'url'
import handleUncaughtException from './errors.js'
import hbs                     from '../config/handlebars.js'
import helmet                  from '../middleware/helmet.js'
import locals                  from '../middleware/locals.js'
import logger                  from '../middleware/logger.js'
import path                    from 'path'
import staticOptions           from '../middleware/static.js'

import { env, port } from '../config/app.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname  = path.dirname(__filename)

function serverCallback() {
  console.info(`Server started on port ${ port } in ${ env } mode. Press Ctrl+C to terminate.`)
}

// Handle uncaught exceptions
process.on(`uncaughtException`, handleUncaughtException)

// Initialize
const app = express()

// Settings
app.enable(`trust proxy`)
app.engine(`hbs`, hbs.engine)
app.set(`env`, env)
app.set(`view engine`, `hbs`)
app.set(`views`, path.resolve(__dirname, `../pages`))

await addLocals(app.locals)

// Middleware
app.use(helmet)
app.use(express.static(path.join(__dirname, `../public`), staticOptions))
app.use(cookieParser())
app.use(auth)
app.use(locals)
app.use(logger)

addRoutes(app.router)

// Start server
app.listen(port, serverCallback)
