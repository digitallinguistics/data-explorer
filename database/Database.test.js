import '../env.js'
import Cite              from 'citation-js'
import Database          from '../database/Database.js'
import { expect }        from 'chai'
import { fileURLToPath } from 'url'
import path              from 'path'
import { randomUUID }    from 'crypto'
import { readFile }      from 'fs/promises'
import yamlParser        from 'js-yaml'

import BibliographicReference from '../models/BibliographicReference.js'
import Language               from '../models/Language.js'
import Lexeme                 from '../models/Lexeme.js'
import Permissions            from '../models/Permissions.js'
import Project                from '../models/Project.js'
import Text                   from '../models/Text.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname  = path.dirname(__filename)

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

    const languagePath = path.join(__dirname, `../data/language.yml`)
    const languageYAML = await readFile(languagePath, `utf8`)

    this.language = yamlParser.load(languageYAML)

    const lexemePath = path.join(__dirname, `../data/lexeme.yml`)
    const lexemeYAML = await readFile(lexemePath, `utf8`)

    this.lexeme = yamlParser.load(lexemeYAML)

    const projectPath = path.join(__dirname, `../data/project.yml`)
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

    return db.setup()

  })

  afterEach(function() {
    if (teardown) return db.clear()
  })

  after(function() {
    if (teardown) return db.delete()
  })


  // GENERIC METHODS

  describe(`count`, function() {

    it(`200 OK`, async function() {

      const seedCount = 3

      await db.seedMany(`data`, seedCount, new Lexeme({
        language: {
          id: randomUUID(),
        },
      }))

      const { count, status } = await db.count(`Lexeme`)

      expect(status).to.equal(200)
      expect(count).to.equal(seedCount)

    })

    it(`option: language`, async function() {

      const seedCount = 3

      const lexeme = new Lexeme({
        language: {
          id: randomUUID(),
        },
      })

      await db.seedMany(`data`, seedCount, this.lexeme)
      await db.seedMany(`data`, seedCount, lexeme)

      const { count, status } = await db.count(`Lexeme`, { language: this.language.id })

      expect(status).to.equal(200)
      expect(count).to.equal(seedCount)

    })

    it(`option: project`, async function() {

      const seedCount = 3

      const lexeme = new Lexeme({
        language: {
          id: randomUUID(),
        },
      })

      // `data` container (not optimized)

      await db.seedMany(`data`, seedCount, this.lexeme)
      await db.seedMany(`data`, seedCount, lexeme)

      let { count, status } = await db.count(`Lexeme`, { project: this.project.id })

      expect(status).to.equal(200)
      expect(count).to.equal(seedCount)

      // `metadata` container (optimized)

      await db.seedMany(`metadata`, seedCount, this.language)
      await db.seedMany(`metadata`, seedCount, new Language)

      ;({ count, status } = await db.count(`Language`, { project: this.project.id })) // eslint-disable-line semi-style

      expect(status).to.equal(200)
      expect(count).to.equal(seedCount)

    })

    it(`options: language + project`, async function() {

      const seedCount      = 3
      const otherProjectID = randomUUID()

      // add lexemes with language + project
      await db.seedMany(`data`, seedCount, this.lexeme)

      // add lexemes with language but different project
      await db.seedMany(`data`, seedCount, new Lexeme({
        language: { id: this.language.id },
        projects: [otherProjectID],
      }))

      // add lexemes with project but different language
      await db.seedMany(`data`, seedCount, new Lexeme({
        language: { id: randomUUID() },
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

  describe(`getOne`, function() {

    const container = `metadata`

    it(`200 OK`, async function() {

      await db.seedOne(container, this.language)

      const { data, status } = await db.getOne(container, this.language.type, this.language.id)

      expect(status).to.equal(200)
      expect(data.name.eng).to.equal(this.language.name.eng)

    })

    it(`404 Not Found`, async function() {

      const { data, status } = await db.getOne(container, `Language`, badID)

      expect(status).to.equal(404)
      expect(data).to.be.undefined

    })

  })

  describe(`getMany`, function() {

    const container = `data`

    it(`200 OK`, async function() {

      const count            = 3
      const lexeme           = new Lexeme({ language: { id: randomUUID() } })
      const seedData         = await db.seedMany(container, count, lexeme)
      const ids              = seedData.map(({ resourceBody }) => resourceBody.id)
      const { data, status } = await db.getMany(container, lexeme.language.id, ids)

      expect(status).to.equal(207)
      expect(data).to.have.length(count)

      const [result] = data

      expect(result.status).to.equal(200)
      expect(result.data.id).to.equal(ids[0])

    })

    it(`400 Too Many IDs`, async function() {

      const ids                       = new Array(101).fill(badID, 0, 101)
      const { data, message, status } = await db.getMany(`data`, undefined, ids)

      expect(status).to.equal(400)
      expect(data).to.be.undefined
      expect(message).to.be.a(`string`)

    })

    it(`missing results`, async function() {

      const count      = 3
      const languageID = randomUUID()

      const lexeme = new Lexeme({
        language: {
          id: languageID,
        },
      })

      const seedData = await db.seedMany(`data`, count, lexeme)
      const ids      = seedData.map(({ resourceBody }) => resourceBody.id)

      ids.unshift(badID) // Use unshift here to test that Cosmos DB continues to return results after a 404.

      const { data, status } = await db.getMany(container, languageID, ids)

      expect(status).to.equal(207)
      expect(data).to.have.length(count + 1)

      const firstResult = data.shift()

      expect(firstResult.status).to.equal(404)
      expect(firstResult.data).to.be.undefined

      for (const item of data) {
        expect(item.status).to.equal(200)
        expect(ids).to.include(item.data.id)
      }

    })

  })


  // TYPE-SPECIFIC METHODS

  describe(`getLanguage`, function() {

    it(`200 OK`, async function() {

      const { resource: language } = await db.seedOne(`metadata`, new Language({ test: randomUUID() }))
      const { data, status }       = await db.getLanguage(language.id)

      expect(status).to.equal(200)
      expect(data.test).to.equal(language.test)

    })

    it(`404 Not Found`, async function() {

      const { data, status } = await db.getLanguage(badID)

      expect(status).to.equal(404)
      expect(data).to.be.undefined

    })

  })

  describe(`getLanguages`, function() {

    it(`200 OK`, async function() {

      const count = 3

      await db.seedMany(`metadata`, count, new Language)
      await db.seedMany(`metadata`, count, new Project)

      const { data, status } = await db.getLanguages()

      expect(status).to.equal(200)
      expect(data).to.have.length(count)

    })

    it(`many results`, async function() {

      const count = 200

      await db.seedMany(`metadata`, count, new Language)

      const { data, status } = await db.getLanguages()

      expect(status).to.equal(200)
      expect(data).to.have.length(count)

    })

    it(`option: project`, async function() {

      const count     = 3
      const container = `metadata`

      await db.seedMany(container, count, this.language) // add languages with projects
      await db.seedMany(container, count, new Language) // add languages without projects

      const { data, status } = await db.getLanguages({ project: this.project.id })

      expect(status).to.equal(200)
      expect(data).to.have.length(count)
      expect(data.every(language => language.projects.includes(this.project.id))).to.be.true

    })

  })

  describe(`getLexeme`, function() {

    it(`200 OK`, async function() {

      const lexemeData = new Lexeme({
        language: {
          id: randomUUID(),
        },
        test: randomUUID(),
      })

      const { resource: lexeme } = await db.seedOne(`data`, lexemeData)
      const { data, status }     = await db.getLexeme(lexeme.language.id, lexeme.id)

      expect(status).to.equal(200)
      expect(data.test).to.equal(lexeme.test)

    })

    it(`404 Not Found`, async function() {

      const lexeme = new Lexeme({
        language: {
          id: randomUUID(),
        },
      })

      // Seeding the database with another lexeme from the same language
      // ensures that the partition being targeted exists.
      await db.seedOne(`data`, lexeme)

      const { data, status } = await db.getLexeme(lexeme.language.id, badID)

      expect(status).to.equal(404)
      expect(data).to.be.undefined

    })

  })

  describe(`getLexemes`, function() {

    const container = `data`

    it(`200 OK`, async function() {

      const count = 3

      const language = {
        id: randomUUID(),
      }

      await db.seedMany(container, count, new Lexeme({ language }))
      await db.seedMany(container, count, new Text({ language }))

      const { data, status } = await db.getLexemes()

      expect(status).to.equal(200)
      expect(data).to.have.length(count)

    })

    it(`many results`, async function() {

      const count = 200

      const lexeme = new Lexeme({
        language: {
          id: randomUUID(),
        },
      })

      await db.seedMany(`data`, count, lexeme)

      const { data, status } = await db.getLexemes()

      expect(status).to.equal(200)
      expect(data).to.have.length(count)

    })

    it(`option: language`, async function() {

      const count = 3

      const lexeme = new Lexeme({
        language: {
          id: randomUUID(),
        },
      })

      await db.seedMany(container, count, this.lexeme)
      await db.seedMany(container, count, lexeme)

      const { data, status } = await db.getLexemes({ language: this.language.id })

      expect(status).to.equal(200)
      expect(data).to.have.length(count)
      expect(data.every(lexeme => lexeme.language.id === this.language.id)).to.be.true

    })

    it(`option: project`, async function() {

      const count = 3

      const lexeme = new Lexeme({
        language: {
          id: randomUUID(),
        },
      })

      await db.seedMany(container, count, this.lexeme) // add lexemes with projects
      await db.seedMany(container, count, lexeme)      // add lexemes without a project

      const { data, status } = await db.getLexemes({ project: this.project.id })

      expect(status).to.equal(200)
      expect(data).to.have.length(count)
      expect(data.every(lexeme => lexeme.projects.includes(this.project.id))).to.be.true

    })

    it(`option: language + project`, async function() {

      const count = 3

      // add lexemes with language and project
      await db.seedMany(container, count, this.lexeme)

      // add lexemes with language but different project
      await db.seedMany(container, count, new Lexeme({
        language: { id: this.language.id },
        projects: [randomUUID()],
      }))

      // add lexemes with project but different language
      await db.seedMany(container, count, new Lexeme({
        language: { id: randomUUID() },
        projects: [this.project.id],
      }))

      const { data, status } = await db.getLexemes({
        language: this.language.id,
        project:  this.project.id,
      })

      expect(status).to.equal(200)
      expect(data).to.have.length(3)

    })

    it(`no results`, async function() {

      // This should return an empty array, not 404.
      // It's entirely possible to create a language but not have added lexemes for it yet.
      const { data, status } = await db.getLexemes({ language: badID })

      expect(status).to.equal(200)
      expect(data).to.have.length(0)

    })

  })

  describe(`getProject`, function() {

    it(`200 OK`, async function() {

      const { resource: project } = await db.seedOne(`metadata`, new Project({ test: randomUUID() }))

      const { data, status } = await db.getProject(project.id)

      expect(status).to.equal(200)
      expect(data.test).to.equal(project.test)

    })

    it(`404 Not Found`, async function() {

      const { data, status } = await db.getProject(badID)

      expect(status).to.equal(404)
      expect(data).to.be.undefined

    })

  })

  describe(`getProjects`, function() {

    const container = `metadata`

    it(`200 OK`, async function() {

      const count = 3

      await db.seedMany(container, count, this.project)
      await db.seedMany(container, count, new Language)

      const { data, status } = await db.getProjects()

      expect(status).to.equal(200)
      expect(data).to.have.length(count)

    })

    it(`many results`, async function() {

      const count = 200

      await db.seedMany(container, count, new Project)

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

      await db.seedMany(container, count, this.project)

      await db.seedMany(container, count, new Project({
        permissions: new Permissions({
          public: false,
        }),
      }))

      const { data, status } = await db.getProjects({ user: `owner@digitallinguistics.io` })

      expect(status).to.equal(200)
      expect(data).to.have.length(count)

    })

  })

  describe(`getReference`, function() {

    const container = `metadata`

    it(`200 OK`, async function() {

      const { resource: reference } = await db.seedOne(container, new BibliographicReference({ test: randomUUID() }))
      const { data, status }        = await db.getReference(reference.id)

      expect(status).to.equal(200)
      expect(data.test).to.equal(reference.test)

    })

    it(`404 Not Found`, async function() {

      const { data, status } = await db.getReference(badID)

      expect(status).to.equal(404)
      expect(data).to.be.undefined

    })

  })

  describe(`getReferences`, function() {

    const container = `metadata`

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

      await db[container].items.bulk(operations)

      const { data, status } = await db.getReferences()

      expect(status).to.equal(200)
      expect(data).to.have.length(this.references.length)

    })

    it(`many results`, async function() {

      const count = 200

      await db.seedMany(container, count, new BibliographicReference)

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
