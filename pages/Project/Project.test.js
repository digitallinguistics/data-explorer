import yamlParser from 'js-yaml'

import Language    from '../../models/Language.js'
import Lexeme      from '../../models/Lexeme.js'
import Permissions from '../../models/Permissions.js'
import Project     from '../../models/Project'

const msAuthCookie = Cypress.env(`msAuthCookie`)
const msAuthUser   = Cypress.env(`msAuthUser`)

describe(`Project`, function() {

  const badID = `bad-id`

  before(function() {
    cy.task(`setupDatabase`)
  })

  after(function() {
    cy.clearDatabase()
  })

  it(`404: Not Found`, function() {
    cy.visit(`/projects/${ badID }`, { failOnStatusCode: false })
    cy.title().should(`eq`, `Oxalis | Item Not Found`)
    cy.get(`.page-title`).should(`have.text`, `404: Item Not Found`)
    cy.get(`.error-message`).should(`have.text`, `No project exists with ID ${ badID }.`)
  })

  it(`401: Unauthenticated`, function() {

    const project = new Project({
      id:          `5cd2547e-a072-42f4-9f7c-86376d41b5eb`,
      permissions: new Permissions({
        public: false,
      }),
    })

    cy.upsertOne(project)

    cy.visit(`/projects/${ project.id }`, { failOnStatusCode: false })
    cy.title().should(`eq`, `Oxalis | Unauthenticated`)
    cy.get(`.page-title`).should(`have.text`, `401: Unauthenticated`)
    cy.get(`.error-message`).should(`have.text`, `You must be logged in to view this project.`)

  })

  it(`403: Unauthorized`, function() {

    const project = new Project({
      id:          `a61cefab-368a-41f0-b08b-22c8e0c64928`,
      permissions: new Permissions({
        public: false,
      }),
    })

    cy.upsertOne(project)

    cy.visit(`/projects/${ project.id }`, { failOnStatusCode: false })
    cy.setCookie(msAuthCookie, msAuthUser)
    cy.reload()

    cy.title().should(`eq`, `Oxalis | Unauthorized`)
    cy.get(`.page-title`).should(`have.text`, `403: Unauthorized`)
    cy.get(`.error-message`).should(`have.text`, `You do not have permission to view this project.`)

  })

  it(`200: OK`, function() {

    cy.readFile(`data/project.yml`)
    .then(yaml => yamlParser.load(yaml))
    .then(project => {

      const count = 3

      const language = new Language({
        projects: [project.id],
      })

      const lexeme = new Lexeme({
        projects: [project.id],
      })

      cy.upsertOne(project)
      cy.addMany(count, language)
      cy.addMany(count, lexeme)

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
