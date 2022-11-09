import Cite                    from '../config/cite.js'
import { load as convertYAML } from 'js-yaml'
import { fileURLToPath }       from 'url'
import path                    from 'path'
import { readFile }            from 'fs/promises'

const __filename = fileURLToPath(import.meta.url)
const __dirname  = path.dirname(__filename)

async function loadData(type) {
  const yaml = await readFile(path.join(__dirname, `./${ type }.yml`))
  return convertYAML(yaml)
}

const languages = await loadData(`languages`)
const lexemes   = await loadData(`lexemes`)
const projects  = await loadData(`projects`)
const users     = await loadData(`users`)
const bibtex    = await readFile(path.join(__dirname, `references.bib`), `utf8`)

const cite = new Cite(bibtex, {
  forceType:     `@bibtex/text`,
  generateGraph: false,
})

const references = cite.get()

// TODO: Use `asEntryArray` option here
// https://citation.js.org/api/0.5/module-@citation-js_plugin-csl.output.html#.citation

for (const reference of references) {

  const raw = cite.format(`bibliography`, {
    entry:    reference.id,
    format:   `html`,
    template: `ling`,
  })

  const html = raw
  .replace(/^.+\n\s*/u, ``)                                                            // remove start of wrapper <div>
  .replace(/\n\s*.+$/u, ``)                                                            // remove end of wrapper <div>
  .replace(/<div.+?>(.+)<\/div>/u, `<p class=bib-entry id='${ reference.id }'>$1</p>`) // replace <div> with <p>
  .replace(/<i>(.+)<\/i>/u, `<cite class=cite>$1</cite>`)                              // replace <i> with <cite>

  reference.custom = {
    bibEntry: html,
  }

}

export default {
  languages,
  lexemes,
  projects,
  references,
  users,
}
