import { ExpressHandlebars } from 'express-handlebars'
import { fileURLToPath }     from 'url'
import path                  from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const hbs = new ExpressHandlebars({
  defaultLayout: `index`,
  extname:       `hbs`,
  layoutsDir:    path.resolve(__dirname, `../layout`),
  partialsDir:   [
    path.resolve(__dirname, `../components`),
    path.resolve(__dirname, `../layout`),
  ],
})

export default hbs
