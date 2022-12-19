import Citer                   from '../services/cite.js'
import compare                 from '../utilities/compare.js'
import { load as convertYAML } from 'js-yaml'
import { fileURLToPath }       from 'url'
import path                    from 'path'
import { readFile }            from 'fs/promises'

const __filename = fileURLToPath(import.meta.url)
const __dirname  = path.dirname(__filename)

// Things that need to be populated and stored in the actual database,
// rather than generated on startup:
// - citations in a Lexeme (at the lexeme, sense, and form levels)
// - language info in Lexeme
// - bibEntry data in references

function addCitations(bibliography) {

  if (bibliography) {

    bibliography.forEach(citation => {
      const reference = referencesIndex.get(citation.id)
      citation.citation = cite(reference, citation.locator)
      citation.bibEntry = reference.custom.bibEntry
    })

    bibliography.sort((a, b) => compare(a.citation, b.citation))

  }

}

function cite(reference, locator) {

  const citer    = new Citer(reference)
  const template = `ling`

  const entry = {
    id: reference.id,
    locator,
  }

  const firstPart = citer.format(`citation`, {
    entry: Object.assign({ 'author-only': true }, entry),
    template,
  })

  const secondPart = citer.format(`citation`, {
    entry: Object.assign({ 'suppress-author': true }, entry),
    template,
  })

  return `${ firstPart } ${ secondPart }`

}

async function loadData(type) {
  const yaml = await readFile(path.join(__dirname, `./${ type }.yml`))
  return convertYAML(yaml)
}

const languages = await loadData(`languages`)
const lexemes   = await loadData(`lexemes`)
const projects  = await loadData(`projects`)
const users     = await loadData(`users`)
const bibtex    = await readFile(path.join(__dirname, `references.bib`), `utf8`)

const citer = new Citer(bibtex, {
  forceType:     `@bibtex/text`,
  generateGraph: false,
})

citer.sort([`issued`, `author`, `editor`, `title`])

const references      = citer.get()
const referencesIndex = new Map

const textBibEntries = citer.format(`bibliography`, {
  asEntryArray: true,
  template:     `ling`,
}).reduce((map, [id, entry]) => {
  map.set(id, entry.trim())
  return map
}, new Map)

const htmlBibEntries = citer.format(`bibliography`, {
  asEntryArray: true,
  format:       `html`,
  template:     `ling`,
}).reduce((map, [id, raw]) => {

  const html = raw
  .trim()
  .replace(/<div.+?>(.+)<\/div>/u, `<p class=bib-entry id='${ id }'>$1</p>`) // replace <div> with <p>
  .replace(/<i>(.+)<\/i>/u, `<cite class=cite>$1</cite>`)                    // replace <i> with <cite>

  map.set(id, html)
  return map

}, new Map)

for (const reference of references) {

  reference.custom = {
    bibEntry: {
      html: htmlBibEntries.get(reference.id),
      text: textBibEntries.get(reference.id),
    },
  }

  referencesIndex.set(reference.id, reference)

}

const languagesIndex = languages.reduce((map, lang) => {
  map.set(lang.id, lang)
  return map
}, new Map)

for (const lexeme of lexemes) {

  // add language info
  const language = languagesIndex.get(lexeme.language)

  lexeme.language = Object.assign({}, {
    defaultAnalysisLanguage: language.defaultAnalysisLanguage,
    defaultOrthography:      language.defaultOrthography,
    id:                      language.id,
    name:                    language.name,
  })

  // add citations
  addCitations(lexeme.bibliography)
  lexeme.forms.forEach(form => addCitations(form.bibliography))
  lexeme.senses.forEach(sense => addCitations(sense.bibliography))

}

export default {
  languages,
  lexemes,
  projects,
  references,
  users,
}
