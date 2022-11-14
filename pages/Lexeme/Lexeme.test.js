import { msAuthCookie } from '../../constants/index.js'
import yamlParser       from 'js-yaml'

describe(`Lexeme page`, function() {

  const arapahoLanguageID    = `e2b3b685-fd01-40ea-96ae-cb22f2511cd1`
  const chitimachaLanguageID = `cc4978f6-13a9-4735-94c5-10e4e8030437`
  const menomineeLanguageID  = `5fc405aa-a1a3-41e5-a80d-adb9dfbaa293`
  const publicLanguageID     = `850f3bd9-2a57-4289-bc57-05640b5d8d7d`  // Plains Cree
  const publicLexemeID       = `79eb0aaf-944c-40b4-93f3-e1785ec0adde`  // Plains Cree 'axe'
  const privateLexemeID      = `b05e479f-29c9-466d-932a-715431e905b5`  // kula (Swahili)
  const privateLanguageID    = `4580756f-ce39-4ea0-b96e-8f176371afcb`  // Swahili

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

  it(`Lexeme Details: Arapaho: ‑(')enih`, function() {

    const lexemeID = `67944dcf-f7d9-4e9c-88f7-cb2408b10b9b`

    cy.visit(`/languages/${ arapahoLanguageID }/lexemes/${ lexemeID }#metadata`)
    cy.get(`#sources`).should(`have.text`, `PM`)

  })

  it(`Lexeme Details: Arapaho: wo'oteen‑`, function() {

    const lexemeID = `f19f279b-97a5-4e07-bae0-7bb67699e745`

    cy.visit(`/languages/${ arapahoLanguageID }/lexemes/${ lexemeID }#metadata`)

    // Language Autonym (without data)
    cy.get(`.language`).should(`have.text`, `Arapaho`)
    cy.get(`#language-autonym`).should(`have.text`, `—`)

    // Cross-References: unidirectional relation
    cy.get(`#cross-references dt`).should(`have.text`, `deverbal from:`)
    cy.get(`#cross-references dd`).should(`have.text`, `wo'oteeneihi`)

    // Tags
    cy.get(`#tags`).children()
    .should(`have.length`, 1)
    .first()
    .should(`have.text`, `deverbal`)

  })

  it(`Lexeme Details: Chitimacha: cuw‑`, function() {

    const chitiVerbID = `abc56564-5754-4698-845c-2ea32a760bbd`

    cy.visit(`/`)
    cy.setCookie(msAuthCookie, `owner@digitallinguistics.io`)
    cy.visit(`/languages/${ chitimachaLanguageID }/lexemes/${ chitiVerbID }`)

    cy.contains(`#lemma`, `cuw‑`)
    cy.contains(`#lemma`, `čuw‑`)
    cy.contains(`#lemma`, `t͡ʃuw‑`)

    // Citation Form (with data)
    cy.contains(`#citation-form`, `cuyi`)
    cy.contains(`#citation-form`, `čuyi`)
    cy.contains(`#citation-form`, `t͡ʃuji`)

  })

  it(`Lexeme Details: Chitimacha: hi-`, function() {

    const lexemeID = `6a7915d6-085f-46f8-98ba-6555d761a943`

    cy.visit(`/`)
    cy.setCookie(msAuthCookie, `owner@digitallinguistics.io`)
    cy.visit(`/languages/${ chitimachaLanguageID }/lexemes/${ lexemeID }#metadata`)

    // Cross-References
    cy.get(`#cross-references`).children()
    .filter(`dt`)
    .should(`have.length`, 2)
    .then(([a, b]) => {
      expect(a).to.have.text(`compare:`)
      expect(b).to.have.text(`see also:`)
    })

    cy.get(`#cross-references`).children()
    .filter(`dd`)
    .then(([a, b]) => {
      expect(a).to.have.text(`ci‑, pe‑`)
      expect(b).to.have.text(`qix‑`)
    })

  })

  it(`Lexeme Details: Menominee: ‑ænææ‑`, function() {

    const lexemeID = `8951aed1-0531-40d9-8d9d-496858c79978`

    cy.visit(`/languages/${ menomineeLanguageID }/lexemes/${ lexemeID }#metadata`)
    cy.get(`.note-count`).should(`have.text`, `(1)`)
    cy.get(`.note__source`).should(`have.text`, `MAM`)
    cy.get(`.note__text`).should(`include.text`, `Not explicit`)

  })

  it(`Lexeme Details: Menominee: peN`, function() {

    const lexemeID = `99c7f697-2613-437a-b729-f612dd0045a0`

    cy.visit(`/languages/${ menomineeLanguageID }/lexemes/${ lexemeID }#metadata`)

    // Cross-References
    cy.get(`#cross-references`)
    .children()
    .then(([a, b]) => {
      expect(a).to.have.text(`TI:`)
      expect(b).to.have.text(`petoo`)
    })

  })

  it(`Lexeme Details: Plains Cree: cīkahikan`, function() {

    const { data } = this

    cy.visit(`/languages/${ publicLanguageID }/lexemes/${ data.id }`)

    // page title
    cy.title().should(`eq`, `Oxalis | ${ data.lemma.SRO }`)

    // SUMMARY
    cy.contains(`.page-title`, data.lemma.SRO)
    cy.contains(`.header`, data.senses[0].gloss)
    cy.get(`.header .language`).should(`have.text`, `Plains Cree | nêhiyawêwin`)

    // FORM TAB (default)
    cy.hash().should(`eq`, ``)
    cy.get(`#form`).should(`be.visible`)

    // Lemma
    cy.contains(`#lemma`, data.lemma.SRO)
    cy.contains(`#lemma`, data.lemma.syllabics)

    // Citation Form (without data; see below for test with data)
    cy.contains(`#citation-form`, `—`)

    // Morph Type
    cy.contains(`#morph-type`, `stem`)

    // MEANING TAB
    cy.get(`#meaning-link`).click()
    cy.hash().should(`eq`, `#meaning`)
    cy.get(`#meaning`).should(`be.visible`)
    cy.get(`#form`).should(`not.be.visible`)

    // METADATA TAB
    cy.get(`#metadata-link`).click()
    cy.hash().should(`eq`, `#metadata`)
    cy.get(`#metadata`).should(`be.visible`)
    cy.get(`#meaning`).should(`not.be.visible`)

    // Language Details
    cy.get(`#language-name`).should(`include.text`, `Plains Cree`)
    cy.get(`#language-autonym`).should(`include.text`, `nêhiyawêwin`)

    // Metadata Properties
    cy.get(`#url`).should(`have.text`, data.link)
    cy.get(`#date-created`).should(`have.text`, new Date(data.dateCreated).toLocaleDateString(`en-CA`))
    cy.get(`#date-modified`).should(`have.text`, new Date(data.dateModified).toLocaleDateString(`en-CA`))

    // Tags
    cy.get(`#tags`).children()
    .should(`have.length`, Object.keys(data.tags).length)
    .then(([a, b, c, d, e]) => {
      expect(a).to.have.text(`checked: yes`)
      expect(b).to.have.text(`elicited`)
      expect(c).to.have.text(`irregular: false`)
      expect(d).to.have.text(`preverbs: 0`)
      expect(e).to.have.text(`syllables: 4`)
    })

    // Bibliography
    cy.get(`#references ul`).children()
    .should(`have.length`, data.bibliography.length)
    .then(([a, b, c, d]) => {
      expect(a).to.contain(`Bloomfield`)
      expect(b).to.contain(`Goddard`)
      expect(c).to.contain(`Macaulay`)
      expect(d).to.contain(`Wolvengrey`)
    })

  })

})
