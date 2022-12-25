import prepareTranscription from '../../utilities/prepareTranscription.js'
import yamlParser           from 'js-yaml'

import Language from '../../models/Language.js'
import Lexeme   from '../../models/Lexeme.js'

const msAuthCookie = Cypress.env(`msAuthCookie`)
const msAuthUser   = Cypress.env(`msAuthUser`)

describe.only(`Lexeme`, function() {

  it(`Not Found`, function() {

    const badID    = `bad-id`
    const language = new Language({ id: `642ca288-3e38-4f16-8789-1506028d13b4` })

    cy.addOne(language)

    cy.visit(`/languages/${ language.id }/lexemes/${ badID }`, { failOnStatusCode: false })
    cy.contains(`.page-title`, `404: Item Not Found`)
    cy.contains(`.error-message`, `No lexeme exists with ID ${ badID }.`)

  })

  it(`Unauthenticated`, function() {

    const language = new Language({ id: `35ba99b6-9e81-4052-8e8f-148b814b57f3` })
    const lexeme   = new Lexeme({
      id:       `1a3ca796-dfce-4688-9e93-f736a228d176`,
      language: {
        id: language.id,
      },
      permissions: {
        public: false,
      },
    })

    cy.addOne(language)
    cy.addOne(lexeme)

    cy.visit(`/languages/${ language.id }/lexemes/${ lexeme.id }`, { failOnStatusCode: false })
    cy.contains(`.page-title`, `401: Unauthenticated`)
    cy.contains(`.error-message`, `You must be logged in to view this lexeme.`)

  })

  it(`Unauthorized`, function() {

    const language = new Language({ id: `35ba99b6-9e81-4052-8e8f-148b814b57f3` })
    const lexeme = new Lexeme({
      id:       `1a3ca796-dfce-4688-9e93-f736a228d176`,
      language: {
        id: language.id,
      },
      permissions: {
        public: false,
      },
    })

    cy.addOne(language)
    cy.addOne(lexeme)

    cy.visit(`/`)
    cy.setCookie(msAuthCookie, msAuthUser)
    cy.visit(`/languages/${ language.id }/lexemes/${ lexeme.id }`, { failOnStatusCode: false })
    cy.contains(`.page-title`, `403: Unauthorized`)
    cy.contains(`.error-message`, `You do not have permission to view this lexeme.`)

  })

  it.only(`Lexeme Details`, function() {

    cy.readFile(`data/language.yml`)
    .then(yaml => yamlParser.load(yaml))
    .then(language => {

      cy.readFile(`data/lexeme.yml`)
      .then(yaml => yamlParser.load(yaml))
      .then(lexeme => {

        cy.readFile(`data/project.yml`)
        .then(yaml => yamlParser.load(yaml))
        .then(project => {

          cy.addOne(language)
          cy.addOne(lexeme)
          cy.addOne(project)
          cy.visit(`/languages/${ language.id }/lexemes/${ lexeme.id }`)

          // HEADER

          // Headword
          cy.contains(`.headword`, prepareTranscription(lexeme.lemma.transcription.Modern))

          // Language
          cy.contains(`.language`, `${ language.name.eng } | ${ language.autonym.Modern }`)

          // FORMS

          // Lemma
          for (const ortho in lexeme.lemma.transcription) {
            cy.contains(`#lemma dt`, ortho)
            cy.contains(`#lemma dd`, prepareTranscription(lexeme.lemma.transcription[ortho]))
          }

          // Citation Form
          for (const ortho in lexeme.citationForm) {
            cy.contains(`#citation-form dt`, ortho)
            cy.contains(`#citation-form dd`, prepareTranscription(lexeme.citationForm[ortho]))
          }

          // Morph Type
          cy.contains(`#morph-type`, lexeme.morphType.eng)

          // Slot
          cy.contains(`#slot`, lexeme.slot.eng)

          // Base Forms
          cy.get(`.forms-list`).children().should(`have.length`, lexeme.forms.length)

          // FORM

          const [form] = lexeme.forms

          // Summary
          const summary = `#${ form.id } summary`

          for (const ortho in form.transcription) {
            cy.contains(summary, ortho)
            cy.contains(summary, prepareTranscription(form.transcription[ortho]))
          }

          // Abstract Form
          cy.get(`#form-${ form.id }__abstract`).should(`be.checked`)

          // Unattested
          cy.get(`#form-${ form.id }__unattested`).should(`be.checked`)

          // Allomorphs
          const allomorphsID = `#form-${ form.id }__allomorphs`

          cy.get(allomorphsID).children()
          .should(`have.length`, form.allomorphs.length)

          const firstAllomorph = `${ allomorphsID } .allomorph:first-child`

          cy.contains(firstAllomorph, prepareTranscription(form.allomorphs[0].transcription.Modern))
          cy.contains(firstAllomorph, prepareTranscription(form.allomorphs[0].environments[0]))

          // Components
          cy.get(`#form-${ form.id }__components`).children()
          .should(`have.length`, form.components.length)
          .then(([a, b]) => {
            expect(a).to.contain.text(prepareTranscription(form.components[0].transcription.Modern))
            expect(b).to.contain.text(prepareTranscription(`*${ form.components[1].transcription.Modern }`))
          })

          // Component Of
          cy.get(`#form-${ form.id }__component-of`).children()
          .should(`have.length`, form.componentOf.length)
          .then(([a, b]) => {
            expect(a).to.contain.text(prepareTranscription(form.componentOf[0].transcription.Modern))
            expect(b).to.contain.text(prepareTranscription(`*${ form.componentOf[1].transcription.Modern }`))
          })

          // Etymology
          cy.get(`#form-${ form.id }__etymology`).children()
          .should(`have.length`, form.etymology.length + form.etymology.length - 1)
          .then(([a, , c]) => {
            expect(a).to.contain.text(prepareTranscription(`*${ form.etymology[0].transcription.APA }`))
            expect(a).to.contain.text(form.etymology[0].language.abbreviation)
            expect(c).to.contain.text(prepareTranscription(`*${ form.etymology[1].transcription.APA }`))
            expect(c).to.contain.text(form.etymology[1].language.abbreviation)
          })

          // Reflexes
          cy.get(`#form-${ form.id }__reflexes`).children()
          .should(`have.length`, form.reflexes.length)
          .then(([a, b]) => {
            expect(a).to.contain.text(prepareTranscription(form.reflexes[0].transcription.Modern))
            expect(a).to.contain.text(form.reflexes[0].language.abbreviation)
            expect(b).to.contain.text(prepareTranscription(form.reflexes[1].transcription.Modern))
            expect(b).to.contain.text(form.reflexes[1].language.abbreviation)
          })

          // References
          cy.get(`#form-${ form.id }__references ul`).children()
          .should(`have.length`, form.bibliography.length)
          .then(([a, b]) => {
            expect(a).to.contain.text(form.bibliography[0].citation)
            expect(b).to.contain.text(form.bibliography[1].citation)
          })

          // Sources
          cy.get(`#form-${ form.id }__sources`).children()
          .should(`have.length`, form.sources.length)
          .then(([a, b]) => {
            expect(a).to.contain.text(form.sources[0].abbreviation)
            expect(b).to.contain.text(form.sources[1].abbreviation)
          })

        })

      })

    })

  })

  it(`empty lexeme`)

  it(`private projects`)

})


