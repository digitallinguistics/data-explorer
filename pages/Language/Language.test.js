import * as dotenv from 'dotenv'

dotenv.config()

import { randomUUID } from 'crypto'
import yamlParser     from 'js-yaml'

import Language    from '../../models/Language.js'
import Lexeme      from '../../models/Lexeme.js'
import Permissions from '../../models/Permissions.js'
import Project     from '../../models/Project.js'

const msAuthCookie = Cypress.env(`msAuthCookie`)
const msAuthUser   = Cypress.env(`msAuthUser`)

describe(`Language`, function() {

  before(function() {
    cy.setupDatabase()
  })

  afterEach(function() {
    cy.clearDatabase()
  })

  after(function() {
    cy.deleteDatabase()
  })

  it(`Unauthenticated`, function() {

    const data = new Language({
      permissions: new Permissions({
        public: false,
      }),
    })

    cy.seedOne(`metadata`, data)
    .then(({ resource: language }) => {
      cy.visit(`/languages/${ language.id }`, { failOnStatusCode: false })
      cy.title().should(`eq`, `Oxalis | Unauthenticated`)
      cy.get(`.page-title`).should(`have.text`, `401: Unauthenticated`)
      cy.get(`.error-message`).should(`have.text`, `You must be logged in to view this language.`)
    })

  })

  it(`Unauthorized`, function() {

    const data = new Language({
      permissions: new Permissions({
        public: false,
      }),
    })

    cy.seedOne(`metadata`, data)
    .then(({ resource: language }) => {
      cy.visit(`/languages/${ language.id }`, { failOnStatusCode: false })
      cy.setCookie(msAuthCookie, `bademail@digitallinguistics.io`)
      cy.reload()
      cy.title().should(`eq`, `Oxalis | Unauthorized`)
      cy.get(`.page-title`).should(`have.text`, `403: Unauthorized`)
      cy.get(`.error-message`).should(`have.text`, `You do not have permission to view this language.`)
    })

  })

  it(`Language Details`, function() {

    cy.readFile(`data/language.yml`)
    .then(yaml => yamlParser.load(yaml))
    .then(language => {

      cy.seedOne(`metadata`, language)

      cy.seedOne(`metadata`, new Project({
        id:   language.projects[0],
        name: `Chitimacha Dictionary Project`,
      }))

      cy.seedOne(`metadata`, new Project({
        id:   language.projects[1],
        name: `Typology Project`,
      }))

      const count = 3

      cy.seedMany(`data`, count, new Lexeme({
        language: {
          id: language.id,
        },
      }))

      cy.visit(`/languages/${ language.id }`)
      cy.title().should(`equal`, `Oxalis | ${ language.name.eng }`)

      // Page Title
      cy.get(`.page-title`).should(`have.text`, language.name.eng)

      // Scientific Name
      for (const lang in language.name) {
        cy.contains(`.name dt`, lang)
        cy.contains(`.name dd`, language.name[lang])
      }

      // Autonym
      for (const ortho in language.autonym) {
        cy.contains(`.autonym dt`, ortho)
        cy.contains(`.autonym dd`, language.autonym[ortho])
      }

      // Language Codes
      cy.get(`.codes dd`)
      .then(([glottocodeEl, isoEl, abbreviationEl]) => {
        expect(glottocodeEl.textContent).to.include(language.glottocode)
        expect(isoEl.textContent).to.include(language.iso)
        expect(abbreviationEl.textContent).to.include(language.abbreviation)
      })

      // Description
      cy.get(`.description`)
      .should(`include.text`, language.description.markdown.slice(0, 20))

      // METADATA

      // URL
      cy.contains(`#url`, `https://data.digitallinguistics.io/languages/${ language.id }`)

      // Date Created
      cy.contains(`#date-created`, new Date(language.dateCreated).toLocaleDateString(`en-CA`))

      // Date Modified
      cy.contains(`#date-modified`, new Date(language.dateModified).toLocaleDateString(`en-CA`))

      // # of Lexical Entries
      cy.contains(`#num-lexical-entries`, count)

      // Projects
      cy.get(`#projects`).children()
      .should(`have.length`, language.projects.length)
      .then(([a, b]) => {
        expect(a).to.have.text(`Chitimacha Dictionary Project`)
        expect(b).to.have.text(`Typology Project`)
      })

      // Notes
      for (const note of language.notes) {
        cy.contains(`.note__source`, note.source.abbreviation)
        cy.contains(`.note__text`, note.text)
      }

    })

  })

  it(`empty language`, function() {

    const emDash = `—`
    const data   = new Language({ id: `9eda6d17-a1fc-46ed-819c-fcc4690583c4` })

    cy.seedOne(`metadata`, data)
    cy.visit(`/languages/${ data.id }`)

    // Page Title
    cy.get(`.page-title`).should(`have.text`, `[no scientific name given]`)

    // Scientific Name
    cy.get(`.name .mls`).should(`have.text`, emDash)

    // Autonym
    cy.get(`.autonym .mot`).should(`have.text`, emDash)

    // Language Codes
    cy.get(`.codes dd`)
    .then(([glottocodeEl, isoEl, abbreviationEl]) => {
      expect(glottocodeEl).to.have.text(emDash)
      expect(isoEl).to.have.text(emDash)
      expect(abbreviationEl).to.have.text(emDash)
    })

    // Description
    cy.get(`.description`)
    .should(`have.text`, `[No description provided.]`)

    // METADATA

    // URL
    cy.contains(`#url`, `https://data.digitallinguistics.io/languages/${ data.id }`)

    // Date Created
    cy.contains(`#date-created`, new Date(data.dateCreated).toLocaleDateString(`en-CA`))

    // Date Modified
    cy.contains(`#date-modified`, new Date(data.dateModified).toLocaleDateString(`en-CA`))

    // # of Lexical Entries
    cy.contains(`#num-lexical-entries`, 0)

    // Projects
    cy.get(`#projects`).children()
    .should(`have.length`, data.projects.length)

    // Notes
    cy.get(`.notes`).children().should(`have.length`, data.notes.length)

  })

  it(`private projects`, function() {

    const publicProject = new Project({
      id:   `391c2a79-14aa-4e1d-a4e7-9cf9634ca833`,
      name: `Public Project`,
    })

    const privateProject = new Project({
      id:          `f3ca091d-1317-43a0-bb24-d81f87e1e385`,
      name:        `Private Project`,
      permissions: new Permissions({
        owners: [msAuthUser],
        public: false,
      }),
    })

    const container = `metadata`

    cy.seedOne(container, publicProject)
    cy.seedOne(container, privateProject)

    const data = new Language({
      id:       `af18abc0-2246-4ead-b222-27cd7ecbcf96`,
      projects: [
        publicProject.id,
        privateProject.id,
      ],
    })

    cy.seedOne(container, data)
    cy.visit(`/languages/${ data.id }`)

    cy.get(`#projects`)
    .children()
    .should(`have.length`, 1)
    .first()
    .should(`have.text`, publicProject.name)

    cy.setCookie(msAuthCookie, msAuthUser)
    cy.reload()

    cy.get(`#projects`)
    .children()
    .should(`have.length`, 2)

    cy.contains(`#projects li`, `Public Project`)
    cy.contains(`#projects li`, `Private Project`)

  })

})
