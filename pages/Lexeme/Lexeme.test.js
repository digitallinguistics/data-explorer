import { msAuthCookie } from '../../constants/index.js'
import yamlParser       from 'js-yaml'

describe(`Lexeme page`, function() {

  const publicLanguageID  = `850f3bd9-2a57-4289-bc57-05640b5d8d7d`  // Plains Cree
  const publicLexemeID    = `79eb0aaf-944c-40b4-93f3-e1785ec0adde`  // Plains Cree 'axe'
  const privateLexemeID   = `b05e479f-29c9-466d-932a-715431e905b5`  // kula (Swahili)
  const privateLanguageID = `4580756f-ce39-4ea0-b96e-8f176371afcb`  // Swahili

  beforeEach(function() {
    cy.readFile(`data/lexemes.yml`)
    .then(yaml => yamlParser.load(yaml))
    .as(`lexemes`)
    .then(lexemes => lexemes.find(lex => lex.id === publicLexemeID))
    .as(`data`)
  })

  it(`Not Found`, function() {
    cy.visit(`/languages/${ publicLanguageID }/lexemes/1234`, { failOnStatusCode: false })
    cy.title().should(`eq`, `Oxalis | Item Not Found`)
    cy.get(`.page-title`).should(`have.text`, `404: Item Not Found`)
    cy.get(`.error-message`).should(`have.text`, `No lexeme exists with ID 1234.`)
  })

  it(`Unauthenticated`, function() {
    cy.visit(`/languages/${ privateLanguageID }/lexemes/${ privateLexemeID }`, { failOnStatusCode: false })
    cy.title().should(`eq`, `Oxalis | Unauthenticated`)
    cy.get(`.page-title`).should(`have.text`, `401: Unauthenticated`)
    cy.get(`.error-message`).should(`have.text`, `You must be logged in to view this lexeme.`)
  })

  it(`Unauthorized`, function() {
    cy.visit(`/`)
    cy.setCookie(msAuthCookie, `bademail@digitallinguistics.io`)
    cy.visit(`/languages/${ privateLanguageID }/lexemes/${ privateLexemeID }`, { failOnStatusCode: false })
    cy.title().should(`eq`, `Oxalis | Unauthorized`)
    cy.get(`.page-title`).should(`have.text`, `403: Unauthorized`)
    cy.get(`.error-message`).should(`have.text`, `You do not have permission to view this lexeme.`)
  })

  it(`Lexeme Details`, function() {

    const { data } = this

    cy.visit(`/languages/${ publicLanguageID }/lexemes/${ data.id }`)

    // page title
    cy.title().should(`eq`, `Oxalis | ${ data.lemma.SRO }`)

    // summary details
    cy.contains(`.page-title`, data.lemma.SRO)
    cy.contains(`header`, data.senses[0].gloss)

    // default view: Form Tab (no tab selected)
    cy.hash().should(`eq`, ``)
    cy.get(`#form`).should(`be.visible`)

    // Lemma
    cy.contains(`#lemma`, data.lemma.SRO)
    cy.contains(`#lemma`, data.lemma.syllabics)

    // Citation Form (without data; see below for test with data)
    cy.contains(`#citation-form`, `—`)

    // Meaning Tab
    cy.get(`#meaning-link`).click()
    cy.hash().should(`eq`, `#meaning`)
    cy.get(`#meaning`).should(`be.visible`)
    cy.get(`#form`).should(`not.be.visible`)

    // Metadata Tab
    cy.get(`#metadata-link`).click()
    cy.hash().should(`eq`, `#metadata`)
    cy.get(`#metadata`).should(`be.visible`)
    cy.get(`#meaning`).should(`not.be.visible`)

    // Metadata
    cy.get(`#url`).should(`have.text`, data.link)
    cy.get(`#date-created`).should(`have.text`, new Date(data.dateCreated).toLocaleDateString(`en-CA`))
    cy.get(`#date-modified`).should(`have.text`, new Date(data.dateModified).toLocaleDateString(`en-CA`))

    // Bibliography
    cy.get(`.references`).children()
    .should(`have.length`, 3)
    .then(([a, b, c]) => {
      expect(a).to.contain(`Bloomfield`)
      expect(b).to.contain(`Goddard`)
      expect(c).to.contain(`Macaulay`)
    })

    // ---

    // Citation Form (with data)
    const chitiLangID = `cc4978f6-13a9-4735-94c5-10e4e8030437`
    const chitiVerbID = `abc56564-5754-4698-845c-2ea32a760bbd`

    cy.visit(`/`)
    cy.setCookie(msAuthCookie, `owner@digitallinguistics.io`)
    cy.visit(`/languages/${ chitiLangID }/lexemes/${ chitiVerbID }`)

    cy.contains(`#lemma`, `cuw‑`)
    cy.contains(`#lemma`, `čuw‑`)
    cy.contains(`#lemma`, `t͡ʃuw‑`)

    cy.contains(`#citation-form`, `cuyi`)
    cy.contains(`#citation-form`, `čuyi`)
    cy.contains(`#citation-form`, `t͡ʃuji`)


  })

})
