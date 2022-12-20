import '../services/env.js'

import db                from '../services/database.js'
import { expect }        from 'chai'
import { fileURLToPath } from 'url'
import { readFile }      from 'fs/promises'
import yamlParser        from 'js-yaml'

import {
  dirname as getDirname,
  join as joinPath,
} from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname  = getDirname(__filename)

const { client }    = db
const dbName        = `test`
const containerName = `data`

// 3A Pattern:
// 1. Arrange
// 2. Act
// 3. Assert

// Note: Cosmos DB's Node SDK limits bulk transactions to 100 operations.

describe(`Database`, function() {

  before(async function() {

    const languagePath = joinPath(__dirname, `../data/language.yml`)
    const languageYAML = await readFile(languagePath, `utf8`)

    this.language = yamlParser.load(languageYAML)

    const { database }  = await client.databases.createIfNotExists({ id: dbName })
    const { container } = await database.containers.createIfNotExists({ id: containerName })

    this.database  = database
    this.container = container

    // NOTE: Cosmos DB Create methods modify the original object by setting an `id` property on it.

    this.addOne = async function addOne(data = {}) {
      const { resource } = await this.container.items.create(Object.assign({}, data))
      return resource
    }

    this.addMany = function addMany(count, data = {}) {

      const operations = []

      for (let i = 0; i < count; i++) {
        operations[i] = {
          operationType: `Create`,
          resourceBody:  Object.assign({}, data),
        }
      }

      return this.container.items.bulk(operations)

    }

  })

  afterEach(async function() {

    const { resources } = await this.container.items.readAll().fetchAll()

    const operations = resources.map(item => ({
      id:            item.id,
      operationType: `Delete`,
    }))

    await this.container.items.bulk(operations)

  })

  after(async function() {
    await client.database(dbName).delete()
  })

  describe(`getLanguage`, function() {

    it(`200 OK`, async function() {

      const data = await this.addOne(this.language)

      const { data: language, status } = await db.getLanguage(data.id)

      expect(status).to.equal(200)
      expect(language.name.eng).to.equal(data.name.eng)

    })

    it(`404 Not Found`, async function() {

      const { data, status } = await db.getLanguage(`bad-id`)

      expect(status).to.equal(404)
      expect(data).to.be.undefined

    })

  })

  describe(`getLanguages`, function() {

    it(`200 OK`, async function() {

      const count = 3

      await this.addMany(count, this.language)

      const { data, status } = await db.getLanguages()

      expect(status).to.equal(200)
      expect(data).to.have.length(count)

    })

  })

})
