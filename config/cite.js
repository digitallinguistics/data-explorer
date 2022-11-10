import Cite              from 'citation-js'
import { fileURLToPath } from 'url'
import path              from 'path'
import { readFileSync }  from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname  = path.dirname(__filename)

const styleTemplate = readFileSync(path.join(__dirname, `linguistics.csl`), `utf8`)
const styleName     = `ling`
const config        = Cite.plugins.config.get(`@csl`)

config.templates.add(styleName, styleTemplate)

export default Cite
