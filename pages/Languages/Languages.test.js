import yamlParser from 'js-yaml'

import Language    from '../../models/Language.js'
import Permissions from '../../models/Permissions.js'
import Project     from '../../models/Project.js'

const msAuthCookie = Cypress.env(`msAuthCookie`)
const msAuthUser   = Cypress.env(`msAuthUser`)

describe(`Languages`, function() {

  before(function() {
    cy.task(`setupDatabase`)
  })

  this.afterEach(function() {
    cy.clearDatabase()
  })

  describe(`/languages`, function() {

    it(`displays language data`, function() {

      cy.readFile(`data/language.yml`)
      .then(yaml => yamlParser.load(yaml))
      .then(data => {
        cy.addOne(data)
        cy.visit(`/languages`)
        cy.get(`.privacy`).should(`include.text`, `public`)
        cy.get(`.permissions`).should(`include.text`, `public`)
        cy.get(`.name`).should(`include.text`, data.name.eng)
        cy.get(`.autonym`).should(`include.text`, data.autonym.Modern)
        cy.get(`.abbreviation`).should(`include.text`, data.abbreviation)
        cy.get(`.glottocode`).should(`include.text`, data.glottocode)
        cy.get(`.iso`).should(`include.text`, data.iso)
        cy.get(`.date-created`).should(`include.text`, new Date(data.dateCreated).toLocaleDateString(`en-CA`))
        cy.get(`.date-modified`).should(`include.text`, new Date(data.dateModified).toLocaleDateString(`en-CA`))
      })

    })

    it(`displays all public languages`, function() {

      const count           = 3
      const publicLanguage  = new Language
      const privateLanguage = new Language

      privateLanguage.permissions.public = false

      cy.addMany(count, publicLanguage)
      cy.addMany(count, privateLanguage)

      cy.visit(`/languages`)
      cy.title().should(`eq`, `Oxalis | Languages`)
      cy.get(`.page-title`).should(`have.text`, `Languages`)
      cy.get(`.page-nav`).should(`not.exist`)

      cy.get(`.languages-table tbody`).children().should(`have.length`, count)
      cy.get(`tbody .privacy`).each(td => expect(td).to.contain(`public`))
      cy.get(`tbody .permissions`).each(td => expect(td).to.contain(`public`))

    })

    it(`private languages (owner@digitallinguistics.io)`, function() {

      const publicLanguage       = new Language
      const privateLanguage      = new Language
      const unauthorizedLanguage = new Language

      privateLanguage.permissions.public = false
      privateLanguage.permissions.owners.push(msAuthUser)
      unauthorizedLanguage.permissions.public = false

      const count = 3

      cy.addMany(count, publicLanguage)
      cy.addMany(count, privateLanguage)
      cy.addMany(count, unauthorizedLanguage)

      cy.visit(`/languages`)
      cy.setCookie(msAuthCookie, msAuthUser)
      cy.reload()

      cy.get(`.languages-table tbody`).children().should(`have.length`, count * 2)
      cy.get(`tbody .privacy[title=public]`).should(`have.length`, count)
      cy.get(`tbody .privacy[title=private]`).should(`have.length`, count)
      cy.get(`tbody .permissions[title=public]`).should(`have.length`, count)
      cy.get(`tbody .permissions[title=owner]`).should(`have.length`, count)

    })

    it(`private languages (editor@digitallinguistics.io)`, function() {

      const user                 = `editor@digitallinguistics.io`
      const publicLanguage       = new Language
      const privateLanguage      = new Language
      const unauthorizedLanguage = new Language

      privateLanguage.permissions.public = false
      privateLanguage.permissions.editors.push(user)
      unauthorizedLanguage.permissions.public = false

      const count = 3

      cy.addMany(count, publicLanguage)
      cy.addMany(count, privateLanguage)
      cy.addMany(count, unauthorizedLanguage)

      cy.visit(`/languages`)
      cy.setCookie(msAuthCookie, user)
      cy.reload()

      cy.get(`.languages-table tbody`).children().should(`have.length`, count * 2)
      cy.get(`tbody .privacy[title=public]`).should(`have.length`, count)
      cy.get(`tbody .privacy[title=private]`).should(`have.length`, count)
      cy.get(`tbody .permissions[title=public]`).should(`have.length`, count)
      cy.get(`tbody .permissions[title=editor]`).should(`have.length`, count)

    })

    it(`private languages (viewer@digitallinguistics.io)`, function() {

      const user                 = `viewe@digitallinguistics.io`
      const publicLanguage       = new Language
      const privateLanguage      = new Language
      const unauthorizedLanguage = new Language

      privateLanguage.permissions.public = false
      privateLanguage.permissions.viewers.push(user)
      unauthorizedLanguage.permissions.public = false

      const count = 3

      cy.addMany(count, publicLanguage)
      cy.addMany(count, privateLanguage)
      cy.addMany(count, unauthorizedLanguage)

      cy.visit(`/languages`)
      cy.setCookie(msAuthCookie, user)
      cy.reload()

      cy.get(`.languages-table tbody`).children().should(`have.length`, count * 2)
      cy.get(`tbody .privacy[title=public]`).should(`have.length`, count)
      cy.get(`tbody .privacy[title=private]`).should(`have.length`, count)
      cy.get(`tbody .permissions[title=public]`).should(`have.length`, count)
      cy.get(`tbody .permissions[title=viewer]`).should(`have.length`, count)

    })

  })

  describe(`/projects/{projectID}/languages`, function() {

    const badID = `bad-id`

    it(`Project: Not Found`, function() {
      cy.visit(`/projects/${ badID }/languages`, { failOnStatusCode: false })
      cy.contains(`.page-title`, `404: Item Not Found`)
      cy.contains(`.error-message`, `No project exists with ID ${ badID }`)
    })

    it(`Project: Unauthenticated`, function() {

      const project = new Project({
        id:          `137a795b-c128-44fa-839a-6d431faccca7`,
        permissions: new Permissions({ public: false }),
      })

      const language = new Language({
        projects: [project.id],
      })

      cy.addOne(project)
      cy.addOne(language)
      cy.visit(`/projects/${ project.id }/languages`, { failOnStatusCode: false })
      cy.contains(`.page-title`, `401: Unauthenticated`)
      cy.contains(`.error-message`, `You must be logged in to view this project.`)

    })

    it(`Project: Unauthorized`, function() {

      const project = new Project({
        id:          `137a795b-c128-44fa-839a-6d431faccca7`,
        permissions: new Permissions({
          public: false,
        }),
      })

      const language = new Language({
        projects: [project.id],
      })

      cy.addOne(project)
      cy.addOne(language)
      cy.visit(`/`)
      cy.setCookie(msAuthCookie, msAuthUser)
      cy.visit(`/projects/${ project.id }/languages`, { failOnStatusCode: false })
      cy.contains(`.page-title`, `403: Unauthorized`)
      cy.contains(`.error-message`, `You do not have permission to view this project.`)

    })

    it(`displays project languages`, function() {

      const project = new Project({
        id: `a4df0d8e-3456-42fd-97c1-1133757ae872`,
      })

      const projectLanguage = new Language({
        projects: [project.id],
      })

      const otherLanguage = new Language

      const count = 3

      cy.addOne(project)
      cy.addMany(count, projectLanguage)
      cy.addMany(count, otherLanguage)

      cy.visit(`/projects/${ project.id }/languages`)
      cy.get(`.languages-table tbody`).children().should(`have.length`, count)

    })

  })

})
