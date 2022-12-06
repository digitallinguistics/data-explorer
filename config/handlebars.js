import { ExpressHandlebars } from 'express-handlebars'
import { fileURLToPath }     from 'url'
import getDefaultLanguage    from '../utilities/getDefaultLanguage.js'
import getDefaultOrthography from '../utilities/getDefaultOrthography.js'
import path                  from 'path'
import prepareTranscription  from '../utilities/prepareTranscription.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname  = path.dirname(__filename)

/**
 * Checks to see whether the object passed to the helper has any data in it (any keys), and whether the object exists at all.
 */
function all(...args) {
  return args.every(isTruthy)
}

function any(...args) {
  return args.some(isTruthy)
}

function concat(...args) {
  args.pop()
  return args.join(``)
}

/**
 * Renders a Date object as a short date (YYYY-MM-DD).
 * @param {Date} d A Date Object
 */
function date(d, type = `short`) {
  if (!d) return ``
  if (type === `long`) return new Date(d).toLocaleDateString(undefined, { dateStyle: `long` })
  return new Date(d).toLocaleDateString(`en-CA`)
}

function is(a, b) {
  return a == b
}

function isFalse(value) {
  return value === false
}

function isTruthy(value) {
  if (!value) return false
  if (Array.isArray(value) && !value.length) return false
  return Object.keys(value).length > 0
}

function isNull(value) {
  return value === null
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

/**
 * Renders the given orthography for a Transcription.
 * @param   {Transcription} data  The Transcription object to render.
 * @param   {String}        ortho The orthography to render the Transcription in.
 * @returns {String}
 */
function mot(data, ortho) {
  if (!data) return ``
  if (typeof data === `string`) return prepareTranscription(data)
  return prepareTranscription(getDefaultOrthography(data, ortho))
}

function number(num) {
  return Number(num).toLocaleString()
}

function obj(value) {
  return value && Object.keys(value).length > 0
}

function section(name, opts) {
  this.sections       ??= {}
  this.sections[name]   = opts.fn(this)
  return null
}

const hbs = new ExpressHandlebars({
  defaultLayout: `main/main.hbs`,
  extname:       `hbs`,
  helpers:       {
    all,
    any,
    concat,
    date,
    is,
    isFalse,
    isNull,
    mls,
    mot,
    number,
    obj,
    section,
  },
  layoutsDir:    path.resolve(__dirname, `../layouts`),
  partialsDir:   [
    path.resolve(__dirname, `../components`),
    path.resolve(__dirname, `../layouts/main`),
    path.resolve(__dirname, `../pages`),
  ],
})

export default hbs
