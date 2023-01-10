import * as dotenv from 'dotenv'

dotenv.config()

import yamlParser from 'js-yaml'

import Language   from '../../models/Language.js'
import Lexeme     from '../../models/Lexeme.js'
import Project    from '../../models/Project.js'

const msAuthCookie = Cypress.env(`msAuthCookie`)
const msAuthUser   = Cypress.env(`msAuthUser`)

describe(`Language`, function() {

  before(function() {
    cy.task(`setupDatabase`)
  })

  afterEach(function() {
    throw new Error(`BOOM`)
    // cy.clearDatabase()
  })

  it(`Not Found`, function() {
    const badID = `bad-id`
    cy.visit(`/languages/${ badID }`, { failOnStatusCode: false })
    cy.title().should(`eq`, `Oxalis | Item Not Found`)
    cy.get(`.page-title`).should(`have.text`, `404: Item Not Found`)
    cy.get(`.error-message`).should(`have.text`, `No language exists with ID ${ badID }.`)
  })

  it(`Unauthenticated`, function() {

    const sample = new Language

    sample.permissions.public = false

    cy.addOne(sample).then(language => {
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

  it(`Language Details`, function() {

    cy.readFile(`data/language.yml`)
    .then(yaml => yamlParser.load(yaml))
    .then(data => {

      cy.addOne(data)

      cy.addOne(new Project({
        id:   `683a5d27-53bf-451b-80d1-f6e731674c9e`,
        name: `Chitimacha Dictionary Project`,
      }))

      cy.addOne(new Project({
        id:   `225eeff5-adb8-421b-b9d0-7b5174419402`,
        name: `Typology Project`,
      }))

      const count = 3

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

  })

  it(`empty language`, function() {

    const emDash = `—`
    const data   = new Language({ id: `9eda6d17-a1fc-46ed-819c-fcc4690583c4` })

    cy.addOne(data)
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
      id:   `f3ca091d-1317-43a0-bb24-d81f87e1e385`,
      name: `Private Project`,
    })

    privateProject.permissions.owners.push(msAuthUser)
    privateProject.permissions.public = false

    cy.addOne(publicProject)
    cy.addOne(privateProject)

    const data = new Language({
      id:       `af18abc0-2246-4ead-b222-27cd7ecbcf96`,
      projects: [
        publicProject.id,
        privateProject.id,
      ],
    })

    cy.addOne(data)
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
