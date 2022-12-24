import * as dotenv from 'dotenv'

dotenv.config()

import yamlParser from 'js-yaml'

import Language   from '../../models/Language.js'
import Lexeme     from '../../models/Lexeme.js'
import Project    from '../../models/Project.js'

const msAuthCookie = Cypress.env(`msAuthCookie`)

describe(`Language Page`, function() {

  before(function() {

    cy.task(`setupDatabase`)

    cy.readFile(`data/language.yml`)
    .then(yaml => yamlParser.load(yaml))
    .then(data => cy.addOne(data))
    .as(`data`)

  })

  afterEach(function() {
    cy.clearDatabase()
  })

  // beforeEach(function() {
  //   cy.readFile(`data/languages.yml`)
  //   .then(yaml => yamlParser.load(yaml))
  //   .as(`languages`)
  //   .then(languages => languages.find(lang => lang.id === publicLanguageID))
  //   .as(`data`)
  // })

  it(`Not Found`, function() {
    cy.visit(`/languages/1234`, { failOnStatusCode: false })
    cy.title().should(`eq`, `Oxalis | Item Not Found`)
    cy.get(`.page-title`).should(`have.text`, `404: Item Not Found`)
    cy.get(`.error-message`).should(`have.text`, `No language exists with ID 1234.`)
  })

  it(`Unauthenticated`, function() {

    const data = new Language

    data.permissions.public = false

    cy.addOne(data).then(language => {
      cy.visit(`/languages/${ language.id }`, { failOnStatusCode: false })
      cy.title().should(`eq`, `Oxalis | Unauthenticated`)
      cy.get(`.page-title`).should(`have.text`, `401: Unauthenticated`)
      cy.get(`.error-message`).should(`have.text`, `You must be logged in to view this language.`)
    })

  })

  it(`Unauthorized`, function() {

    const data = new Language

    data.permissions.public = false

    cy.addOne(data).then(language => {
      cy.visit(`/`)
      cy.setCookie(msAuthCookie, `bademail@digitallinguistics.io`)
      cy.visit(`/languages/${ language.id }`, { failOnStatusCode: false })
      cy.title().should(`eq`, `Oxalis | Unauthorized`)
      cy.get(`.page-title`).should(`have.text`, `403: Unauthorized`)
      cy.get(`.error-message`).should(`have.text`, `You do not have permission to view this language.`)
    })

  })

  it.only(`Language Details`, function() {

    const { data } = this
    const count    = 3

    cy.addOne(data)

    cy.addOne(new Project({
      id:   `683a5d27-53bf-451b-80d1-f6e731674c9e`,
      name: `Chitimacha Dictionary Project`,
    }))

    cy.addOne(new Project({
      id:   `225eeff5-adb8-421b-b9d0-7b5174419402`,
      name: `Typology Project`,
    }))

    cy.addMany(count, new Lexeme({
      language: {
        id: data.id,
      },
    }))

    cy.visit(`/languages/${ data.id }`)
    cy.title().should(`equal`, `Oxalis | ${ data.name.eng }`)

    // Page Title
    cy.get(`.page-title`).should(`have.text`, data.name.eng)

    // Scientific Name
    for (const lang in data.name) {
      cy.contains(`.name dt`, lang)
      cy.contains(`.name dd`, data.name[lang])
    }

    // Autonym
    for (const ortho in data.autonym) {
      cy.contains(`.autonym dt`, ortho)
      cy.contains(`.autonym dd`, data.autonym[ortho])
    }

    // Language Codes
    cy.get(`.codes dd`)
    .then(([glottocodeEl, isoEl, abbreviationEl]) => {
      expect(glottocodeEl.textContent).to.include(data.glottocode)
      expect(isoEl.textContent).to.include(data.iso)
      expect(abbreviationEl.textContent).to.include(data.abbreviation)
    })

    // Description
    cy.get(`.description`)
    .should(`include.text`, data.description.markdown.slice(0, 20))

    // METADATA

    // URL
    cy.contains(`#url`, `https://data.digitallinguistics.io/languages/${ data.id }`)

    // Date Created
    cy.contains(`#date-created`, new Date(data.dateCreated).toLocaleDateString(`en-CA`))

    // Date Modified
    cy.contains(`#date-modified`, new Date(data.dateModified).toLocaleDateString(`en-CA`))

    // # of Lexical Entries
    cy.contains(`#num-lexical-entries`, count)

    // Projects
    cy.get(`#projects`).children()
    .should(`have.length`, data.projects.length)
    .then(([a, b]) => {
      expect(a).to.have.text(`Chitimacha Dictionary Project`)
      expect(b).to.have.text(`Typology Project`)
    })

    // Notes
    for (const note of data.notes) {
      cy.contains(`.note__source`, note.source.abbreviation)
      cy.contains(`.note__text`, note.text)
    }

  })

  it(`private projects`)
  // Create a Language that's a member of one public project and one private project.
  // Test that the correct number of projects shows when logged in vs. logged out
  // (and for their specific names).

  it(`Language Details: empty lexeme`)

})
