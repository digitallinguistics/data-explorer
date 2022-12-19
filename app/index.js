import * as dotenv from 'dotenv'

dotenv.config()

import addLocals               from './locals.js'
import addRoutes               from './routes.js'
import auth                    from '../middleware/auth.js'
import cookieParser            from 'cookie-parser'
import errors                  from '../middleware/errors.js'
import express                 from 'express'
import { fileURLToPath }       from 'url'
import handleUncaughtException from './errors.js'
import hbs                     from '../services/handlebars.js'
import helmet                  from '../middleware/helmet.js'
import locals                  from '../middleware/locals.js'
import logger                  from '../middleware/logger.js'
import path                    from 'path'
import staticMiddleware        from '../middleware/static.js'
import vary                    from '../middleware/vary.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname  = path.dirname(__filename)

process.on(`uncaughtException`, handleUncaughtException)

// Initialize
const app = express()

// Settings
app.enable(`trust proxy`)
app.engine(`hbs`, hbs.engine)
app.set(`env`, process.env.NODE_ENV)
app.set(`view engine`, `hbs`)
app.set(`views`, path.join(__dirname, `../pages`))

await addLocals(app.locals)

// Middleware
app.use(errors)
app.use(helmet)
app.use(vary)
app.use(staticMiddleware(express))
app.use(cookieParser())
app.use(auth)
app.use(locals)
app.use(logger)

addRoutes(app.router)

// Start server
app.listen(process.env.PORT, () => {
  console.info(`Server started on port ${ process.env.PORT } in ${ process.env.NODE_ENV } mode. Press Ctrl+C to terminate.`)
})
