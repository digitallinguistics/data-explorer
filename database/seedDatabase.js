/**
 * Seeds the local database with some sample data for manual testing and exploration.
 */
import '../services/env.js'

import Citer                   from '../services/cite.js'
import compare                 from '../utilities/compare.js'
import { load as convertYAML } from 'js-yaml'
import { CosmosClient }        from '@azure/cosmos'
import { fileURLToPath }       from 'url'
import { readFile }            from 'fs/promises'

import {
  dirname as getDirname,
  join as joinPath,
} from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname  = getDirname(__filename)

const containerName = `data`
const endpoint      = process.env.COSMOS_ENDPOINT
const key           = process.env.COSMOS_KEY
const client        = new CosmosClient({ endpoint, key })
const container     = client.database(`digitallinguistics`).container(containerName)

function addCitations(bibliography, referencesIndex) {

  if (bibliography) {

    bibliography.forEach(citation => {

      const reference = referencesIndex.get(citation.id)

      citation.citation = cite(reference.json, citation.locator)
      citation.bibEntry = reference.bibEntry

    })

    bibliography.sort((a, b) => compare(a.citation, b.citation))

  }

}

function cite(reference, locator) {

  const citer = new Citer(reference)
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

async function loadLexemes(languages, references) {

  const languagesIndex = languages.reduce((map, lang) => {
    map.set(lang.id, lang)
    return map
  }, new Map)

  const referencesIndex = references.reduce((map, ref) => {
    map.set(ref.json.id, ref)
    return map
  }, new Map)

  const lexemes = await loadData(`lexemes`)

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
    addCitations(lexeme.bibliography, referencesIndex)
    lexeme.forms.forEach(form => addCitations(form.bibliography, referencesIndex))
    lexeme.senses.forEach(sense => addCitations(sense.bibliography, referencesIndex))

  }

  return lexemes

}

async function loadReferences() {

  const bibtex = await readFile(joinPath(__dirname, `../data/references.bib`), `utf8`)

  const citer = new Citer(bibtex, {
    forceType:     `@biblatex/text`,
    generateGraph: false,
  })

  const template = `ling`

  const references = citer.get()
  .map(data => {

    const citer = new Citer(data)
    const text  = citer.format(`bibliography`, { template }).trim()

    const html = citer.format(`bibliography`, {
      format: `html`,
      template,
    })
    .trim()
    .replace(/^<div class="csl-bib-body">\s+(.+)\s+<\/div>$/u, `$1`)                // remove wrapper div
    .replace(/<div.+?>(.+)<\/div>/u, `<p class=bib-entry id='${ data.id }'>$1</p>`) // replace <div> with <p>
    .replace(/<i>(.+)<\/i>/u, `<cite class=cite>$1</cite>`)                         // replace <i> with <cite>

    return {
      bibEntry: {
        html,
        text,
      },
      json: data,
      type: `BibliographicReference`,
    }

  })

  return references

}

async function loadData(type) {
  const yaml = await readFile(joinPath(__dirname, `../data/${ type }.yml`))
  return convertYAML(yaml)
}

async function upsert(items) {

  const operations = []

  for (const item of items) {

    operations.push({
      operationType: `Upsert`,
      resourceBody:  item,
    })

    await container.items.bulk(operations)

  }

}

export default async function seedDatabase() {

  const languages  = await loadData(`languages`)
  const projects   = await loadData(`projects`)
  const users      = await loadData(`users`)
  const references = await loadReferences()
  const lexemes    = await loadLexemes(languages, references)

  await upsert(languages)
  await upsert(lexemes)
  await upsert(projects)
  await upsert(references)
  await upsert(users)

}
