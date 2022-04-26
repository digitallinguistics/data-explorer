import { ExpressHandlebars } from 'express-handlebars'
import { fileURLToPath }     from 'url'
import getDefaultLanguage    from '../utilities/getDefaultLanguage.js'
import path                  from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/**
 * Renders the given analysis language for a MultiLangString.
 * @param {MultiLangString} string   The MultiLangString object to render.
 * @param {String}          language The language to render the MLS in.
 * @returns
 */
function mls(string, language) {
  return getDefaultLanguage(string, language)
}

function section(name, opts) {
  this.sections ??= {}
  this.sections[name] = opts.fn(this)
  return null
}

const hbs = new ExpressHandlebars({
  defaultLayout: `layout`,
  extname:       `hbs`,
  helpers:       {
    mls,
    section,
  },
  layoutsDir:    path.resolve(__dirname, `../layout`),
  partialsDir:   [
    path.resolve(__dirname, `../components`),
    path.resolve(__dirname, `../layout`),
    path.resolve(__dirname, `../pages`),
  ],
})

export default hbs
