import Database   from './Database.js'
import { expect } from 'chai'
import fs         from 'fs-extra'
import yamlParser from 'js-yaml'

const { readFile } = fs

describe(`Database`, function() {

  const badUser    = `bademail@digitallinguistics.io`
  const languageID = `850f3bd9-2a57-4289-bc57-05640b5d8d7d` // Plains Cree
  const lexemeID   = `79eb0aaf-944c-40b4-93f3-e1785ec0adde` // cīkahikan (Plains Cree)
  const projectID  = `c554474c-7f39-4ede-941b-c40b8f58b059` // Nisinoon

  before(async function() {

    const languagesYAML = await readFile(`data/languages.yml`, `utf8`)
    const languages     = yamlParser.load(languagesYAML)

    this.language = languages.find(lang => lang.id === languageID)

    const lexemesYAML = await readFile(`data/lexemes.yml`, `utf8`)
    const lexemes     = yamlParser.load(lexemesYAML)

    this.lexeme = lexemes.find(lex => lex.id === lexemeID)

    const projectsYAML = await readFile(`data/projects.yml`, `utf8`)
    const projects     = yamlParser.load(projectsYAML)

    this.project = projects.find(proj => proj.id === projectID)

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
      expect(data).to.have.lengthOf(6)
    })

    it(`option: project`, async function() {
      const db = new Database
      const { data, status } = await db.getLanguages({ project: projectID })
      expect(status).to.equal(200)
      expect(data).to.have.lengthOf(4)
      expect(data.every(language => language.projects.includes(projectID))).to.be.true
    })

  })

  describe(`getLexeme`, function() {

    it(`returns a copy of the data`, async function() {
      const db = new Database
      const { data: a } = await db.getLexeme(lexemeID)
      const { data: b } = await db.getLexeme(lexemeID)
      expect(a).to.not.equal(b)
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

    it(`returns copies of the data`, async function() {
      const db = new Database
      const { data: [a] } = await db.getLexemes()
      const { data: [b] } = await db.getLexemes()
      expect(a).to.not.equal(b)
    })

    it(`returns all lexemes by default`, async function() {
      const db = new Database
      const { data, status } = await db.getLexemes()
      expect(status).to.equal(200)
      expect(data).to.have.lengthOf(18)
    })

    it(`option: language`, async function() {
      const db = new Database
      const { data, status } = await db.getLexemes({ language: languageID })
      expect(status).to.equal(200)
      expect(data).to.have.lengthOf(3)
      expect(data.every(lexeme => lexeme.language.id === languageID)).to.be.true
    })

    it(`option: project`, async function() {
      const db = new Database
      const { data, status } = await db.getLexemes({ project: projectID })
      expect(status).to.equal(200)
      expect(data).to.have.lengthOf(11)
      expect(data.every(lexeme => lexeme.projects.includes(projectID))).to.be.true
    })

    it(`option: summary`, async function() {
      const db = new Database
      const { data, status } = await db.getLexemes({ project: projectID, summary: true })
      expect(status).to.equal(200)
      expect(data.count).to.equal(11)
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

})
