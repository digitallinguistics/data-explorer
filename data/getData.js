import '../env.js'
import Database from '../database/Database.js'

import {
  convertLanguages,
  getLanguagesData,
  readNDJSON,
  writeNDJSON,
} from 'nisinoon'

const filepath = `data/languages.ndjson`

async function fetchLanguagesData() {

  const data      = await getLanguagesData()
  const languages = convertLanguages(data)

  writeNDJSON(filepath, languages)

}

const languages = await readNDJSON(filepath)
const dbName    = `Nisinoon`
const endpoint  = process.env.COSMOS_ENDPOINT
const key       = process.env.COSMOS_KEY

const db = new Database({ dbName, endpoint, key })

await db.setup()
