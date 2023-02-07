import yamlParser from 'js-yaml'

import {
  Language,
  Permissions,
  Project,
} from '@digitallinguistics/models'

const msAuthCookie = Cypress.env(`msAuthCookie`)
const msAuthUser   = Cypress.env(`msAuthUser`)

describe(`Languages`, function() {

  const container = `metadata`

  before(function() {
    cy.task(`setupDatabase`)
  })

  afterEach(function() {
    cy.task(`clearDatabase`)
  })

  after(function() {
    cy.task(`deleteDatabase`)
  })

  describe(`/languages`, function() {

    it.only(`displays language data`, function() {

      cy.readFile(`data/language.yml`)
      .then(yaml => yamlParser.load(yaml))
      .then(data => cy.task(`seedOne`, [`metadata`, new Language(data).data]))
      .then(language => {
        cy.visit(`/languages`)
        cy.get(`.privacy`).should(`include.text`, `public`)
        cy.get(`.permissions`).should(`include.text`, `public`)
        cy.get(`.name`).should(`include.text`, language.name.eng)
        cy.get(`.autonym`).should(`include.text`, language.autonym.Modern)
        cy.get(`.abbreviation`).should(`include.text`, language.abbreviation)
        cy.get(`.glottocode`).should(`include.text`, language.glottocode)
        cy.get(`.iso`).should(`include.text`, language.iso)
        cy.get(`.date-created`).should(`include.text`, new Date(language.dateCreated).toLocaleDateString(`en-CA`))
        cy.get(`.date-modified`).should(`include.text`, new Date(language.dateModified).toLocaleDateString(`en-CA`))
      })

    })

    it(`displays all public languages`, function() {

      const publicProject = new Project({
        id: crypto.randomUUID(),
      })

      const privateProject = new Project({
        id:          crypto.randomUUID(),
        permissions: new Permissions({
          public: false,
        }),
      })

      const count = 3

      const publicLanguage = new Language({
        projects: [publicProject.getReference()],
      })

      const privateLanguage = new Language({
        projects: [privateProject.getReference()],
      })

      cy.task(`seedOne`, [container, publicProject.data])
      cy.task(`seedOne`, [container, privateProject.data])
      cy.task(`seedMany`, [container, count, publicLanguage])
      cy.task(`seedMany`, [container, count, privateLanguage])

      cy.visit(`/languages`)
      cy.title().should(`eq`, `Oxalis | Languages`)
      cy.get(`.page-title`).should(`have.text`, `Languages`)
      cy.get(`.page-nav`).should(`not.exist`)

      cy.get(`.languages-table tbody`).children().should(`have.length`, count)
      cy.get(`tbody .privacy`).each(td => expect(td).to.contain(`public`))
      cy.get(`tbody .permissions`).each(td => expect(td).to.contain(`public`))

    })

    it(`private languages (owner@digitallinguistics.io)`, function() {

      const publicLanguage = new Language

      const privateLanguage = new Language({
        permissions: new Permissions({
          owners: [msAuthUser],
          public: false,
        }),
      })

      const unauthorizedLanguage = new Language({
        permissions: new Permissions({
          public: false,
        }),
      })

      const count = 3

      cy.seedMany(container, count, publicLanguage)
      cy.seedMany(container, count, privateLanguage)
      cy.seedMany(container, count, unauthorizedLanguage)

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

      const user           = `editor@digitallinguistics.io`
      const publicLanguage = new Language

      const privateLanguage = new Language({
        permissions: new Permissions({
          editors: [user],
          public:  false,
        }),
      })

      const unauthorizedLanguage = new Language({
        permissions: new Permissions({
          public: false,
        }),
      })

      const count = 3

      cy.seedMany(container, count, publicLanguage)
      cy.seedMany(container, count, privateLanguage)
      cy.seedMany(container, count, unauthorizedLanguage)

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

      const user           = `viewe@digitallinguistics.io`
      const publicLanguage = new Language

      const privateLanguage = new Language({
        permissions: new Permissions({
          public:  false,
          viewers: [user],
        }),
      })

      const unauthorizedLanguage = new Language({
        permissions: new Permissions({
          public: false,
        }),
      })

      const count = 3

      cy.seedMany(container, count, publicLanguage)
      cy.seedMany(container, count, privateLanguage)
      cy.seedMany(container, count, unauthorizedLanguage)

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
        id:          crypto.randomUUID(),
        permissions: new Permissions({ public: false }),
      })

      const language = new Language({
        projects: [project.getReference()],
      })

      cy.task(`seedOne`, [container, project.data])
      cy.task(`seedOne`, [container, language.data])
      cy.visit(`/projects/${ project.id }/languages`, { failOnStatusCode: false })
      cy.contains(`.page-title`, `401: Unauthenticated`)
      cy.contains(`.error-message`, `You must be logged in to view this project.`)

    })

    it(`Project: Unauthorized`, function() {

      const project = new Project({
        id:          crypto.randomUUID(),
        permissions: new Permissions({
          public: false,
        }),
      })

      const language = new Language({
        projects: [project.getReference()],
      })

      cy.task(`seedOne`, [container, project])
      cy.task(`seedOne`, [container, language])
      cy.visit(`/`)
      cy.setCookie(msAuthCookie, msAuthUser)
      cy.visit(`/projects/${ project.id }/languages`, { failOnStatusCode: false })
      cy.contains(`.page-title`, `403: Unauthorized`)
      cy.contains(`.error-message`, `You do not have permission to view this project.`)

    })

    it(`displays project languages`, function() {

      const project = new Project({
        id:   crypto.randomUUID(),
        name: {
          eng: `Test Project`,
        },
      })

      const projectLanguage = new Language({
        projects: [project.getReference()],
      })

      const otherLanguage = new Language
      const count         = 3

      cy.task(`seedOne`, [container, project])
      cy.task(`seedMany`, [container, count, projectLanguage])
      cy.task(`seedMany`, [container, count, otherLanguage])

      cy.visit(`/projects/${ project.id }/languages`)
      cy.contains(`.page-title`, project.name.eng)
      cy.get(`.languages-table tbody`).children().should(`have.length`, count)

    })

  })

})
