import '../services/env.js'

import chunk             from '../utilities/chunk.js'
import db                from '../services/database.js'
import { expect }        from 'chai'
import { fileURLToPath } from 'url'
import Language          from '../models/Language.js'
import { readFile }      from 'fs/promises'
import yamlParser        from 'js-yaml'

import {
  dirname as getDirname,
  join as joinPath,
} from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname  = getDirname(__filename)

const teardown = true

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

    // Retrieve data fixtures

    const languagePath = joinPath(__dirname, `../data/language.yml`)
    const languageYAML = await readFile(languagePath, `utf8`)

    this.language = yamlParser.load(languageYAML)

    const lexemePath = joinPath(__dirname, `../data/lexeme.yml`)
    const lexemeYAML = await readFile(lexemePath, `utf8`)

    this.lexeme = yamlParser.load(lexemeYAML)

    const projectPath = joinPath(__dirname, `../data/project.yml`)
    const projectYAML = await readFile(projectPath, `utf8`)

    this.project = yamlParser.load(projectYAML)

    // Initialize Cosmos DB

    const { database }  = await client.databases.createIfNotExists({ id: dbName })
    const { container } = await database.containers.createIfNotExists({ id: containerName })

    this.database  = database
    this.container = container

    // Register stored procedures

    const scriptPath = joinPath(__dirname, `./sprocs/count.js`)
    const script     = await readFile(scriptPath, `utf8`)

    try {
      await container.scripts.storedProcedures.create({
        body: script,
        id:   `count`,
      })
    } catch (error) {
      // The sproc will already exist if the database hasn't been torn down.
      // Ignore the 409 error and continue if this is the case, and throw otherwise.
      if (error.code !== 409) throw error
    }

    // Create helper functions for seeding the database.
    // NOTE: Cosmos DB Create methods modify the original object by setting an `id` property on it.

    this.addOne = async function addOne(data = {}) {
      const { resource } = await container.items.upsert(Object.assign({}, data))
      return resource
    }

    this.addMany = function addMany(count, data = {}) {

      const operations = []

      for (let i = 0; i < count; i++) {

        const resourceBody = Object.assign({}, data)
        delete resourceBody.id

        operations[i] = {
          operationType: `Upsert`,
          resourceBody,
        }

      }

      return container.items.bulk(operations)

    }

  })

  afterEach(async function() {

    if (!teardown) return

    const { resources } = await this.container.items.readAll().fetchAll()

    const batches = chunk(resources, 100)

    for (const batch of batches) {

      const operations = batch.map(item => ({
        id:            item.id,
        operationType: `Delete`,
      }))

      await this.container.items.bulk(operations)

    }

  })

  after(async function() {
    if (teardown) await client.database(dbName).delete()
  })

  describe(`sproc: count`, function() {

    it(`counts all documents`, async function() {

      const count = 10

      await this.addMany(count)

      const { resource } = await this.container.scripts.storedProcedure(`count`).execute()

      expect(resource.count).to.equal(count)

    })

    it(`filters documents`, async function() {

      const count = 5

      await this.addMany(count, this.language)
      await this.addMany(count, this.lexeme)

      const query = `SELECT * FROM ${ db.containerName } t WHERE t.type = 'Language'`

      const args         = [query]
      const { resource } = await this.container.scripts.storedProcedure(`count`).execute(undefined, args)

      expect(resource.count).to.equal(count)

    })

    it(`uses a continuation token`, async function() {

      const count = 100

      await this.addMany(count)
      await this.addMany(count)
      await this.addMany(count)

      let total = 0

      const getCount = async continuationToken => {

        const args         = [undefined, continuationToken]
        const { resource } = await this.container.scripts.storedProcedure(`count`).execute(undefined, args)

        total += resource.count

        if (resource.continuationToken) await getCount(resource.continuationToken)

      }

      await getCount()

      expect(total).to.equal(300)

    })

  })

  describe(`countLanguages`, function() {

    it(`200 OK`, async function() {

      const seedCount = 3

      await this.addMany(seedCount, new Language)

      const { count, status } = await db.countLanguages()

      expect(status).to.equal(200)
      expect(count).to.equal(seedCount)

    })

    it(`option: project`, async function() {

      const seedCount = 3

      await this.addMany(seedCount, this.language)
      await this.addMany(seedCount, new Language)

      const { count, status } = await db.countLanguages({ project: this.project.id })

      expect(status).to.equal(200)
      expect(count).to.equal(seedCount)

    })

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

    it(`option: project`, async function() {

      const count = 3

      await this.addMany(count, this.language) // add languages with projects
      await this.addOne(new Language)          // add a language without a project
      await this.addOne(this.project)          // add the project

      const { data, status } = await db.getLanguages({ project: this.project.id })

      expect(status).to.equal(200)
      expect(data).to.have.length(count)
      expect(data.every(language => language.projects.includes(this.project.id))).to.be.true

    })

  })

  describe(`getLexeme`, function() {

    it(`200 OK`, async function() {

      await this.addOne(this.lexeme)

      const { data, status } = await db.getLexeme(this.lexeme.id)

      expect(status).to.equal(200)
      expect(data.lemma.transcription.Modern).to.equal(this.lexeme.lemma.transcription.Modern)

    })

    it(`404 Not Found`, async function() {

      const { data, status } = await db.getLexeme(`bad-id`)

      expect(status).to.equal(404)
      expect(data).to.be.undefined

    })

  })

  describe(`getLexemes`, function() {

    it(`200 OK`)

    it(`option: language`)

    it(`option: project`)

    it(`option: summary`)

  })

})
