import { ExpressHandlebars } from 'express-handlebars'
import { fileURLToPath }     from 'url'
import getDefaultLanguage    from '../utilities/getDefaultLanguage.js'
import path                  from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname  = path.dirname(__filename)

/**
 * Renders a Date object as a short date (YYYY-MM-DD).
 * @param {Date} d A Date Object
 */
function date(d) {
  return new Date(d).toLocaleDateString(`en-CA`)
}

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
    date,
    mls,
    section,
  },
  layoutsDir:    path.resolve(__dirname, `../layout`),
  partialsDir:   [
    path.resolve(__dirname, `../components`),
    path.resolve(__dirname, `../layout`),
    path.resolve(__dirname, `../pages`),
    path.resolve(__dirname, `../public/styles`),
  ],
})

export default hbs
