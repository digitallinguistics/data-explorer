import Cite                    from 'citation-js'
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

const bibtex               = await readFile(path.join(__dirname, `references.bib`), `utf8`)
const { data: references } = new Cite(bibtex, {
  forceType:     `@bibtex/text`,
  generateGraph: false,
})

export default {
  languages,
  lexemes,
  projects,
  references,
  users,
}
