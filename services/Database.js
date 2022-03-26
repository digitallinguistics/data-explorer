import { fileURLToPath } from 'url'
import path              from 'path'
import { readFile }      from 'fs/promises'
import yaml              from 'js-yaml'

/**
 * A class for managing the database connection.
 */
export default class Database {

  async initialize() {
    const __filename    = fileURLToPath(import.meta.url)
    const __dirname     = path.dirname(__filename)
    const languagesPath = path.join(__dirname, `../data/languages.yml`)
    const languagesYAML = await readFile(languagesPath, `utf8`)
    this.languages      = yaml.load(languagesYAML)
  }

  async getLanguages() {
    return this.languages
  }

}
