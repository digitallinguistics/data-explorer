import { fileURLToPath }            from 'url'
import yaml                         from 'js-yaml'
import { readFile, writeFile }      from 'fs/promises'

import {
  dirname as getDirname,
  join as joinPath,
} from 'path'

const __filename  = fileURLToPath(import.meta.url)
const __dirname   = getDirname(__filename)

const citationPath = joinPath(__dirname, `../CITATION.cff`)
const citationText = await readFile(citationPath, `utf8`)

const packagePath = joinPath(__dirname, `../package.json`)
const packageText = await readFile(packagePath, `utf8`)

const citationObject = yaml.load(citationText)
const packageObject =  yaml.load(packageText)
citationObject['date-released'] = new Date().toLocaleDateString('en-CA')
citationObject['version'] = packageObject['version']

const updatedText = yaml.dump(citationObject)
await writeFile(citationPath, updatedText, `utf8`);
