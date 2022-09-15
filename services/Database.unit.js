import Database   from './Database.js'
import { expect } from 'chai'
import hasAccess  from '../utilities/hasAccess.js'

describe(`Database`, function() {

  const privateLanguageID = `0a25188c-158b-4daf-bd17-5c4cdd6bd40b`
  const publicLanguageID  = `3876b870-e7cd-46d2-bca8-2db1cd0a51ac`

  const privateProjectID = `198c9710-451c-413b-abf5-b3daa4c15156`
  const publicProjectID  = `6a0fcc10-859c-4af1-8105-156ccfd95310`

  const badUser  = `bademail@digitallinguistics.io`
  const testUser = `test@digitallinguistics.io`

  describe(`getLanguage`, function() {

    it(`returns a copy of the data`, async function() {
      const db = new Database
      const { data: a } = await db.getLanguage(publicLanguageID)
      const { data: b } = await db.getLanguage(publicLanguageID)
      expect(a).to.not.equal(b)
    })

    it(`200 OK`, async function() {
      const db = new Database
      const { data: language, status } = await db.getLanguage(publicLanguageID)
      expect(status).to.equal(200)
      expect(language.name.eng).to.equal(`Public Test Language`)
    })

    it(`401 Unauthenticated`, async function() {
      const db = new Database
      const { data, status } = await db.getLanguage(privateLanguageID)
      expect(data).to.be.undefined
      expect(status).to.equal(401)
    })

    it(`403 Unauthorized`, async function() {
      const db = new Database
      const { data, status } = await db.getLanguage(privateLanguageID, badUser)
      expect(data).to.be.undefined
      expect(status).to.equal(403)
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

    it(`only returns languages the user has access to`, async function() {
      const db = new Database
      const { data, status } = await db.getLanguages(testUser)
      expect(status).to.equal(200)
      expect(data.every(lang => hasAccess(testUser, lang))).to.be.true
    })

    it(`returns an empty array if there are no languages the user has access to`, async function() {
      const db = new Database
      // remove any publicly-accessible languages from the database
      db.languages = db.languages.filter(lang => !lang.permissions.public)
      const { data, status } = await db.getLanguages(badUser)
      expect(status).to.equal(200)
      expect(data).to.be.empty
    })

  })

  describe(`getLexeme`, function() {

    const privateLexemeID = `ecc1ec29-979f-4cf2-8715-b0e0ad6b27a0`
    const publicLexemeID  = `c00d0d77-4615-46f5-af59-f4b8c795311a`

    it(`returns a copy of the data`, async function() {
      const db = new Database
      const { data: a } = await db.getLexeme(publicLexemeID)
      const { data: b } = await db.getLexeme(publicLexemeID)
      expect(a).to.not.equal(b)
    })

    it(`200 OK`, async function() {
      const db = new Database
      const { data, status } = await db.getLexeme(publicLexemeID)
      expect(status).to.equal(200)
      expect(data.lemma.spa).to.equal(`vivir`)
    })

    it(`401 Unauthenticated`, async function() {
      const db = new Database
      const { data, status } = await db.getLexeme(privateLexemeID)
      expect(status).to.equal(401)
      expect(data).to.be.undefined
    })

    it(`403 Unauthorized`, async function() {
      const db = new Database
      const { data, status } = await db.getLexeme(privateLexemeID, badUser)
      expect(status).to.equal(403)
      expect(data).to.be.undefined
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
      const { data: [a] } = await db.getLexemes({ project: publicProjectID })
      const { data: [b] } = await db.getLexemes({ project: publicProjectID })
      expect(a).to.not.equal(b)
    })

    it(`error: no language/project specified`, async function() {
      const db = new Database
      const { data, message, status } = await db.getLexemes()
      expect(status).to.equal(400)
      expect(message).to.equal(`No project/language specified.`)
      expect(data).to.be.undefined
    })

    it(`option: language`, async function() {
      const db = new Database
      const { data, status } = await db.getLexemes({ language: publicLanguageID })
      expect(status).to.equal(200)
      expect(data.every(lexeme => lexeme.language.id === publicLanguageID)).to.be.true
    })

    it(`option: project`, async function() {
      const db = new Database
      const { data, status } = await db.getLexemes({ project: publicProjectID })
      expect(status).to.equal(200)
      expect(data.every(lexeme => lexeme.projects.includes(publicProjectID))).to.be.true
    })

    it.only(`option: summary`, async function() {
      const db = new Database
      const { data, status } = await db.getLexemes({ project: publicProjectID, summary: true })
      expect(status).to.equal(200)
      expect(data.count).to.equal(2)
    })

    it(`401 Unauthenticated`, async function() {
      const db = new Database
      const { data, message, status } = await db.getLexemes({ project: privateProjectID })
      expect(status).to.equal(401)
      expect(message).to.equal(`Unauthenticated`)
      expect(data).to.be.undefined
    })

    it(`403 Unauthorized`, async function() {
      const db = new Database
      const { data, message, status } = await db.getLexemes({ project: privateProjectID }, badUser)
      expect(status).to.equal(403)
      expect(message).to.equal(`Unauthorized`)
      expect(data).to.be.undefined
    })

    it(`404 Not Found`, async function() {
      const db = new Database
      const { data, status } = await db.getLexemes({ project: `bad-id` })
      expect(status).to.equal(404)
      expect(data).to.be.undefined
    })

  })

  describe(`getProject`, function() {

    it(`returns a copy of the data`, async function() {
      const db = new Database
      const { data: a } = await db.getProject(publicProjectID)
      const { data: b } = await db.getProject(publicProjectID)
      expect(a).to.not.equal(b)
    })

    it(`200 OK`, async function() {
      const db = new Database
      const { data, status } = await db.getProject(publicProjectID)
      expect(status).to.equal(200)
      expect(data.name).to.equal(`Public Test Project`)
    })

    it(`401 Unauthenticated`, async function() {
      const db = new Database
      const { data, status } = await db.getProject(privateProjectID)
      expect(status).to.equal(401)
      expect(data).to.be.undefined
    })

    it(`403 Unauthorized`, async function() {
      const db = new Database
      const { data, status } = await db.getProject(privateProjectID, badUser)
      expect(status).to.equal(403)
      expect(data).to.be.undefined
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

    it(`only returns projects the user has access to`, async function() {
      const db = new Database
      const { data, status } = await db.getProjects(testUser)
      expect(status).to.equal(200)
      expect(data.every(proj => hasAccess(testUser, proj))).to.be.true
    })

    it(`returns an empty array if there are no projects the user has access to`, async function() {
      const db = new Database
      db.projects = db.projects.filter(proj => !proj.permissions.public)
      const { data, status } = await db.getProjects(badUser)
      expect(status).to.equal(200)
      expect(data).to.be.empty
    })

  })

})
