import * as dotenv from 'dotenv'

dotenv.config()

import Database   from '../../database/Database.js'
import yamlParser from 'js-yaml'

const dbName       = Cypress.env(`dbName`)
const msAuthCookie = Cypress.env(`msAuthCookie`)
const endpoint     = Cypress.env(`cosmosEndpoint`)
const key          = Cypress.env(`cosmosKey`)

const db = new Database({ dbName, endpoint, key })

describe(`Language Page`, function() {

  const publicLanguageID  = `850f3bd9-2a57-4289-bc57-05640b5d8d7d` // Plains Cree
  const privateLanguageID = `4580756f-ce39-4ea0-b96e-8f176371afcb` // Swahili

  before(function() {
    cy.task(`setupDatabase`)
  })

  after(function() {
    cy.task(`deleteDatabase`)
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

  it.only(`Unauthenticated`, function() {
    cy.visit(`/languages/${ privateLanguageID }`, { failOnStatusCode: false })
    cy.title().should(`eq`, `Oxalis | Unauthenticated`)
    cy.get(`.page-title`).should(`have.text`, `401: Unauthenticated`)
    cy.get(`.error-message`).should(`have.text`, `You must be logged in to view this language.`)
  })

  it(`Unauthorized`, function() {
    cy.visit(`/`)
    cy.setCookie(msAuthCookie, `bademail@digitallinguistics.io`)
    cy.visit(`/languages/${ privateLanguageID }`, { failOnStatusCode: false })
    cy.title().should(`eq`, `Oxalis | Unauthorized`)
    cy.get(`.page-title`).should(`have.text`, `403: Unauthorized`)
    cy.get(`.error-message`).should(`have.text`, `You do not have permission to view this language.`)
  })

  it(`Language Details`, function() {

    const { data } = this

    cy.visit(`/languages/${ publicLanguageID }`)
    cy.title().should(`equal`, `Oxalis | ${ data.name.eng }`)

    // Page Title
    cy.get(`.page-title`).should(`have.text`, data.name.eng)

    // Scientific Name
    cy.get(`.names .mls`)
    .children()
    .filter(`dd`)
    .then(([eng]) => {
      expect(eng).to.contain(data.name.eng)
    })

    // Autonym
    cy.get(`.names .mot`)
    .children()
    .filter(`dd`)
    .then(([SRO, syl]) => {
      expect(SRO).to.contain(data.autonym.SRO)
      expect(syl).contain(data.autonym.syllabics)
    })

    // Language Codes
    cy.get(`.codes dd`)
    .then(([glottocodeEl, isoEl, abbreviationEl]) => {
      expect(glottocodeEl.textContent).to.include(data.glottocode)
      expect(isoEl.textContent).to.include(data.iso)
      expect(abbreviationEl.textContent).to.include(data.abbreviation)
    })

    // Description
    cy.get(`.description`)
    .should(`include.text`, `Plains Cree`)

    // Metadata
    cy.get(`.metadata`)
    .children()
    .filter(`output`)
    .then(([urlEl, dateCreatedEl, dateModifiedEl, lexicalEntries]) => {
      expect(urlEl.textContent).to.equal(`https://data.digitallinguistics.io/languages/${ publicLanguageID }`)
      expect(dateCreatedEl.textContent).to.equal(new Date(data.dateCreated).toLocaleDateString(`en-CA`))
      expect(dateModifiedEl.textContent).to.equal(new Date(data.dateModified).toLocaleDateString(`en-CA`))
      expect(lexicalEntries.textContent).to.equal(`7`)
    })

    // Notes
    cy.get(`.notes`)
    .children()
    .then(([a, b]) => {

      const [noteDataA, noteDataB] = data.notes

      expect(a).to.contain(noteDataA.text)
      expect(a).to.contain(noteDataA.source.abbreviation)
      expect(b).to.contain(noteDataB.text)
      expect(b).to.contain(noteDataB.source.abbreviation)

    })

  })

  it(`Metadata: Project Links`, function() {

    const menomineeLanguageID = `5fc405aa-a1a3-41e5-a80d-adb9dfbaa293`
    const language            = this.languages.find(language => language.id === menomineeLanguageID)

    cy.visit(`/`)
    cy.setCookie(msAuthCookie, `owner@digitallinguistics.io`)
    cy.visit(`/languages/${ menomineeLanguageID }`)
    cy.get(`#projects`).children().should(`have.length`, language.projects.length)
    cy.contains(`Log out`).click()
    cy.get(`#projects`).children().should(`have.length`, 1)

  })

})
