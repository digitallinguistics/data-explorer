import '../env.js'
import Cite              from 'citation-js'
import Database          from '../database/Database.js'
import { expect }        from 'chai'
import { fileURLToPath } from 'url'
import { readFile }      from 'fs/promises'
import yamlParser        from 'js-yaml'

import {
  dirname as getDirname,
  join as joinPath,
} from 'path'

import Language    from '../models/Language.js'
import Lexeme      from '../models/Lexeme.js'
import Permissions from '../models/Permissions.js'
import Project     from '../models/Project.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname  = getDirname(__filename)

const teardown = true

const badID    = `abc123`
const dbName   = `test`
const endpoint = process.env.COSMOS_ENDPOINT
const key      = process.env.COSMOS_KEY

const db = new Database({ dbName, endpoint, key })

// 3A Pattern:
// 1. Arrange
// 2. Act
// 3. Assert

describe(`Database`, function() {

  before(async function() {

    this.timeout(60000)

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

    await db.setup()

  })

  afterEach(function() {
    // Be sure to return the Promise here so that Mocha waits for cleanup before running the next one.
    if (teardown) return db.clear()
  })

  after(function() {
    if (teardown) return db.database.delete()
  })

  describe(`sproc: count`, function() {

    it(`counts all documents`, async function() {

      const count = 10

      await db.addMany(count)

      const { resource } = await db.container.scripts.storedProcedure(`count`).execute()

      expect(resource.count).to.equal(count)

    })

    it(`filters documents`, async function() {

      const count = 5

      await db.addMany(count, new Language)
      await db.addMany(count, new Lexeme)

      const query = `SELECT * FROM ${ db.containerName } t WHERE t.type = 'Language'`

      const args         = [query]
      const { resource } = await db.container.scripts.storedProcedure(`count`).execute(undefined, args)

      expect(resource.count).to.equal(count)

    })

    it(`uses a continuation token`, async function() {

      const count = 300

      await db.addMany(count)

      let total = 0

      const getCount = async continuationToken => {

        const args         = [undefined, continuationToken]
        const { resource } = await db.container.scripts.storedProcedure(`count`).execute(undefined, args)

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

      await db.addMany(seedCount, new Language)

      const { count, status } = await db.count(`Language`)

      expect(status).to.equal(200)
      expect(count).to.equal(seedCount)

    })

    it(`option: language`, async function() {

      const seedCount = 3

      await db.addMany(seedCount, this.lexeme)
      await db.addMany(seedCount, new Lexeme)

      const { count, status } = await db.count(`Lexeme`, { language: this.language.id })

      expect(status).to.equal(200)
      expect(count).to.equal(seedCount)

    })

    it(`option: project`, async function() {

      const seedCount = 3

      await db.addMany(seedCount, this.language)
      await db.addMany(seedCount, new Language)

      const { count, status } = await db.count(`Language`, { project: this.project.id })

      expect(status).to.equal(200)
      expect(count).to.equal(seedCount)

    })

    it(`options: language + project`, async function() {

      const seedCount = 3

      // add lexemes with language + project
      await db.addMany(seedCount, this.lexeme)

      // add lexemes with language but diferent project
      await db.addMany(seedCount, new Lexeme({
        language: this.language.id,
        projects: [`abc123`],
      }))

      // add lexemes with project but different language
      await db.addMany(seedCount, new Lexeme({
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

  describe(`addOne`, function() {

    it(`201 Created`, async function() {

      const { data, status } = await db.addOne(this.language)

      expect(status).to.equal(201)
      expect(data.name.eng).to.equal(this.language.name.eng)

    })

    it(`409 Conflict`, async function() {

      await db.addOne(this.language)

      const { data, message, status } = await db.addOne(this.language)

      expect(status).to.equal(409)
      expect(data).to.be.undefined
      expect(message).to.be.a(`string`)

    })

  })

  describe(`addMany`, function() {

    // TODO: do a batch (not bulk) create, so that the operation fails and rolls back if any item fails

    it(`201 Created`) // returns an array of created items

    it(`409 Conflict`)

  })

  describe(`getOne`, function() {

    it(`200 OK`, async function() {

      await db.addOne(this.language)

      const { data: language, status } = await db.getOne(this.language.id)

      expect(status).to.equal(200)
      expect(language.name.eng).to.equal(this.language.name.eng)

    })

    it(`404 Not Found`, async function() {

      const { data, status } = await db.getOne(badID)

      expect(status).to.equal(404)
      expect(data).to.be.undefined

    })

  })

  describe(`getMany`, function() {

    it(`200 OK`, async function() {

      // TODO: return a 200 status code if no errors were thrown

      const count    = 3
      const seedData = await db.addMany(count)
      const response = await db.getMany(seedData.map(result => result.resourceBody.id))

      expect(response).to.have.length(3)

      for (const result of response) {
        const seedItem = seedData.find(item => item.resourceBody.id === result.id)
        expect(seedItem).to.exist
      }

    })

    it(`400 Too Many IDs`, async function() {

      const ids                       = new Array(101).fill(badID, 0, 101)
      const { data, message, status } = await db.getMany(ids)

      expect(status).to.equal(400)
      expect(data).to.be.undefined
      expect(message).to.be.a(`string`)

    })

    it(`missing results`, async function() {

      const count    = 3
      const seedData = await db.addMany(count)
      const ids      = seedData.map(result => result.resourceBody.id)

      ids.unshift(badID) // Use unshift here to test that Cosmos DB continues to return results after a 404.

      const results = await db.getMany(ids)

      expect(results).to.have.length(count)

    })

  })

  describe(`getLanguages`, function() {

    it(`200 OK`, async function() {

      const count = 3

      await db.addMany(count, new Language)
      await db.addMany(count, new Lexeme)

      const { data, status } = await db.getLanguages()

      expect(status).to.equal(200)
      expect(data).to.have.length(count)

    })

    it(`many results`, async function() {

      const count = 200

      await db.addMany(count, new Language)

      const { data, status } = await db.getLanguages()

      expect(status).to.equal(200)
      expect(data).to.have.length(count)

    })

    it(`option: project`, async function() {

      const count = 3

      await db.addMany(count, this.language) // add languages with projects
      await db.addMany(count, new Language)  // add languages without a project

      const { data, status } = await db.getLanguages({ project: this.project.id })

      expect(status).to.equal(200)
      expect(data).to.have.length(count)
      expect(data.every(language => language.projects.includes(this.project.id))).to.be.true

    })

  })

  describe(`getLexemes`, function() {

    it(`200 OK`, async function() {

      const count = 3

      await db.addMany(count, new Lexeme)
      await db.addMany(count, new Language)

      const { data, status } = await db.getLexemes()

      expect(status).to.equal(200)
      expect(data).to.have.length(count)

    })

    it(`many results`, async function() {

      const count = 200

      await db.addMany(count, new Lexeme)

      const { data, status } = await db.getLexemes()

      expect(status).to.equal(200)
      expect(data).to.have.length(count)

    })

    it(`option: language`, async function() {

      const count = 3

      await db.addMany(count, this.lexeme)
      await db.addMany(count, new Lexeme)

      const { data, status } = await db.getLexemes({ language: this.language.id })

      expect(status).to.equal(200)
      expect(data).to.have.length(count)
      expect(data.every(lexeme => lexeme.language.id === this.language.id)).to.be.true

    })

    it(`option: project`, async function() {

      const count = 3

      await db.addMany(count, this.lexeme) // add lexemes with projects
      await db.addMany(count, new Lexeme)  // add lexemes without a project

      const { data, status } = await db.getLexemes({ project: this.project.id })

      expect(status).to.equal(200)
      expect(data).to.have.length(count)
      expect(data.every(lexeme => lexeme.projects.includes(this.project.id))).to.be.true

    })

    it(`option: language + project`, async function() {

      const seedCount = 3

      // add lexemes with language and project
      await db.addMany(seedCount, this.lexeme)

      // add lexemes with language but different project
      await db.addMany(seedCount, new Lexeme({
        language: this.language.id,
        projects: [`abc123`],
      }))

      // add lexemes with project but different language
      await db.addMany(seedCount, new Lexeme({
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

      await db.addMany(count, this.project)
      await db.addMany(count, new Language)

      const { data, status } = await db.getProjects()

      expect(status).to.equal(200)
      expect(data).to.have.length(count)

    })

    it(`many results`, async function() {

      const count = 200

      await db.addMany(count, new Project)

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

    it(`option: user`, async function() {

      const count = 3

      await db.addMany(count, this.project)
      await db.addMany(count, new Project({
        permissions: new Permissions({
          public: false,
        }),
      }))

      const { data, status } = await db.getProjects({ user: `owner@digitallinguistics.io` })

      expect(status).to.equal(200)
      expect(data).to.have.length(count)

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

      await db.container.items.bulk(operations)

      const { data, status } = await db.getReferences()

      expect(status).to.equal(200)
      expect(data).to.have.length(this.references.length)

    })

    it(`many results`, async function() {

      const count = 200

      await db.addMany(count, { type: `BibliographicReference` })

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
