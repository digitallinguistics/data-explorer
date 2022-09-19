import Database   from './Database.js'
import { expect } from 'chai'

describe(`Database`, function() {

  const badUser    = `bademail@digitallinguistics.io`
  const languageID = `3876b870-e7cd-46d2-bca8-2db1cd0a51ac`
  const lexemeID   = `c00d0d77-4615-46f5-af59-f4b8c795311a`
  const projectID  = `6a0fcc10-859c-4af1-8105-156ccfd95310`

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
      expect(language.name.eng).to.equal(`Public Test Language`)
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

    it(`returns all languages`, async function() {
      const db = new Database
      const { data, status } = await db.getLanguages()
      expect(status).to.equal(200)
      expect(data).to.have.lengthOf(11)
    })

    it(`returns an empty array if there are no languages`, async function() {
      const db = new Database
      db.languages = []
      const { data, status } = await db.getLanguages()
      expect(status).to.equal(200)
      expect(data).to.be.empty
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
      expect(data.lemma.spa).to.equal(`vivir`)
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
      expect(data).to.have.lengthOf(3)
    })

    it(`option: language`, async function() {
      const db = new Database
      const { data, status } = await db.getLexemes({ language: languageID })
      expect(status).to.equal(200)
      expect(data.every(lexeme => lexeme.language.id === languageID)).to.be.true
    })

    it(`option: project`, async function() {
      const db = new Database
      const { data, status } = await db.getLexemes({ project: projectID })
      expect(status).to.equal(200)
      expect(data.every(lexeme => lexeme.projects.includes(projectID))).to.be.true
    })

    it(`option: summary`, async function() {
      const db = new Database
      const { data, status } = await db.getLexemes({ project: projectID, summary: true })
      expect(status).to.equal(200)
      expect(data.count).to.equal(2)
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
      expect(data.name).to.equal(`Public Test Project`)
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
      expect(data).to.have.length(3)
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
