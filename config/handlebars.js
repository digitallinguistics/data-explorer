import { ExpressHandlebars } from 'express-handlebars'
import { fileURLToPath }     from 'url'
import getDefaultLanguage    from '../utilities/getDefaultLanguage.js'
import getDefaultOrthography from '../utilities/getDefaultOrthography.js'
import path                  from 'path'
import prepareTranscription  from '../utilities/prepareTranscription.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname  = path.dirname(__filename)

/**
 * Renders a Date object as a short date (YYYY-MM-DD).
 * @param {Date} d A Date Object
 */
function date(d) {
  return d ? new Date(d).toLocaleDateString(`en-CA`) : ``
}

/**
 * Renders the given analysis language for a MultiLangString.
 * @param   {MultiLangString} data The MultiLangString object to render.
 * @param   {String}          lang The language to render the MLS in.
 * @returns {String}
 */
function mls(data, lang) {
  return getDefaultLanguage(data, lang)
}

function number(num) {
  return Number(num).toLocaleString()
}

function section(name, opts) {
  this.sections       ??= {}
  this.sections[name]   = opts.fn(this)
  return null
}

/**
 * Renders the given orthography for a Transcription.
 * @param   {Transcription} data  The Transcription object to render.
 * @param   {String}        ortho The orthography to render the Transcription in.
 * @returns {String}
 */
function txn(data, ortho) {
  if (typeof data === `string`) return prepareTranscription(data)
  return prepareTranscription(getDefaultOrthography(data, ortho))
}

const hbs = new ExpressHandlebars({
  defaultLayout: `main/main.hbs`,
  extname:       `hbs`,
  helpers:       {
    date,
    mls,
    number,
    section,
    txn,
  },
  layoutsDir:    path.resolve(__dirname, `../layouts`),
  partialsDir:   [
    path.resolve(__dirname, `../components`),
    path.resolve(__dirname, `../layouts/main`),
    path.resolve(__dirname, `../pages`),
  ],
})

export default hbs
