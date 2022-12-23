import yamlParser from 'js-yaml'

const msAuthCookie = Cypress.env(`MS_AUTH_COOKIE`)

describe(`Project Page`, function() {

  const publicProjectID  = `c554474c-7f39-4ede-941b-c40b8f58b059`  // Nisinoon
  const privateProjectID = `a24157c1-000f-4771-aa47-485fb91bf24f`  // Swahili project

  beforeEach(function() {

    cy.readFile(`data/projects.yml`)
    .then(yaml => yamlParser.load(yaml))
    .as(`projects`)
    .then(projects => projects.find(proj => proj.id === publicProjectID))
    .as(`data`)

    cy.readFile(`data/languages.yml`)
    .then(yaml => yamlParser.load(yaml))
    .as(`languages`)

    cy.readFile(`data/lexemes.yml`)
    .then(yaml => yamlParser.load(yaml))
    .as(`lexemes`)

  })

  it(`Not Found`, function() {
    cy.visit(`/projects/1234`, { failOnStatusCode: false })
    cy.title().should(`eq`, `Oxalis | Item Not Found`)
    cy.get(`.page-title`).should(`have.text`, `404: Item Not Found`)
    cy.get(`.error-message`).should(`have.text`, `No project exists with ID 1234.`)
  })

  it(`Unauthenticated`, function() {
    cy.visit(`/projects/${ privateProjectID }`, { failOnStatusCode: false })
    cy.title().should(`eq`, `Oxalis | Unauthenticated`)
    cy.get(`.page-title`).should(`have.text`, `401: Unauthenticated`)
    cy.get(`.error-message`).should(`have.text`, `You must be logged in to view this project.`)
  })

  it(`Unauthorized`, function() {
    cy.visit(`/`)
    cy.setCookie(msAuthCookie, `bademail@digitallinguistics.io`)
    cy.visit(`/projects/${ privateProjectID }`, { failOnStatusCode: false })
    cy.title().should(`eq`, `Oxalis | Unauthorized`)
    cy.get(`.page-title`).should(`have.text`, `403: Unauthorized`)
    cy.get(`.error-message`).should(`have.text`, `You do not have permission to view this project.`)
  })

  it(`Project Details`, function() {

    const { data } = this

    const languages = this.languages.filter(language => language.projects.includes(data.id))
    const lexemes   = this.lexemes.filter(lexeme => lexeme.projects.includes(data.id))

    cy.visit(`/projects/${ publicProjectID }`)
    cy.contains(`# of languages`).next().should(`have.text`, languages.length)
    cy.contains(`# of lexemes`).next().should(`have.text`, lexemes.length)
    cy.contains(`# of collaborators`).next().should(`have.text`, `2`)
    cy.get(`.readme`).should(`include.text`, data.readme.markdown)
    cy.get(`.access`).should(`include.text`, data.access.note.text)
    cy.get(`#url`).should(`have.value`, data.link)
    cy.contains(`Date Created`).next().should(`have.text`, new Date(data.dateCreated).toLocaleDateString(`en-CA`))
    cy.contains(`Date Modified`).next().should(`have.text`, new Date(data.dateModified).toLocaleDateString(`en-CA`))

  })

})
