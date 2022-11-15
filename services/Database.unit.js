import Cite       from 'citation-js'
import Database   from './Database.js'
import { expect } from 'chai'
import fs         from 'fs-extra'
import Lexeme     from '../models/Lexeme.js'
import yamlParser from 'js-yaml'

const { readFile } = fs

describe(`Database`, function() {

  const badUser     = `bademail@digitallinguistics.io`
  const languageID  = `850f3bd9-2a57-4289-bc57-05640b5d8d7d`  // Plains Cree
  const lexemeID    = `79eb0aaf-944c-40b4-93f3-e1785ec0adde`  // cīkahikan (Plains Cree)
  const projectID   = `c554474c-7f39-4ede-941b-c40b8f58b059`  // Nisinoon
  const referenceID = `Hieber2019b`                           // Semantic alignment in Chitimacha

  before(async function() {

    const languagesYAML = await readFile(`data/languages.yml`, `utf8`)

    this.languages = yamlParser.load(languagesYAML)
    this.language  = this.languages.find(lang => lang.id === languageID)

    const lexemesYAML = await readFile(`data/lexemes.yml`, `utf8`)

    this.lexemes = yamlParser.load(lexemesYAML)
    this.lexeme  = this.lexemes.find(lex => lex.id === lexemeID)

    const projectsYAML = await readFile(`data/projects.yml`, `utf8`)
    const projects     = yamlParser.load(projectsYAML)

    this.project = projects.find(proj => proj.id === projectID)

    const bibtex = await readFile(`data/references.bib`, `utf8`)

    const { data: references } = new Cite(bibtex, {
      forceType:     `@bibtex/text`,
      generateGraph: false,
    })

    this.references = references
    this.reference  = references.find(ref => ref.id === referenceID)

  })

  describe(`getLanguage`, function() {

    it(`returns a copy of the data`, async function() {
      const db = new Database
      const { data: a } = await db.getLanguage(languageID)
      const { data: b } = await db.getLanguage(languageID)
      expect(a).to.not.equal(b)
    })

    it(`200 OK`, async function() {
      const db = new Database
      const { data: language, status } = await db.getLanguage(languageID)
      expect(status).to.equal(200)
      expect(language.name.eng).to.equal(this.language.name.eng)
    })

    it(`404 Not Found`, async function() {
      const db = new Database
      const { data, status } = await db.getLanguage(`bad-id`)
      expect(status).to.equal(404)
      expect(data).to.be.undefined
    })

  })

  describe(`getLanguages`, function() {

    it(`returns copies of the data`, async function() {
      const db = new Database
      const { data: [a] } = await db.getLanguages()
      const { data: [b] } = await db.getLanguages()
      expect(a).to.not.equal(b)
    })

    it(`returns all languages by default`, async function() {
      const db = new Database
      const { data, status } = await db.getLanguages()
      expect(status).to.equal(200)
      expect(data).to.have.lengthOf(this.languages.length)
    })

    it(`option: project`, async function() {
      const db = new Database
      const { data, status } = await db.getLanguages({ project: projectID })
      expect(status).to.equal(200)
      expect(data).to.have.lengthOf(5)
      expect(data.every(language => language.projects.includes(projectID))).to.be.true
    })

  })

  describe(`getLexeme`, function() {

    it(`returns a Lexeme object with copied data`, async function() {
      const db = new Database
      const { data: a } = await db.getLexeme(lexemeID)
      const { data: b } = await db.getLexeme(lexemeID)
      expect(a).to.be.an.instanceof(Lexeme)
      expect(a).to.not.equal(b)
      expect(a.senses).to.not.equal(b.senses)
    })

    it(`200 OK`, async function() {
      const db = new Database
      const { data, status } = await db.getLexeme(lexemeID)
      expect(status).to.equal(200)
      expect(data.lemma.SRO).to.equal(this.lexeme.lemma.SRO)
    })

    it(`404 Not Found`, async function() {
      const db = new Database
      const { data, status } = await db.getLexeme(`bad-id`)
      expect(status).to.equal(404)
      expect(data).to.be.undefined
    })

  })

  describe(`getLexemes`, function() {

    it(`returns Lexeme objects with copied data`, async function() {
      const db = new Database
      const { data: [a] } = await db.getLexemes()
      const { data: [b] } = await db.getLexemes()
      expect(a).to.be.an.instanceof(Lexeme)
      expect(b).to.be.an.instanceof(Lexeme)
      expect(a).to.not.equal(b)
      expect(a.senses).to.not.equal(b.senses)
    })

    it(`returns all lexemes by default`, async function() {
      const db = new Database
      const { data, status } = await db.getLexemes()
      expect(status).to.equal(200)
      expect(data).to.have.lengthOf(this.lexemes.length)
    })

    it(`option: language`, async function() {
      const db = new Database
      const { data, status } = await db.getLexemes({ language: languageID })
      expect(status).to.equal(200)
      expect(data).to.have.lengthOf(4)
      expect(data.every(lexeme => lexeme.language.id === languageID)).to.be.true
    })

    it(`option: project`, async function() {

      const db               = new Database
      const { data, status } = await db.getLexemes({ project: projectID })
      const projectLexemes   = this.lexemes.filter(lexeme => lexeme.projects.includes(projectID))

      expect(status).to.equal(200)
      expect(data).to.have.lengthOf(projectLexemes.length)
      expect(data.every(lexeme => lexeme.projects.includes(projectID))).to.be.true

    })

    it(`option: summary`, async function() {

      const db               = new Database
      const { data, status } = await db.getLexemes({ project: projectID, summary: true })
      const projectLexemes   = this.lexemes.filter(lexeme => lexeme.projects.includes(projectID))

      expect(status).to.equal(200)
      expect(data.count).to.equal(projectLexemes.length)

    })

    it(`returns an empty array for nonexistent projects/languages`, async function() {
      const db = new Database
      const { data, status } = await db.getLexemes({ project: `bad-id` })
      expect(status).to.equal(200)
      expect(data).to.be.empty
    })

  })

  describe(`getProject`, function() {

    it(`returns a copy of the data`, async function() {
      const db = new Database
      const { data: a } = await db.getProject(projectID)
      const { data: b } = await db.getProject(projectID)
      expect(a).to.not.equal(b)
    })

    it(`200 OK`, async function() {
      const db = new Database
      const { data, status } = await db.getProject(projectID)
      expect(status).to.equal(200)
      expect(data.name).to.equal(this.project.name)
    })

    it(`404 Not Found`, async function() {
      const db = new Database
      const { data, status } = await db.getProject(`bad-id`)
      expect(status).to.equal(404)
      expect(data).to.be.undefined
    })

  })

  describe(`getProjects`, function() {

    it(`returns copies of the data`, async function() {
      const db = new Database
      const { data: [a] } = await db.getProjects()
      const { data: [b] } = await db.getProjects()
      expect(a).to.not.equal(b)
    })

    it(`returns all projects by default`, async function() {
      const db = new Database
      const { data, status } = await db.getProjects()
      expect(status).to.equal(200)
      expect(data).to.have.length(4)
    })

    it(`returns an empty array if there are no projects`, async function() {
      const db = new Database
      db.projects = []
      const { data, status } = await db.getProjects(badUser)
      expect(status).to.equal(200)
      expect(data).to.be.empty
    })

  })

  describe(`getReference`, function() {

    it(`returns a copy of the data`, async function() {
      const db = new Database
      const { data: a } = await db.getReference(referenceID)
      const { data: b } = await db.getReference(referenceID)
      expect(a).to.not.equal(b)
    })

    it(`includes the bibliography entry`, async function() {
      const db = new Database
      const { data } = await db.getReference(referenceID)
      expect(data.custom.bibEntry.html.startsWith(`<p class=bib-entry`)).to.be.true
      expect(data.custom.bibEntry.text.startsWith(`Hieber, Daniel W. 2019b. Semantic alignment`)).to.be.true
    })

    it(`200 OK`, async function() {
      const db = new Database
      const { data, status } = await db.getReference(referenceID)
      expect(status).to.equal(200)
      expect(data.title).to.equal(this.reference.title)
    })

    it(`404 Not Found`, async function() {
      const db = new Database
      const { data, status } = await db.getReference(`bad-id`)
      expect(status).to.equal(404)
      expect(data).to.be.undefined
    })

  })

  describe(`getReferences`, function() {

    const ids = [
      `Bloomfield1924`,
      `Goddard1990`,
    ]

    it(`returns copies of the data`, async function() {
      const db = new Database
      const { data: [a] } = await db.getReferences()
      const { data: [b] } = await db.getReferences()
      expect(a).to.not.equal(b)
    })

    it(`returns all references by default`, async function() {
      const db = new Database
      const { data, status } = await db.getReferences()
      expect(status).to.equal(200)
      expect(data).to.have.length(this.references.length)
    })

    it(`options: ids`, async function() {

      const db = new Database
      const { data, status } = await db.getReferences({ ids })

      expect(status).to.equal(200)
      expect(data).to.have.lengthOf(2)

      const [a, b] = data
      expect(a.title).to.equal(`The Menomini language`)
      expect(b.title).to.equal(`Primary and secondary stem derivation in Algonquian`)

    })

    it(`option: summary`, async function() {
      const db = new Database
      const { data, status } = await db.getReferences({ ids, summary: true })
      expect(status).to.equal(200)
      expect(data.count).to.equal(2)
    })

    it(`returns an empty array if there are no references`, async function() {
      const db = new Database
      const { data, status } = await db.getReferences({ ids: [] })
      expect(status).to.equal(200)
      expect(data).to.have.lengthOf(0)
    })

  })

})