describe(`Lexeme page (OLD)`, function() {

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
    const formID   = `8497d64d-1427-41ee-a165-ffb3b987f731`

    cy.visit(`/languages/${ arapahoLanguageID }/lexemes/${ lexemeID }`)

    // FORMS

    // Abstract Form
    cy.get(`#form-${ formID }__abstract`).should(`not.be.checked`)

    // Form Sources
    cy.get(`#form-${ formID }__sources`).children()
    .should(`have.length`, 2)
    .then(([a, b]) => {
      expect(a).to.have.text(`PM`)
      expect(b).to.have.text(`KW`)
    })

    // SENSES

    cy.get(`#meaning-link`).click()

    cy.get(`.sense__inflection-class`)
    .should(`have.text`, `TA`)

    // METADATA

    cy.get(`#metadata-link`).click()

    // Lexeme Sources
    cy.get(`#lexeme-sources`).children()
    .should(`have.length`, 2)
    .then(([a, b]) => {
      expect(a).to.have.text(`PM`)
      expect(b).to.have.text(`KW`)
    })

  })

  it(`Lexeme Details: Arapaho: -oh`, function() {

    const lexemeID = `f00de78a-3e58-44ae-a132-69a5fc6e951c`
    const formID   = `4aa45b62-05eb-412d-a789-510f99530ed8`
    const senseID  = `a23cdfb8-0ef9-4e5b-bee4-2261a27bae05`

    cy.visit(`/languages/${ arapahoLanguageID }/lexemes/${ lexemeID }`)

    // FORMS

    // Etymology
    cy.get(`#form-${ formID }__etymology`).should(`have.text`, `PAlg: *‑ahw → PA: *‑ahw`)

    // MEANING

    cy.get(`#meaning-link`).click()

    // Semantic Class
    cy.get(`#sense-${ senseID }__semantic-class dd`).should(`have.text`, `abstract`)

  })

  it(`Lexeme Details: Arapaho: -tii`, function() {

    const lexemeID = `365e8f6f-775a-4e07-ac33-914e65dfad5f`
    const formID   = `7db2aa28-536c-42a6-970f-d98258f31cb6`

    cy.visit(`/languages/${ arapahoLanguageID }/lexemes/${ lexemeID }`)

    // Abstract Form
    cy.get(`#form-${ formID }__abstract`).should(`be.checked`)

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

    // Base Forms
    cy.get(`.forms-section .section-header`).should(`have.text`, `Base Forms (2)`)
    cy.get(`.forms-list`).children()
    .should(`have.length`, 2)
    .then(([a, b]) => {
      expect(a).to.include.text(`cuw‑`) // non-breaking hyphen
      expect(b).to.include.text(`dut‑`) // non-breaking hyphen
    })

  })

  it(`Lexeme Details: Chitimacha: hi-`, function() {

    const lexemeID = `6a7915d6-085f-46f8-98ba-6555d761a943`
    const senseID  = `f6c0f4a9-191a-49b1-a910-7189090cf0f3`
    const data     = this.lexemes.find(lex => lex.id === lexemeID)

    cy.visit(`/`)
    cy.setCookie(msAuthCookie, `owner@digitallinguistics.io`)
    cy.visit(`/languages/${ chitimachaLanguageID }/lexemes/${ lexemeID }#meaning`)

    // SENSES

    // Senses List

    cy.get(`.senses-list`).children()
    .should(`have.length`, data.senses.length)
    .then(([a, b, c]) => {
      expect(a).to.include.text(`COP(NEUT)`)
      expect(b).to.include.text(`AUX(NEUT)`)
      expect(c).to.include.text(`be equal`)
    })

    const [sense] = data.senses

    cy.get(`#${ senseID }`).within(() => {
      cy.get(`#sense-${ senseID }__gloss`).should(`include.text`, sense.gloss.eng)
      cy.get(`#sense-${ senseID }__category`).should(`include.text`, sense.category.abbreviation)
      cy.get(`#sense-${ senseID }__base-category`).should(`include.text`, `—`)
    })

    // METADATA

    cy.get(`#metadata-link`).click()

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

  it(`Lexeme Details: Menominee: ‑a·n`, function() {

    const lexemeID = `99d2e994-8d18-424e-9d84-31de57256204`
    const formID   = `1abb5ad4-cc63-4d52-b079-816841d0e60f`

    cy.visit(`/languages/${ menomineeLanguageID }/lexemes/${ lexemeID }`)

    // Component Of
    cy.get(`#form-${ formID }__component-of`).first().should(`have.text`, `wa·nɛhka·n‑`) // non-breaking hyphen

  })

  it(`Lexeme Details: Menominee: ‑ænææ‑`, function() {

    const lexemeID = `8951aed1-0531-40d9-8d9d-496858c79978`

    cy.visit(`/languages/${ menomineeLanguageID }/lexemes/${ lexemeID }#metadata`)

    // Lexeme Notes
    cy.get(`.notes-section .summary-count`).should(`have.text`, `(1)`)
    cy.get(`.note__source`).should(`have.text`, `MAM`)
    cy.get(`.note__text`).should(`include.text`, `Not explicit`)

  })

  it(`Lexeme Details: Menominee: -ehk`, function() {

    const lexemeID = `ba728ea4-c0d3-4b74-816d-eedf086e32fd`

    cy.visit(`/languages/${ menomineeLanguageID }/lexemes/${ lexemeID }`)

    // Allomorphs
    cy.contains(`.allomorph dd`, `‑eck‑`) // non-breaking hyphens

    cy.get(`.environment`)
    .then(([a, b]) => {
      expect(a).to.have.text(`_V`)
      expect(b).to.have.text(`_N`)
    })

  })

  it(`Lexeme Details: Menominee: peN`, function() {

    const lexemeID = `99c7f697-2613-437a-b729-f612dd0045a0`

    cy.visit(`/languages/${ menomineeLanguageID }/lexemes/${ lexemeID }#metadata`)

    // Cross-References
    cy.get(`#cross-references`)
    .children()
    .then(([a, b]) => {
      expect(a).to.have.text(`TI:`)
      expect(b).to.have.text(`‑petoo`) // non-breaking hyphen
    })

  })

  it(`Lexeme Details: Menominee: wa·nɛhka·n‑`, function() {

    const lexemeID = `1fbfe299-2aa6-467c-b562-a0e22876a552`
    const formID   = `957c76d3-90fb-4325-99f6-2e9e28ee248c`

    cy.visit(`/languages/${ menomineeLanguageID }/lexemes/${ lexemeID }`)

    // Form Components
    cy.get(`#form-${ formID }__components`).should(`have.text`, `‑a·n`) // non-breaking hyphen

  })

  it(`Lexeme Details: Plains Cree: cīkahikan`, function() {

    const { data } = this

    cy.visit(`/languages/${ publicLanguageID }/lexemes/${ data.id }`)

    // page title
    cy.title().should(`eq`, `Oxalis | ${ data.lemma.transcription.SRO }`)

    // SUMMARY
    cy.contains(`.page-title`, data.lemma.transcription.SRO)
    cy.contains(`.header`, data.senses[0].gloss.eng)
    cy.get(`.header .language`).should(`have.text`, `Plains Cree | nêhiyawêwin`)

    // FORM TAB (default)
    cy.hash().should(`eq`, ``)
    cy.get(`#forms`).should(`be.visible`)

    // Lemma
    cy.contains(`#lemma`, data.lemma.transcription.SRO)
    cy.contains(`#lemma`, data.lemma.transcription.syllabics)

    // Citation Form (without data; see below for test with data)
    cy.contains(`#citation-form`, `—`)

    // Morph Type
    cy.contains(`#morph-type`, `stem`)

    // Forms List
    cy.get(`.forms-list`).children().should(`have.length`, 1)

    // FORM

    const [form] = data.forms

    cy.get(`.forms-list`).first().within(() => {

      cy.get(`.form__transcription`).should(`include.text`, form.transcription.SRO.replace(`-`, `‑`))
      cy.get(`#form-${ form.id }__references .tags-list`).children()
      .should(`have.length`, 3)
      .then(([a, b, c]) => {
        expect(a).to.include.text(`Bloomfield`)
        expect(b).to.include.text(`Goddard`)
        expect(c).to.include.text(`Wolvengrey`)
      })

    })

    // MEANING TAB
    cy.get(`#meaning-link`).click()
    cy.hash().should(`eq`, `#meaning`)
    cy.get(`#meaning`).should(`be.visible`)
    cy.get(`#forms`).should(`not.be.visible`)

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
    cy.get(`#lexeme-references ul`).children()
    .should(`have.length`, data.bibliography.length)
    .then(([a, b, c, d]) => {
      expect(a).to.contain(`Bloomfield`)
      expect(b).to.contain(`Goddard`)
      expect(c).to.contain(`Macaulay`)
      expect(d).to.contain(`Wolvengrey`)
    })

  })

  it(`Lexeme Details: Proto-Algic: -ahw`, function() {

    const lexemeID             = `b9a0edc6-59d1-44bd-a3e7-e226d0a33e5d`
    const protoAlgicLanguageID = `2f8c9c1d-b08b-4b51-a016-b65a90eb8af8`
    const formID               = `d9da9f62-803e-490a-927e-efaa1eef9f0f`

    cy.visit(`/languages/${ protoAlgicLanguageID }/lexemes/${ lexemeID }`)

    // Header Lemma (Unattested)
    cy.get(`.page-title`).should(`have.text`, `*‑ahw`)

    // Unattested
    cy.get(`#form-${ formID }__unattested`).should(`be.checked`)

    // Reflexes
    cy.get(`#form-${ formID }__reflexes`).children()
    .should(`have.length`, 2)
    .then(([a, b]) => {
      expect(a).to.have.text(`PA: ‑ahw, `) // non-breaking hyphen
      expect(b).to.have.text(`arp: ‑oh`) // non-breaking hyphen
    })

  })

})
