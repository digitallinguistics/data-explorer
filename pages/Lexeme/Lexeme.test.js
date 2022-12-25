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

          // SENSES

          cy.get(`#meaning-link`).click()
          cy.get(`.senses-list`).children().should(`have.length`, lexeme.senses.length)

          // SENSE

          const [sense] = lexeme.senses

          // Gloss
          cy.get(`#sense-${ sense.id }__gloss`).should(`contain.text`, sense.gloss.eng)

          // Category
          cy.get(`#sense-${ sense.id }__category`)
          .should(`contain.text`, sense.category.abbreviation)
          .should(`have.attr`, `title`, sense.category.name.eng)

          // Semantic Class
          cy.get(`#sense-${ sense.id }__semantic-class`)
          .should(`contain.text`, sense.semanticClass.abbreviation)
          .should(`have.attr`, `title`, sense.semanticClass.name.eng)

          // Inflection Class
          cy.get(`#sense-${ sense.id }__inflection-class`)
          .should(`contain.text`, sense.inflectionClass.abbreviation)
          .should(`have.attr`, `title`, sense.inflectionClass.name.eng)

          // Base Category
          cy.get(`#sense-${ sense.id }__base-category`)
          .should(`contain.text`, sense.baseCategory.abbreviation)
          .should(`have.attr`, `title`, sense.baseCategory.name.eng)

        })

      })

    })

  })

  it(`empty lexeme`)

  it(`private projects`)

})
