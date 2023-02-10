import yamlParser from 'js-yaml'

import {
  Language,
  Lexeme,
  Permissions,
  Project,
} from '@digitallinguistics/models'

const badID        = `bad-id`
const container    = `metadata`
const msAuthCookie = Cypress.env(`msAuthCookie`)
const msAuthUser   = Cypress.env(`msAuthUser`)

describe(`Project`, function() {

  before(function() {
    cy.task(`setupDatabase`)
  })

  afterEach(function() {
    cy.task(`clearDatabase`)
  })

  after(function() {
    cy.task(`deleteDatabase`)
  })

  it(`401: Unauthenticated`, function() {

    const project = new Project({
      id:          crypto.randomUUID(),
      permissions: new Permissions({
        public: false,
      }),
    })

    cy.task(`seedOne`, [container, project])
    cy.visit(`/projects/${ project.id }`, { failOnStatusCode: false })
    cy.title().should(`eq`, `Oxalis | Unauthenticated`)
    cy.get(`.page-title`).should(`have.text`, `401: Unauthenticated`)
    cy.get(`.error-message`).should(`have.text`, `You must be logged in to view this project.`)

  })

  it(`403: Unauthorized`, function() {

    const project = new Project({
      id:          crypto.randomUUID(),
      permissions: new Permissions({
        public: false,
      }),
    })

    cy.task(`seedOne`, [container, project])

    cy.visit(`/projects/${ project.id }`, { failOnStatusCode: false })
    cy.setCookie(msAuthCookie, msAuthUser)
    cy.reload()

    cy.title().should(`eq`, `Oxalis | Unauthorized`)
    cy.get(`.page-title`).should(`have.text`, `403: Unauthorized`)
    cy.get(`.error-message`).should(`have.text`, `You do not have permission to view this project.`)

  })

  it(`404: Not Found`, function() {
    cy.visit(`/projects/${ badID }`, { failOnStatusCode: false })
    cy.title().should(`eq`, `Oxalis | Item Not Found`)
    cy.get(`.page-title`).should(`have.text`, `404: Item Not Found`)
    cy.get(`.error-message`).should(`have.text`, `No project exists with ID ${ badID }.`)
  })

  it(`200: OK`, function() {

    cy.readFile(`data/project.yml`)
    .then(yaml => yamlParser.load(yaml))
    .then(data => {

      const project = new Project(data)
      const count   = 3

      const language = new Language({
        id:       crypto.randomUUID(),
        projects: [project.getReference()],
      })

      const lexeme = new Lexeme({
        language: language.getReference(),
        projects: [project.getReference()],
      })

      cy.task(`seedOne`, [container, project])
      cy.task(`seedMany`, [container, count, language])
      cy.task(`seedMany`, [`data`, count, lexeme])

      cy.visit(`/projects/${ project.id }`)

      cy.contains(`# of languages`).next().should(`have.text`, count)
      cy.contains(`# of lexemes`).next().should(`have.text`, count)
      cy.contains(`# of collaborators`).next().should(`have.text`, `2`)
      cy.contains(`.readme`, project.readme.markdown)
      cy.contains(`.access`, project.access.note.text)
      cy.get(`#url`).should(`have.value`, project.link)
      cy.contains(`Date Created`).next().should(`have.text`, new Date(project.dateCreated).toLocaleDateString(`en-CA`))
      cy.contains(`Date Modified`).next().should(`have.text`, new Date(project.dateModified).toLocaleDateString(`en-CA`))

    })

  })

})
