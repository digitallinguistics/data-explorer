import compare            from '../utilities/compare.js'
import { fileURLToPath }  from 'url'
import getDefaultLanguage from '../utilities/getDefaultLanguage.js'
import path               from 'path'
import { readFile }       from 'fs/promises'
import yaml               from 'js-yaml'

/**
 * A class for managing the database connection.
 */
export default class Database {

  async initialize() {
    const __filename    = fileURLToPath(import.meta.url)
    const __dirname     = path.dirname(__filename)
    const languagesPath = path.join(__dirname, `../data/languages.yml`)
    const languagesYAML = await readFile(languagesPath, `utf8`)
    const usersPath     = path.join(__dirname, `../data/users.yml`)
    const usersYAML     = await readFile(usersPath, `utf8`)
    this.languages      = yaml.load(languagesYAML)
    this.users          = yaml.load(usersYAML)
  }

  async getLanguages(user) {

    const results = this.languages
    .filter(lang => lang.permissions.public
      || lang.permissions.owners.includes(user)
      || lang.permissions.editors.includes(user)
      || lang.permissions.viewers.includes(user))
    .sort((a, b) => compare(
      getDefaultLanguage(a.name, a.defaultAnalysisLanguage),
      getDefaultLanguage(b.name, b.defaultAnalysisLanguage),
    ))

    // Always return a duplicate of the data
    // so that the original data aren't modified.
    // Cannot use `structuredClone()` yet
    // because it's only supported in Node v17.
    return JSON.parse(JSON.stringify(results))

  }

}
