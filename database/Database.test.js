import '../services/env.js'

import chunk             from '../utilities/chunk.js'
import Cite              from 'citation-js'
import Database          from '../database/Database.js'
import { expect }        from 'chai'
import { fileURLToPath } from 'url'
import { readFile }      from 'fs/promises'
import setupDatabase     from './setupDatabase.js'
import yamlParser        from 'js-yaml'

import {
  dirname as getDirname,
  join as joinPath,
} from 'path'

import Language from '../models/Language.js'
import Lexeme   from '../models/Lexeme.js'
import Project  from '../models/Project.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname  = getDirname(__filename)

const teardown = true

const badID         = `abc123`
const bulkLimit     = 100
const dbName        = `test`
const containerName = `data`

const db = new Database(dbName)

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

    const bibtex = await readFile(`data/references.bib`, `utf8`)

    const { data: references } = new Cite(bibtex, {
      forceType:     `@biblatex/text`,
      generateGraph: false,
    })

    this.references = references.map(ref => ({
      reference: ref,
      type:      `BibliographicReference`,
    }))

    // Setup test database

    this.client    = await setupDatabase(`test`)
    this.database  = this.client.database(dbName)
    this.container = this.database.container(containerName)

    // Create helper functions for seeding the database.
    // NOTE: Cosmos DB Create methods modify the original object by setting an `id` property on it.

    this.addOne = async function addOne(data = {}) {
      const { resource } = await this.container.items.upsert(Object.assign({}, data))
      return resource
    }

    this.addMany = async function addMany(count, data = {}) {

      const operations = []

      for (let i = 0; i < count; i++) {

        const resourceBody = Object.assign({}, data)
        delete resourceBody.id

        operations[i] = {
          operationType: `Upsert`,
          resourceBody,
        }

      }

      const batches = chunk(operations, bulkLimit)
      const results = []

      for (const batch of batches) {
        const response = await this.container.items.bulk(batch)
        results.push(...response)
      }

      return results

    }

  })

  afterEach(async function() {

    if (!teardown) return

    const { resources } = await this.container.items.readAll().fetchAll()

    const batches = chunk(resources, bulkLimit)

    for (const batch of batches) {

      const operations = batch.map(item => ({
        id:            item.id,
        operationType: `Delete`,
      }))

      await this.container.items.bulk(operations)

    }

  })

  after(async function() {
    if (teardown) await this.client.database(dbName).delete()
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

      await this.addMany(count, new Language)
      await this.addMany(count, new Lexeme)

      const query = `SELECT * FROM ${ db.containerName } t WHERE t.type = 'Language'`

      const args         = [query]
      const { resource } = await this.container.scripts.storedProcedure(`count`).execute(undefined, args)

      expect(resource.count).to.equal(count)

    })

    it(`uses a continuation token`, async function() {

      const count = 300

      await this.addMany(count)

      let total = 0

      const getCount = async continuationToken => {

        const args         = [undefined, continuationToken]
        const { resource } = await this.container.scripts.storedProcedure(`count`).execute(undefined, args)

        total += resource.count

        if (resource.continuationToken) await getCount(resource.continuationToken)

      }

      await getCount()

      expect(total).to.equal(count)

    })

  })

  describe(`count`, function() {

    it(`200 OK`, async function() {

      const seedCount = 3

      await this.addMany(seedCount, new Language)

      const { count, status } = await db.count(`Language`)

      expect(status).to.equal(200)
      expect(count).to.equal(seedCount)

    })

    it(`option: language`, async function() {

      const seedCount = 3

      await this.addMany(seedCount, this.lexeme)
      await this.addMany(seedCount, new Lexeme)

      const { count, status } = await db.count(`Lexeme`, { language: this.language.id })

      expect(status).to.equal(200)
      expect(count).to.equal(seedCount)

    })

    it(`option: project`, async function() {

      const seedCount = 3

      await this.addMany(seedCount, this.language)
      await this.addMany(seedCount, new Language)

      const { count, status } = await db.count(`Language`, { project: this.project.id })

      expect(status).to.equal(200)
      expect(count).to.equal(seedCount)

    })

    it(`options: language + project`, async function() {

      const seedCount = 3

      // add lexemes with language + project
      await this.addMany(seedCount, this.lexeme)

      // add lexemes with language but diferent project
      await this.addMany(seedCount, new Lexeme({
        language: this.language.id,
        projects: [`abc123`],
      }))

      // add lexemes with project but different language
      await this.addMany(seedCount, new Lexeme({
        language: `abc123`,
        projects: [this.project.id],
      }))

      const { count, status } = await db.count(`Lexeme`, {
        language: this.language.id,
        project:  this.project.id,
      })

      expect(status).to.equal(200)
      expect(count).to.equal(seedCount)

    })

  })

  describe(`get`, function() {

    it(`200 OK`, async function() {

      const data                       = await this.addOne(this.language)
      const { data: language, status } = await db.get(data.id)

      expect(status).to.equal(200)
      expect(language.name.eng).to.equal(data.name.eng)

    })

    it(`404 Not Found`, async function() {

      const { data, status } = await db.get(badID)

      expect(status).to.equal(404)
      expect(data).to.be.undefined

    })

  })

  describe(`getMany`, function() {

    it(`200 OK`, async function() {

      const count    = 3
      const seedData = await this.addMany(count)
      const response = await db.getMany(seedData.map(result => result.resourceBody.id))

      expect(response).to.have.length(3)

      for (const result of response) {
        const seedItem = seedData.find(item => item.resourceBody.id === result.id)
        expect(seedItem).to.exist
      }

    })

    it(`400 Too Many IDs`, async function() {

      const ids = new Array(101).fill(badID, 0, 101)
      const { data, message, status } = await db.getMany(ids)

      expect(status).to.equal(400)
      expect(data).to.be.undefined
      expect(message).to.be.a(`string`)

    })

    it(`missing results`, async function() {

      const count    = 3
      const seedData = await this.addMany(count)
      const ids      = seedData.map(result => result.resourceBody.id)

      ids.unshift(badID) // Use unshift here to test that Cosmos DB continues to return results after a 404.

      const results = await db.getMany(ids)

      expect(results).to.have.length(count)

    })

  })

  describe(`getLanguages`, function() {

    it(`200 OK`, async function() {

      const count = 3

      await this.addMany(count, new Language)
      await this.addMany(count, new Lexeme)

      const { data, status } = await db.getLanguages()

      expect(status).to.equal(200)
      expect(data).to.have.length(count)

    })

    it(`many results`, async function() {

      const count = 200

      await this.addMany(count, new Language)

      const { data, status } = await db.getLanguages()

      expect(status).to.equal(200)
      expect(data).to.have.length(count)

    })

    it(`option: project`, async function() {

      const count = 3

      await this.addMany(count, this.language) // add languages with projects
      await this.addMany(count, new Language)  // add languages without a project

      const { data, status } = await db.getLanguages({ project: this.project.id })

      expect(status).to.equal(200)
      expect(data).to.have.length(count)
      expect(data.every(language => language.projects.includes(this.project.id))).to.be.true

    })

  })

  describe(`getLexemes`, function() {

    it(`200 OK`, async function() {

      const count = 3

      await this.addMany(count, new Lexeme)
      await this.addMany(count, new Language)

      const { data, status } = await db.getLexemes()

      expect(status).to.equal(200)
      expect(data).to.have.length(count)

    })

    it(`many results`, async function() {

      const count = 200

      await this.addMany(count, new Lexeme)

      const { data, status } = await db.getLexemes()

      expect(status).to.equal(200)
      expect(data).to.have.length(count)

    })

    it(`option: language`, async function() {

      const count = 3

      await this.addMany(count, this.lexeme)
      await this.addMany(count, new Lexeme)

      const { data, status } = await db.getLexemes({ language: this.language.id })

      expect(status).to.equal(200)
      expect(data).to.have.length(count)
      expect(data.every(lexeme => lexeme.language.id === this.language.id)).to.be.true

    })

    it(`option: project`, async function() {

      const count = 3

      await this.addMany(count, this.lexeme) // add lexemes with projects
      await this.addMany(count, new Lexeme)  // add lexemes without a project

      const { data, status } = await db.getLexemes({ project: this.project.id })

      expect(status).to.equal(200)
      expect(data).to.have.length(count)
      expect(data.every(lexeme => lexeme.projects.includes(this.project.id))).to.be.true

    })

    it(`option: language + project`, async function() {

      const seedCount = 3

      // add lexemes with language and project
      await this.addMany(seedCount, this.lexeme)

      // add lexemes with language but different project
      await this.addMany(seedCount, new Lexeme({
        language: this.language.id,
        projects: [`abc123`],
      }))

      // add lexemes with project but different language
      await this.addMany(seedCount, new Lexeme({
        language: `abc123`,
        projects: [this.project.id],
      }))

      const { data, status } = await db.getLexemes({
        language: this.language.id,
        project:  this.project.id,
      })

      expect(status).to.equal(200)
      expect(data).to.have.length(3)

    })

    // This should return an empty array, not 404.
    // It's entirely possible to create a language but not have added lexemes for it yet.
    it(`no results`, async function() {

      const { data, status } = await db.getLexemes({ language: badID })

      expect(status).to.equal(200)
      expect(data).to.have.length(0)

    })

  })

  describe(`getProjects`, function() {

    it(`200 OK`, async function() {

      const count = 3

      await this.addMany(count, this.project)
      await this.addMany(count, new Language)

      const { data, status } = await db.getProjects()

      expect(status).to.equal(200)
      expect(data).to.have.length(count)

    })

    it(`many results`, async function() {

      const count = 200

      await this.addMany(count, new Project)

      const { data, status } = await db.getProjects()

      expect(status).to.equal(200)
      expect(data).to.have.length(count)

    })

    // Do not test for `language` or `lexeme` options.
    // Projects don't contain info about their languages or lexemes.
    // The client should first request the lexeme/language,
    // then use `getMany()` to retrieve the associated projects by their IDs.

    it(`no results`, async function() {

      const { data, status } = await db.getProjects()

      expect(status).to.equal(200)
      expect(data).to.have.length(0)

    })

  })

  describe(`getReferences`, function() {

    it(`200 OK`, async function() {

      const operations    = []
      const operationType = `Upsert`

      for (const reference of this.references) {

        const resourceBody = Object.assign({}, reference)

        operations.push({
          operationType,
          resourceBody,
        })

      }

      await this.container.items.bulk(operations)

      const { data, status } = await db.getReferences()

      expect(status).to.equal(200)
      expect(data).to.have.length(this.references.length)

    })

    it(`many results`, async function() {

      const count = 200

      await this.addMany(count, { type: `BibliographicReference` })

      const { data, status } = await db.getReferences()

      expect(status).to.equal(200)
      expect(data).to.have.length(count)

    })

    it(`no results`, async function() {

      const { data, status } = await db.getReferences()

      expect(status).to.equal(200)
      expect(data).to.have.length(0)

    })

  })

})
